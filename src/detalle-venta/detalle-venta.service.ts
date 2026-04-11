import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetalleVenta } from './entities/detalle-venta.entity';
import { CreateDetalleVentaDto } from './dto/create-detalle-venta.dto';
import { UpdateDetalleVentaDto } from './dto/update-detalle-venta.dto';

@Injectable()
export class DetalleVentaService {

    private readonly logger = new Logger('DetalleVentaService');

    constructor(
        @InjectRepository(DetalleVenta)
        private readonly detalleVentaRepository: Repository<DetalleVenta>,
    ) {}

    async create(createDetalleVentaDto: CreateDetalleVentaDto) {
        if (!createDetalleVentaDto.idProductoFk && !createDetalleVentaDto.idPackFk) {
            throw new BadRequestException('Debe especificar idProductoFk o idPackFk');
        }

        try {
            const detalle = this.detalleVentaRepository.create(createDetalleVentaDto);
            return await this.detalleVentaRepository.save(detalle);
        } catch (error) {
            this.manejoDBExcepciones(error);
        }
    }

    async findAll() {
        return await this.detalleVentaRepository.find({
            relations: ['venta', 'producto', 'pack'],
            order: { createdAt: 'DESC' }
        });
    }

    async findOne(id: string) {
        const detalle = await this.detalleVentaRepository.findOne({
            where: { id },
            relations: ['venta', 'producto', 'pack']
        });

        if (!detalle)
            throw new NotFoundException(`DetalleVenta con ID ${id} no encontrado`);

        return detalle;
    }

    async findByVenta(idVenta: string) {
        return await this.detalleVentaRepository.find({
            where: { idVentaFk: idVenta },
            relations: ['producto', 'pack'],
            order: { createdAt: 'ASC' }
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
