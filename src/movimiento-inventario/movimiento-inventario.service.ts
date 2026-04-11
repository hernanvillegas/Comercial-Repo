import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovimientoInventario } from './entities/movimiento-inventario.entity';
import { CreateMovimientoInventarioDto } from './dto/create-movimiento-inventario.dto';
import { Producto } from 'src/producto/entities/producto.entity';

@Injectable()
export class MovimientoInventarioService {

    private readonly logger = new Logger('MovimientoInventarioService');

    constructor(
        @InjectRepository(MovimientoInventario)
        private readonly movimientoRepository: Repository<MovimientoInventario>,

        @InjectRepository(Producto)
        private readonly productoRepository: Repository<Producto>,
    ) {}

    async create(createMovimientoInventarioDto: CreateMovimientoInventarioDto) {
        try {
            const producto = await this.productoRepository.findOneBy({
                id: createMovimientoInventarioDto.idProductoFk
            });

            if (!producto)
                throw new NotFoundException(`Producto con ID ${createMovimientoInventarioDto.idProductoFk} no encontrado`);

            // Actualizar stock del producto
            const nuevoStock = (producto.stock || 0) + createMovimientoInventarioDto.cantidad;

            if (nuevoStock < 0)
                throw new BadRequestException(`Stock insuficiente. Stock actual: ${producto.stock}`);

            producto.stock = nuevoStock;
            await this.productoRepository.save(producto);

            const movimiento = this.movimientoRepository.create(createMovimientoInventarioDto);
            return await this.movimientoRepository.save(movimiento);

        } catch (error) {
            this.manejoDBExcepciones(error);
        }
    }

    async findAll() {
        return await this.movimientoRepository.find({
            relations: ['producto', 'venta', 'empleado'],
            order: { fechaMovimiento: 'DESC' }
        });
    }

    async findOne(id: string) {
        const movimiento = await this.movimientoRepository.findOne({
            where: { id },
            relations: ['producto', 'venta', 'empleado']
        });

        if (!movimiento)
            throw new NotFoundException(`Movimiento de inventario con ID ${id} no encontrado`);

        return movimiento;
    }

    async findByProducto(idProducto: string) {
        return await this.movimientoRepository.find({
            where: { idProductoFk: idProducto },
            relations: ['venta', 'empleado'],
            order: { fechaMovimiento: 'DESC' }
        });
    }

    async findWithFilters(filters: any) {
        const queryBuilder = this.movimientoRepository.createQueryBuilder('mov')
            .leftJoinAndSelect('mov.producto', 'producto')
            .leftJoinAndSelect('mov.venta', 'venta')
            .leftJoinAndSelect('mov.empleado', 'empleado');

        if (filters.tipo_movimiento) {
            queryBuilder.andWhere('mov.tipo_movimiento = :tipo', { tipo: filters.tipo_movimiento });
        }

        if (filters.fechaDesde) {
            queryBuilder.andWhere('mov.fechaMovimiento >= :fechaDesde', { fechaDesde: filters.fechaDesde });
        }

        if (filters.fechaHasta) {
            queryBuilder.andWhere('mov.fechaMovimiento <= :fechaHasta', { fechaHasta: filters.fechaHasta });
        }

        queryBuilder.orderBy('mov.fechaMovimiento', 'DESC');

        return await queryBuilder.getMany();
    }

    async remove(id: string) {
        const movimiento = await this.findOne(id);
        await this.movimientoRepository.remove(movimiento);
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
