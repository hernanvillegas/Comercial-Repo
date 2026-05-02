import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Venta }            from './entities/venta.entity';
import { CreateVentaDto }   from './dto/create-venta.dto';
import { UpdateVentaDto }   from './dto/update-venta.dto';
import { FilterVentaDto }   from './dto/filter-venta.dto';
import { Producto }         from 'src/producto/entities/producto.entity';
import { DetalleMoto }      from 'src/detalle-moto/entities/detalle-moto.entity';
import { HistorialCliente } from 'src/historial_cliente/entities/historial_cliente.entity';
import { MovimientoCaja }   from 'src/movimiento-caja/entities/movimiento-caja.entity';
import { PaginationDto }    from 'src/common/dto/paginacion.dto';
import { TipoProducto, EstadoMoto, EstadoCuota } from 'src/common/enums';

@Injectable()
export class VentasService {

    private readonly logger = new Logger('VentasService');

    constructor(
        @InjectRepository(Venta)
        private ventasRepository: Repository<Venta>,

        @InjectRepository(Producto)
        private productoRepository: Repository<Producto>,

        @InjectRepository(DetalleMoto)
        private detalleMotoRepository: Repository<DetalleMoto>,

        @InjectRepository(HistorialCliente)
        private historialRepository: Repository<HistorialCliente>,

        @InjectRepository(MovimientoCaja)
        private movimientosRepository: Repository<MovimientoCaja>,

        private readonly dataSource: DataSource,
    ) {}

    // ── Número de factura sin colisiones ──────────────────────────────────────

    /**
     * Genera el siguiente número de factura garantizado único.
     * Consulta cuántas ventas existen hoy y usa ese conteo como correlativo.
     * Formato: VT-YYYYMMDD-NNN  (ej: VT-20260429-003)
     */
    async generarSiguienteNumeroFactura(): Promise<{ numeroFactura: string }> {
        const hoy      = new Date();
        const fechaStr = hoy.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
        const prefijo  = `VT-${fechaStr}-`;

        const count = await this.ventasRepository
            .createQueryBuilder('venta')
            .where('venta.numeroFactura LIKE :prefijo', { prefijo: `${prefijo}%` })
            .getCount();

        const siguiente    = String(count + 1).padStart(3, '0');
        const numeroFactura = `${prefijo}${siguiente}`;

        return { numeroFactura };
    }

    // ── Crear venta ───────────────────────────────────────────────────────────

    async create(createVentaDto: CreateVentaDto): Promise<Venta> {
        if (createVentaDto.entradaInicial && createVentaDto.entradaInicial < 1000)
            throw new BadRequestException('La entrada inicial debe ser mayor a 1000');

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            if (createVentaDto.idProductoFk) {
                await this.validarYDescontarStock(
                    createVentaDto.idProductoFk,
                    queryRunner,
                );
            }

            const venta         = this.ventasRepository.create(createVentaDto);
            const ventaGuardada = await queryRunner.manager.save(venta);

            await this.actualizarHistorialCliente(createVentaDto.idClienteFk, queryRunner);
            await this.registrarMovimientoCajaInicial(createVentaDto, ventaGuardada.idVenta, queryRunner);

            await queryRunner.commitTransaction();
            return ventaGuardada;

        } catch (error: any) {
            await queryRunner.rollbackTransaction();

            if (error.code === '23505')
                throw new BadRequestException('El número de factura ya existe');

            if (error instanceof BadRequestException || error instanceof NotFoundException)
                throw error;

            this.logger.error(error);
            throw new InternalServerErrorException('Error al crear la venta, intenta de nuevo');

        } finally {
            await queryRunner.release();
        }
    }

    // ── Helpers privados ──────────────────────────────────────────────────────

    private async registrarMovimientoCajaInicial(
        dto: CreateVentaDto,
        idVenta: string,
        queryRunner: any,
    ): Promise<void> {
        const esCredito = dto.tipoVenta === 'credito';

        if (esCredito && (!dto.entradaInicial || dto.entradaInicial <= 0)) return;

        const monto     = esCredito ? dto.entradaInicial! : dto.precioTotal;
        const categoria = esCredito ? 'entrada_inicial' : 'venta_contado';
        const concepto  = esCredito
            ? `Entrada inicial - Factura ${dto.numeroFactura}`
            : `Venta contado - Factura ${dto.numeroFactura}`;

        const movimiento = this.movimientosRepository.create({
            idVentaFk:      idVenta,
            montoPago:      monto,
            tipoMovimiento: 'ingreso',
            categoria,
            conceptoPago:   concepto,
            metodoPago:     dto.metodoPago ?? 'efectivo',
            numeroRecibo:   `REC-${Date.now()}`,
            idEmpleadoFk:   dto.idEmpleadoFk,
            fechaPago:      new Date(),
        });

        await queryRunner.manager.save(movimiento);
    }

    private async validarYDescontarStock(
        idProducto: string,
        queryRunner: any,
    ): Promise<void> {
        const producto = await this.productoRepository.findOneBy({ id: idProducto });

        if (!producto)
            throw new NotFoundException(`Producto con ID ${idProducto} no encontrado`);

        if (producto.tipo_producto === TipoProducto.SERVICIO) return;

        if (producto.stock !== null && producto.stock <= 0)
            throw new BadRequestException(
                `El producto "${producto.nombre_producto}" no tiene stock disponible`,
            );

        if (producto.stock !== null) {
            producto.stock -= 1;
            if (producto.stock <= 0) producto.disponible = false;
            await queryRunner.manager.save(producto);
        }

        if (producto.tipo_producto === TipoProducto.MOTO) {
            const detalle = await this.detalleMotoRepository.findOneBy({ idProductoFk: idProducto });
            if (detalle) {
                detalle.estado_moto = EstadoMoto.VENDIDO;
                detalle.fecha_venta = new Date();
                await queryRunner.manager.save(detalle);
            }
        }
    }

    private async actualizarHistorialCliente(
        idCliente: number,
        queryRunner: any,
    ): Promise<void> {
        const historial = await this.historialRepository.findOneBy({ idClienteFk: idCliente });

        if (historial) {
            historial.fecha_ultima_compra = new Date();
            historial.total_compras       = (historial.total_compras || 0) + 1;
            await queryRunner.manager.save(historial);
        } else {
            const nuevo = this.historialRepository.create({
                idClienteFk:         idCliente,
                fecha_compra:        new Date(),
                fecha_ultima_compra: new Date(),
                total_compras:       1,
            });
            await queryRunner.manager.save(nuevo);
        }
    }

    // ── Consultas ─────────────────────────────────────────────────────────────

    async findAll(paginationDto: PaginationDto): Promise<Venta[]> {
        const { limit = 20, offset = 0 } = paginationDto;
        return await this.ventasRepository.find({
            relations: ['empleados', 'cliente', 'cuotas', 'movimientos', 'detalles'],
            order: { fechaVenta: 'DESC' },
            take: limit,
            skip: offset,
        });
    }

    async findOne(id: string): Promise<Venta> {
        const venta = await this.ventasRepository.findOne({
            where: { idVenta: id },
            relations: [
                'empleados', 'cliente', 'cuotas', 'movimientos',
                'detalles', 'detalles.producto', 'detalles.pack',
            ],
        });

        if (!venta)
            throw new NotFoundException(`Venta con ID ${id} no encontrada`);

        return venta;
    }

    async update(id: string, updateVentaDto: UpdateVentaDto): Promise<Venta> {
        const venta = await this.findOne(id);

        // Si se está anulando una venta que no estaba anulada antes,
        // restauramos el stock y registramos el egreso en caja
        const seEstaAnulando =
            updateVentaDto.estadoVenta === 'anulada' &&
            venta.estadoVenta !== 'anulada';

        if (seEstaAnulando) {
            return await this.anularVenta(venta, updateVentaDto);
        }

        try {
            const ventaActualizada = Object.assign(venta, updateVentaDto);
            return await this.ventasRepository.save(ventaActualizada);
        } catch (error: any) {
            if (error.code === '23505')
                throw new BadRequestException('El número de factura ya existe');
            throw error;
        }
    }

    /**
     * Anula una venta:
     * 1. Restaura el stock de todos los productos vendidos
     * 2. Marca las motos como disponibles nuevamente
     * 3. Registra un egreso en caja por el monto ya cobrado (devolución)
     * 4. Cancela las cuotas pendientes
     */
    private async anularVenta(venta: Venta, updateDto: UpdateVentaDto): Promise<Venta> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // ── 1. Restaurar stock por cada detalle ───────────────────────
            if (venta.detalles?.length) {
                for (const detalle of venta.detalles) {
                    if (!detalle.idProductoFk) continue;

                    const producto = await this.productoRepository.findOneBy({
                        id: detalle.idProductoFk,
                    });
                    if (!producto) continue;

                    // Restaurar stock
                    if (producto.stock !== null) {
                        producto.stock     += detalle.cantidad;
                        producto.disponible = true;
                        await queryRunner.manager.save(producto);
                    }

                    // Si es moto, volver a disponible
                    if (producto.tipo_producto === TipoProducto.MOTO) {
                        const detalleMoto = await this.detalleMotoRepository.findOneBy({
                            idProductoFk: detalle.idProductoFk,
                        });
                        if (detalleMoto) {
                            detalleMoto.estado_moto = EstadoMoto.DISPONIBLE;
                            detalleMoto.fecha_venta = null!;
                            await queryRunner.manager.save(detalleMoto);
                        }
                    }
                }
            }

            // ── 2. Registrar devolución en caja si ya se cobró algo ───────
            const montoYaCobrado = (venta.movimientos ?? [])
                .filter(m => m.tipoMovimiento === 'ingreso')
                .reduce((s, m) => s + Number(m.montoPago), 0);

            if (montoYaCobrado > 0) {
                const devolucion = this.movimientosRepository.create({
                    idVentaFk:      venta.idVenta,
                    montoPago:      montoYaCobrado,
                    tipoMovimiento: 'egreso',
                    categoria:      'devolucion',
                    conceptoPago:   `Anulación venta - Factura ${venta.numeroFactura}`,
                    metodoPago:     'efectivo',
                    numeroRecibo:   `DEV-${Date.now()}`,
                    idEmpleadoFk:   venta.idEmpleadoFk,
                    fechaPago:      new Date(),
                });
                await queryRunner.manager.save(devolucion);
            }

            // ── 3. Cancelar cuotas pendientes ─────────────────────────────
            if (venta.cuotas?.length) {
                for (const cuota of venta.cuotas) {
                    if (cuota.estado !== 'pagada') {
                        cuota.estado = EstadoCuota.CANCELADA as any;
                        await queryRunner.manager.save(cuota);
                    }
                }
            }

            // ── 4. Guardar la venta como anulada ──────────────────────────
            const ventaAnulada = Object.assign(venta, updateDto);
            const resultado    = await queryRunner.manager.save(ventaAnulada);

            await queryRunner.commitTransaction();
            return resultado;

        } catch (error: any) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Error al anular venta:', error);
            throw new InternalServerErrorException('Error al anular la venta, intenta de nuevo');
        } finally {
            await queryRunner.release();
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

        if (filters.estado)
            queryBuilder.andWhere('venta.estadoVenta = :estado', { estado: filters.estado });

        if (filters.tipo)
            queryBuilder.andWhere('venta.tipoVenta = :tipo', { tipo: filters.tipo });

        if (filters.minCuotas !== undefined)
            queryBuilder.andWhere('venta.numeroCuotas >= :minCuotas', { minCuotas: filters.minCuotas });

        if (filters.maxCuotas !== undefined)
            queryBuilder.andWhere('venta.numeroCuotas <= :maxCuotas', { maxCuotas: filters.maxCuotas });

        if (filters.dias) {
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - filters.dias);
            queryBuilder.andWhere('venta.fechaVenta >= :fechaLimite', { fechaLimite });
        }

        if (filters.fechaDesde)
            queryBuilder.andWhere('venta.fechaVenta >= :fechaDesde', { fechaDesde: filters.fechaDesde });

        if (filters.fechaHasta)
            queryBuilder.andWhere('venta.fechaVenta <= :fechaHasta', { fechaHasta: filters.fechaHasta });

        if (filters.precioMin !== undefined)
            queryBuilder.andWhere('venta.precioTotal >= :precioMin', { precioMin: filters.precioMin });

        if (filters.precioMax !== undefined)
            queryBuilder.andWhere('venta.precioTotal <= :precioMax', { precioMax: filters.precioMax });

        if (filters.numeroFactura)
            queryBuilder.andWhere('venta.numeroFactura ILIKE :numeroFactura', {
                numeroFactura: `%${filters.numeroFactura}%`,
            });

        queryBuilder.orderBy('venta.fechaVenta', 'DESC');
        return await queryBuilder.getMany();
    }
}