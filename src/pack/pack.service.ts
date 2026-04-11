import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pack } from './entities/pack.entity';
import { PackDetalle } from './entities/pack-detalle.entity';
import { CreatePackDto } from './dto/create-pack.dto';
import { UpdatePackDto } from './dto/update-pack.dto';

@Injectable()
export class PackService {

    private readonly logger = new Logger('PackService');

    constructor(
        @InjectRepository(Pack)
        private readonly packRepository: Repository<Pack>,

        @InjectRepository(PackDetalle)
        private readonly packDetalleRepository: Repository<PackDetalle>,
    ) {}

    async create(createPackDto: CreatePackDto) {
        try {
            const { items, ...packDetails } = createPackDto;

            const pack = this.packRepository.create({
                ...packDetails,
                items: items.map(item => this.packDetalleRepository.create(item))
            });

            await this.packRepository.save(pack);
            return pack;

        } catch (error) {
            this.manejoDBExcepciones(error);
        }
    }

    async findAll() {
        return await this.packRepository.find({
            relations: ['items', 'items.producto'],
            order: { createdAt: 'DESC' }
        });
    }

    async findActivos() {
        const hoy = new Date();
        return await this.packRepository
            .createQueryBuilder('pack')
            .leftJoinAndSelect('pack.items', 'items')
            .leftJoinAndSelect('items.producto', 'producto')
            .where('pack.activo = :activo', { activo: true })
            .andWhere('(pack.vigencia_desde IS NULL OR pack.vigencia_desde <= :hoy)', { hoy })
            .andWhere('(pack.vigencia_hasta IS NULL OR pack.vigencia_hasta >= :hoy)', { hoy })
            .orderBy('pack.createdAt', 'DESC')
            .getMany();
    }

    async findOne(id: string) {
        const pack = await this.packRepository.findOne({
            where: { id },
            relations: ['items', 'items.producto']
        });

        if (!pack)
            throw new NotFoundException(`Pack con ID ${id} no encontrado`);

        return pack;
    }

    async update(id: string, updatePackDto: UpdatePackDto) {
        const pack = await this.findOne(id);

        try {
            const { items, ...packDetails } = updatePackDto;
            Object.assign(pack, packDetails);

            if (items) {
                // Eliminar items anteriores y reemplazar
                await this.packDetalleRepository.delete({ idPackFk: id });
                pack.items = items.map(item => this.packDetalleRepository.create(item));
            }

            return await this.packRepository.save(pack);

        } catch (error) {
            this.manejoDBExcepciones(error);
        }
    }

    async remove(id: string) {
        const pack = await this.findOne(id);
        await this.packRepository.remove(pack);
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
