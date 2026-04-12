import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Venta }            from './entities/venta.entity';
import { CreateVentaDto }   from './dto/create-venta.dto';
import { UpdateVentaDto }   from './dto/update-venta.dto';
import { FilterVentaDto }   from './dto/filter-venta.dto';
import { Producto }         from 'src/producto/entities/producto.entity';
import { DetalleMoto }      from 'src/detalle-moto/entities/detalle-moto.entity';
import { HistorialCliente } from 'src/historial_cliente/entities/historial_cliente.entity';
import { PaginationDto }    from 'src/common/dto/paginacion.dto';
import { TipoProducto, EstadoMoto } from 'src/common/enums';

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

        private readonly dataSource: DataSource,
    ) {}

    async create(createVentaDto: CreateVentaDto): Promise<Venta> {
        if (createVentaDto.entradaInicial && createVentaDto.entradaInicial < 1000)
            throw new BadRequestException('La entrada inicial debe ser mayor a 1000');

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            if ((createVentaDto as any).idProductoFk) {
                await this.validarYDescontarStock(
                    (createVentaDto as any).idProductoFk,
                    queryRunner
                );
            }

            const venta = this.ventasRepository.create(createVentaDto);
            const ventaGuardada = await queryRunner.manager.save(venta);

            await this.actualizarHistorialCliente(createVentaDto.idClienteFk, queryRunner);

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

    private async validarYDescontarStock(
        idProducto: string,
        queryRunner: any
    ): Promise<void> {
        const producto = await this.productoRepository.findOneBy({ id: idProducto });

        if (!producto)
            throw new NotFoundException(`Producto con ID ${idProducto} no encontrado`);

        if (producto.tipo_producto === TipoProducto.SERVICIO) return;

        if (producto.stock !== null && producto.stock <= 0)
            throw new BadRequestException(
                `El producto "${producto.nombre_producto}" no tiene stock disponible`
            );

        if (producto.stock !== null) {
            producto.stock = producto.stock - 1;
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
        queryRunner: any
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
            relations: ['empleados', 'cliente', 'cuotas', 'movimientos', 'detalles', 'detalles.producto', 'detalles.pack']
        });

        if (!venta)
            throw new NotFoundException(`Venta con ID ${id} no encontrada`);

        return venta;
    }

    async update(id: string, updateVentaDto: UpdateVentaDto): Promise<Venta> {
        if (updateVentaDto.entradaInicial && updateVentaDto.entradaInicial < 1000)
            throw new BadRequestException('La entrada inicial debe ser mayor a 1000');

        const venta = await this.findOne(id);

        try {
            const ventaActualizada = Object.assign(venta, updateVentaDto);
            return await this.ventasRepository.save(ventaActualizada);
        } catch (error: any) {
            if (error.code === '23505')
                throw new BadRequestException('El número de factura ya existe');
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
                numeroFactura: `%${filters.numeroFactura}%`
            });

        queryBuilder.orderBy('venta.fechaVenta', 'DESC');
        return await queryBuilder.getMany();
    }
}