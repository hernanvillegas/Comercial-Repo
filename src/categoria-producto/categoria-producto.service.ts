import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaProducto } from './entities/categoria-producto.entity';
import { CreateCategoriaProductoDto } from './dto/create-categoria-producto.dto';
import { UpdateCategoriaProductoDto } from './dto/update-categoria-producto.dto';

@Injectable()
export class CategoriaProductoService {

    private readonly logger = new Logger('CategoriaProductoService');

    constructor(
        @InjectRepository(CategoriaProducto)
        private readonly categoriaRepository: Repository<CategoriaProducto>,
    ) {}

    async create(createCategoriaProductoDto: CreateCategoriaProductoDto) {
        try {
            const categoria = this.categoriaRepository.create(createCategoriaProductoDto);
            await this.categoriaRepository.save(categoria);
            return categoria;
        } catch (error) {
            this.manejoDBExcepciones(error);
        }
    }

    async findAll() {
        return await this.categoriaRepository.find({
            order: { tipo: 'ASC', nombre_categoria: 'ASC' }
        });
    }

    async findOne(id: number) {
        const categoria = await this.categoriaRepository.findOneBy({ id_categoria: id });

        if (!categoria)
            throw new NotFoundException(`La categoría con ID ${id} no fue encontrada`);

        return categoria;
    }

    async findByTipo(tipo: string) {
        return await this.categoriaRepository.find({
            where: { tipo, activo: true },
            order: { nombre_categoria: 'ASC' }
        });
    }

    async update(id: number, updateCategoriaProductoDto: UpdateCategoriaProductoDto) {
        const categoria = await this.findOne(id);

        try {
            const categoriaActualizada = Object.assign(categoria, updateCategoriaProductoDto);
            return await this.categoriaRepository.save(categoriaActualizada);
        } catch (error) {
            this.manejoDBExcepciones(error);
        }
    }

    async remove(id: number) {
        const categoria = await this.findOne(id);
        await this.categoriaRepository.remove(categoria);
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
