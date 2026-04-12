import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Carrito } from './entities/carrito.entity';
import { CarritoDetalle } from './entities/carrito-detalle.entity';
import { AgregarItemCarritoDto } from './dto/carrito.dto';
import { Venta } from 'src/ventas/entities/venta.entity';
import { DetalleVenta } from 'src/detalle-venta/entities/detalle-venta.entity';
import { MovimientoInventario } from 'src/movimiento-inventario/entities/movimiento-inventario.entity';
import { Producto } from 'src/producto/entities/producto.entity';
import { TipoVenta, EstadoVenta } from 'src/common/enums';

@Injectable()
export class CarritoService {

    private readonly logger = new Logger('CarritoService');

    constructor(
        @InjectRepository(Carrito)
        private readonly carritoRepository: Repository<Carrito>,

        @InjectRepository(CarritoDetalle)
        private readonly carritoDetalleRepository: Repository<CarritoDetalle>,

        @InjectRepository(Producto)
        private readonly productoRepository: Repository<Producto>,

        private readonly dataSource: DataSource,
    ) {}

    // Obtiene el carrito activo del cliente o crea uno nuevo
    async obtenerOCrearCarrito(idClienteFk: number) {
        let carrito = await this.carritoRepository.findOne({
            where: { idClienteFk, estado: 'activo' },
            relations: ['items', 'items.producto', 'items.pack', 'cliente']
        });

        if (!carrito) {
            carrito = this.carritoRepository.create({ idClienteFk, estado: 'activo' });
            await this.carritoRepository.save(carrito);
        }

        return carrito;
    }

    async agregarItem(idCliente: number, agregarItemDto: AgregarItemCarritoDto) {
        if (!agregarItemDto.idProductoFk && !agregarItemDto.idPackFk) {
            throw new BadRequestException('Debe especificar idProductoFk o idPackFk');
        }

        try {
            const carrito = await this.obtenerOCrearCarrito(idCliente);

            // Verificar si el item ya existe en el carrito
            const itemExistente = carrito.items?.find(item =>
                (agregarItemDto.idProductoFk && item.idProductoFk === agregarItemDto.idProductoFk) ||
                (agregarItemDto.idPackFk && item.idPackFk === agregarItemDto.idPackFk)
            );

            if (itemExistente) {
                // Sumar cantidad si ya existe
                itemExistente.cantidad += agregarItemDto.cantidad;
                await this.carritoDetalleRepository.save(itemExistente);
            } else {
                const nuevoItem = this.carritoDetalleRepository.create({
                    ...agregarItemDto,
                    idCarritoFk: carrito.id,
                });
                await this.carritoDetalleRepository.save(nuevoItem);
            }

            // Actualizar ultima actividad
            carrito.ultimaActividad = new Date();
            await this.carritoRepository.save(carrito);

            return this.obtenerCarritoCliente(idCliente);

        } catch (error) {
            this.manejoDBExcepciones(error);
        }
    }

    async obtenerCarritoCliente(idCliente: number) {
        const carrito = await this.carritoRepository.findOne({
            where: { idClienteFk: idCliente, estado: 'activo' },
            relations: ['items', 'items.producto', 'items.pack', 'cliente']
        });

        if (!carrito)
            throw new NotFoundException(`No hay carrito activo para el cliente ${idCliente}`);

        // Calcular total
        const total = carrito.items?.reduce((acc, item) => {
            return acc + (Number(item.precio_unitario_snapshot) * item.cantidad);
        }, 0) || 0;

        return { ...carrito, total };
    }

    async eliminarItem(idCarritoDetalle: string) {
        const item = await this.carritoDetalleRepository.findOneBy({ id: idCarritoDetalle });

        if (!item)
            throw new NotFoundException(`Item con ID ${idCarritoDetalle} no encontrado`);

        await this.carritoDetalleRepository.remove(item);
    }

    async vaciarCarrito(idCliente: number) {
        const carrito = await this.obtenerOCrearCarrito(idCliente);
        await this.carritoDetalleRepository.delete({ idCarritoFk: carrito.id });
        return { message: 'Carrito vaciado correctamente' };
    }

    // ── Confirmar carrito → convertir en venta (transacción completa) ─────
    async confirmarCarrito(idCliente: number, datosVenta: {
        numeroFactura: string;
        tipoVenta: string;
        idEmpleadoFk: string;
        descuento?: number;
        numeroCuotas?: number;
        entradaInicial?: number;
        observaciones?: string;
    }) {
        const carrito = await this.obtenerCarritoCliente(idCliente);

        if (!carrito.items || carrito.items.length === 0)
            throw new BadRequestException('El carrito está vacío');

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Calcular totales
            const subtotal = carrito.items.reduce((acc, item) => {
                return acc + (Number(item.precio_unitario_snapshot) * item.cantidad);
            }, 0);

            const descuento   = datosVenta.descuento || 0;
            const precioTotal = subtotal - descuento;

            // 2. Crear la venta
            const venta = new Venta();
            venta.numeroFactura  = datosVenta.numeroFactura;
            venta.tipoVenta      = datosVenta.tipoVenta as TipoVenta;
            venta.idClienteFk    = idCliente;
            venta.idEmpleadoFk   = datosVenta.idEmpleadoFk;
            venta.subtotal       = subtotal;
            venta.descuento      = descuento;
            venta.precioTotal    = precioTotal;
            venta.estadoVenta = datosVenta.tipoVenta === TipoVenta.CREDITO ? EstadoVenta.EN_CREDITO : EstadoVenta.COMPLETADA;
            venta.numeroCuotas   = datosVenta.numeroCuotas ?? null;
            venta.entradaInicial = datosVenta.entradaInicial ?? null;
            venta.observaciones  = datosVenta.observaciones ?? null;

            const ventaCreada = await queryRunner.manager.save(venta);

            // 3. Copiar líneas del carrito a detalle_venta
            for (const item of carrito.items) {
                const nombreSnapshot = item.producto
                    ? item.producto.nombre_producto
                    : item.pack?.nombre_pack || 'Producto';

                const detalle = new DetalleVenta();
                detalle.idVentaFk               = ventaCreada.idVenta;
                detalle.idProductoFk            = item.idProductoFk || null;
                detalle.idPackFk                = item.idPackFk    || null;
                detalle.cantidad                = item.cantidad;
                detalle.precio_unitario         = Number(item.precio_unitario_snapshot);
                detalle.descuento               = 0;
                detalle.subtotal                = Number(item.precio_unitario_snapshot) * item.cantidad;
                detalle.nombre_producto_snapshot = nombreSnapshot;

                await queryRunner.manager.save(detalle);

                // 4. Descontar stock solo si es producto (no servicio, no pack)
                if (item.idProductoFk) {
                    const producto = await this.productoRepository.findOneBy({ id: item.idProductoFk });

                    if (producto && producto.tipo_producto !== 'servicio') {
                        const movimiento = new MovimientoInventario();
                        movimiento.idProductoFk   = item.idProductoFk;
                        movimiento.cantidad       = -item.cantidad;
                        movimiento.tipo_movimiento = 'venta';
                        movimiento.idVentaFk      = ventaCreada.idVenta;
                        movimiento.idEmpleadoFk   = datosVenta.idEmpleadoFk;
                        movimiento.observaciones  = `Venta factura ${datosVenta.numeroFactura}`;

                        await queryRunner.manager.save(movimiento);

                        // Actualizar stock
                        producto.stock = (producto.stock || 0) - item.cantidad;
                        await queryRunner.manager.save(producto);
                    }
                }
            }

            // 5. Eliminar el carrito
            await queryRunner.manager.delete(CarritoDetalle, { idCarritoFk: carrito.id });
            await queryRunner.manager.delete(Carrito, { id: carrito.id });

            await queryRunner.commitTransaction();
            await queryRunner.release();

            return { message: 'Venta creada correctamente', venta: ventaCreada };

        } catch (error) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            this.manejoDBExcepciones(error);
        }
    }

    async findCarritosAbandonados() {
        const hace24h = new Date();
        hace24h.setHours(hace24h.getHours() - 24);

        return await this.carritoRepository
            .createQueryBuilder('carrito')
            .leftJoinAndSelect('carrito.cliente', 'cliente')
            .leftJoinAndSelect('carrito.items', 'items')
            .where('carrito.estado = :estado', { estado: 'activo' })
            .andWhere('carrito.ultimaActividad < :hace24h', { hace24h })
            .getMany();
    }

    private manejoDBExcepciones(error: any) {
        if (error.code === '23505')
            throw new BadRequestException(error.detail);

        if (error.status === 400)
            throw new BadRequestException(error.message || 'Solicitud incorrecta');

        if (error.status === 404)
            throw new NotFoundException(error.message || 'Recurso no encontrado');

        this.logger.error(error);
        throw new InternalServerErrorException('Error inesperado, verifica los registros del Servidor');
    }
}
