import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DetalleVenta }          from './entities/detalle-venta.entity';
import { CreateDetalleVentaDto } from './dto/create-detalle-venta.dto';
import { UpdateDetalleVentaDto } from './dto/update-detalle-venta.dto';
import { Producto }              from 'src/producto/entities/producto.entity';
import { TipoProducto }          from 'src/common/enums';

@Injectable()
export class DetalleVentaService {

    private readonly logger = new Logger('DetalleVentaService');

    constructor(
        @InjectRepository(DetalleVenta)
        private readonly detalleVentaRepository: Repository<DetalleVenta>,

        // NUEVO: necesario para descontar stock de accesorios y repuestos
        @InjectRepository(Producto)
        private readonly productoRepository: Repository<Producto>,
    ) {}

    async create(createDetalleVentaDto: CreateDetalleVentaDto) {
        if (!createDetalleVentaDto.idProductoFk && !createDetalleVentaDto.idPackFk)
            throw new BadRequestException('Debe especificar idProductoFk o idPackFk');

        // NUEVO: descontar stock para accesorios y repuestos
        // Las motos ya son manejadas en VentasService.validarYDescontarStock
        if (createDetalleVentaDto.idProductoFk) {
            await this.descontarStockAccesorioRepuesto(
                createDetalleVentaDto.idProductoFk,
                createDetalleVentaDto.cantidad ?? 1,
            );
        }

        try {
            const detalle = this.detalleVentaRepository.create(createDetalleVentaDto);
            return await this.detalleVentaRepository.save(detalle);
        } catch (error) {
            this.manejoDBExcepciones(error);
        }
    }

    /**
     * Descuenta stock solo para ACCESORIOS y REPUESTOS.
     * Las motos son manejadas por VentasService para poder marcar estado_moto = VENDIDO.
     * Los servicios no tienen stock.
     */
    private async descontarStockAccesorioRepuesto(
        idProducto: string,
        cantidad: number,
    ): Promise<void> {
        const producto = await this.productoRepository.findOneBy({ id: idProducto });

        // Si no existe o es moto/servicio, no hacemos nada aquí
        if (!producto) return;
        if (producto.tipo_producto === TipoProducto.MOTO) return;
        if (producto.tipo_producto === TipoProducto.SERVICIO) return;

        // Solo descuentamos si el producto maneja stock
        if (producto.stock === null) return;

        if (producto.stock < cantidad)
            throw new BadRequestException(
                `Stock insuficiente para "${producto.nombre_producto}". ` +
                `Disponible: ${producto.stock}, solicitado: ${cantidad}`,
            );

        producto.stock -= cantidad;
        if (producto.stock <= 0) {
            producto.stock      = 0;
            producto.disponible = false;
        }

        await this.productoRepository.save(producto);
    }

    async findAll() {
        return await this.detalleVentaRepository.find({
            relations: ['venta', 'producto', 'pack'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string) {
        const detalle = await this.detalleVentaRepository.findOne({
            where: { id },
            relations: ['venta', 'producto', 'pack'],
        });

        if (!detalle)
            throw new NotFoundException(`DetalleVenta con ID ${id} no encontrado`);

        return detalle;
    }

    async findByVenta(idVenta: string) {
        return await this.detalleVentaRepository.find({
            where: { idVentaFk: idVenta },
            relations: ['producto', 'pack'],
            order: { createdAt: 'ASC' },
        });
    }

    async findByProducto(idProducto: string) {
        return await this.detalleVentaRepository.find({
            where: { idProductoFk: idProducto },
            relations: ['venta', 'venta.cuotas'],
            order: { createdAt: 'DESC' },
        });
    }

    async update(id: string, updateDetalleVentaDto: UpdateDetalleVentaDto) {
        const detalle = await this.findOne(id);
        try {
            const detalleActualizado = Object.assign(detalle, updateDetalleVentaDto);
            return await this.detalleVentaRepository.save(detalleActualizado);
        } catch (error) {
            this.manejoDBExcepciones(error);
        }
    }

    async remove(id: string) {
        const detalle = await this.findOne(id);
        await this.detalleVentaRepository.remove(detalle);
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