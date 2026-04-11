import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetalleMoto } from './entities/detalle-moto.entity';
import { CreateDetalleMotoDto } from './dto/create-detalle-moto.dto';
import { UpdateDetalleMotoDto } from './dto/update-detalle-moto.dto';

@Injectable()
export class DetalleMotoService {

    private readonly logger = new Logger('DetalleMotoService');

    constructor(
        @InjectRepository(DetalleMoto)
        private readonly detalleMotoRepository: Repository<DetalleMoto>,
    ) {}

    async create(createDetalleMotoDto: CreateDetalleMotoDto) {
        try {
            const detalle = this.detalleMotoRepository.create(createDetalleMotoDto);
            await this.detalleMotoRepository.save(detalle);
            return detalle;
        } catch (error) {
            this.manejoDBExcepciones(error);
        }
    }

    async findAll() {
        return await this.detalleMotoRepository.find({
            relations: ['producto', 'modelo'],
            order: { createdAt: 'DESC' }
        });
    }

    async findOne(id: number) {
        const detalle = await this.detalleMotoRepository.findOne({
            where: { id_detalle: id },
            relations: ['producto', 'modelo']
        });

        if (!detalle)
            throw new NotFoundException(`DetalleMoto con ID ${id} no encontrado`);

        return detalle;
    }

    async findByProducto(idProducto: string) {
        const detalle = await this.detalleMotoRepository.findOne({
            where: { idProductoFk: idProducto },
            relations: ['producto', 'modelo']
        });

        if (!detalle)
            throw new NotFoundException(`No existe detalle de moto para el producto ${idProducto}`);

        return detalle;
    }

    async findByEstado(estado: string) {
        return await this.detalleMotoRepository.find({
            where: { estado_moto: estado },
            relations: ['producto'],
            order: { fecha_ingreso: 'DESC' }
        });
    }

    async update(id: number, updateDetalleMotoDto: UpdateDetalleMotoDto) {
        const detalle = await this.findOne(id);

        try {
            const detalleActualizado = Object.assign(detalle, updateDetalleMotoDto);
            return await this.detalleMotoRepository.save(detalleActualizado);
        } catch (error) {
            this.manejoDBExcepciones(error);
        }
    }

    async remove(id: number) {
        const detalle = await this.findOne(id);
        await this.detalleMotoRepository.remove(detalle);
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
