import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Venta }             from './entities/venta.entity';
import { CreateVentaDto }    from './dto/create-venta.dto';
import { UpdateVentaDto }    from './dto/update-venta.dto';
import { FilterVentaDto }    from './dto/filter-venta.dto';
import { Producto }          from 'src/producto/entities/producto.entity';
import { DetalleMoto }       from 'src/detalle-moto/entities/detalle-moto.entity';
import { HistorialCliente }  from 'src/historial_cliente/entities/historial_cliente.entity';

@Injectable()
export class VentasService {

    constructor(
        @InjectRepository(Venta)
        private ventasRepository: Repository<Venta>,

        // NUEVO: para validar stock y actualizar estado moto
        @InjectRepository(Producto)
        private productoRepository: Repository<Producto>,

        @InjectRepository(DetalleMoto)
        private detalleMotoRepository: Repository<DetalleMoto>,

        // NUEVO: para actualizar historial del cliente
        @InjectRepository(HistorialCliente)
        private historialRepository: Repository<HistorialCliente>,
    ) {}

    async create(createVentaDto: CreateVentaDto): Promise<Venta> {
        try {
            if (createVentaDto.entradaInicial && createVentaDto.entradaInicial < 1000) {
                throw new BadRequestException('La entrada inicial debe ser mayor a 1000');
            }

            // ── NUEVO: validar stock del producto si viene idProductoFk ───
            // (ventas directas sin carrito siguen pasando por aquí)
            if ((createVentaDto as any).idProductoFk) {
                await this.validarYDescontarStock((createVentaDto as any).idProductoFk);
            }

            const venta = this.ventasRepository.create(createVentaDto);
            const ventaGuardada = await this.ventasRepository.save(venta);

            // ── NUEVO: actualizar historial del cliente ────────────────────
            await this.actualizarHistorialCliente(createVentaDto.idClienteFk);

            return ventaGuardada;

        } catch (error) {
            if (error.code === '23505') {
                throw new BadRequestException('El número de factura ya existe');
            }
            throw error;
        }
    }

    // ── NUEVO: valida stock y descuenta si aplica ─────────────────────────
    private async validarYDescontarStock(idProducto: string): Promise<void> {
        const producto = await this.productoRepository.findOneBy({ id: idProducto });

        if (!producto)
            throw new NotFoundException(`Producto con ID ${idProducto} no encontrado`);

        // Servicios no tienen stock físico
        if (producto.tipo_producto === 'servicio') return;

        if (producto.stock !== null && producto.stock <= 0) {
            throw new BadRequestException(
                `El producto "${producto.nombre_producto}" no tiene stock disponible`
            );
        }

        // Descontar stock
        if (producto.stock !== null) {
            producto.stock = producto.stock - 1;
            await this.productoRepository.save(producto);
        }

        // Si es moto, marcar como vendida en detalle_moto
        if (producto.tipo_producto === 'moto') {
            const detalle = await this.detalleMotoRepository.findOneBy({ idProductoFk: idProducto });
            if (detalle) {
                detalle.estado_moto = 'vendido';
                detalle.fecha_venta = new Date();
                await this.detalleMotoRepository.save(detalle);
            }
        }
    }

    // ── NUEVO: crea o actualiza historial del cliente ─────────────────────
    private async actualizarHistorialCliente(idCliente: number): Promise<void> {
        const historial = await this.historialRepository.findOneBy({
            idClienteFk: idCliente
        });

        if (historial) {
            historial.fecha_ultima_compra = new Date();
            historial.total_compras       = (historial.total_compras || 0) + 1;
            await this.historialRepository.save(historial);
        } else {
            const nuevo = this.historialRepository.create({
                idClienteFk:       idCliente,
                fecha_compra:       new Date(),
                fecha_ultima_compra: new Date(),
                total_compras:      1,
            });
            await this.historialRepository.save(nuevo);
        }
    }

    async findAll(): Promise<Venta[]> {
        return await this.ventasRepository.find({
            relations: ['empleados', 'cliente', 'cuotas', 'movimientos', 'detalles'],
            order: { fechaVenta: 'DESC' }
        });
    }

    async findOne(id: string): Promise<Venta> {
        const venta = await this.ventasRepository.findOne({
            where: { idVenta: id },
            relations: ['empleados', 'cliente', 'cuotas', 'movimientos', 'detalles', 'detalles.producto', 'detalles.pack']
        });

        if (!venta)
            throw new NotFoundException(`Venta con ID ${id} no encontrada`);

        return venta;
    }

    async update(id: string, updateVentaDto: UpdateVentaDto): Promise<Venta> {
        if (updateVentaDto.entradaInicial && updateVentaDto.entradaInicial < 1000) {
            throw new BadRequestException('La entrada inicial debe ser mayor a 1000');
        }

        const venta = await this.findOne(id);

        try {
            const ventaActualizada = Object.assign(venta, updateVentaDto);
            return await this.ventasRepository.save(ventaActualizada);
        } catch (error) {
            if (error.code === '23505') {
                throw new BadRequestException('El número de factura ya existe');
            }
            throw error;
        }
    }

    async remove(id: string): Promise<void> {
        const venta = await this.findOne(id);
        await this.ventasRepository.remove(venta);
    }

    async findWithFilters(filters: FilterVentaDto): Promise<Venta[]> {
        const queryBuilder = this.ventasRepository.createQueryBuilder('venta')
            .leftJoinAndSelect('venta.empleados', 'empleado')
            .leftJoinAndSelect('venta.cliente',   'cliente')
            .leftJoinAndSelect('venta.detalles',  'detalles');

        if (filters.estado) {
            queryBuilder.andWhere('venta.estadoVenta = :estado', { estado: filters.estado });
        }
        if (filters.tipo) {
            queryBuilder.andWhere('venta.tipoVenta = :tipo', { tipo: filters.tipo });
        }
        if (filters.minCuotas !== undefined) {
            queryBuilder.andWhere('venta.numeroCuotas >= :minCuotas', { minCuotas: filters.minCuotas });
        }
        if (filters.maxCuotas !== undefined) {
            queryBuilder.andWhere('venta.numeroCuotas <= :maxCuotas', { maxCuotas: filters.maxCuotas });
        }
        if (filters.dias) {
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - filters.dias);
            queryBuilder.andWhere('venta.fechaVenta >= :fechaLimite', { fechaLimite });
        }
        if (filters.fechaDesde) {
            queryBuilder.andWhere('venta.fechaVenta >= :fechaDesde', { fechaDesde: filters.fechaDesde });
        }
        if (filters.fechaHasta) {
            queryBuilder.andWhere('venta.fechaVenta <= :fechaHasta', { fechaHasta: filters.fechaHasta });
        }
        if (filters.precioMin !== undefined) {
            queryBuilder.andWhere('venta.precioTotal >= :precioMin', { precioMin: filters.precioMin });
        }
        if (filters.precioMax !== undefined) {
            queryBuilder.andWhere('venta.precioTotal <= :precioMax', { precioMax: filters.precioMax });
        }
        if (filters.numeroFactura) {
            queryBuilder.andWhere('venta.numeroFactura ILIKE :numeroFactura', {
                numeroFactura: `%${filters.numeroFactura}%`
            });
        }

        queryBuilder.orderBy('venta.fechaVenta', 'DESC');
        return await queryBuilder.getMany();
    }
}
