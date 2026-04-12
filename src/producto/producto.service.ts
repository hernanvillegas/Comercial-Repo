import {
    BadRequestException, Injectable, InternalServerErrorException,
    Logger, NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { Producto } from './entities/producto.entity';
import { ProductoImage } from './entities/producto-image.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dto/paginacion.dto';
import { TipoProducto } from 'src/common/enums';
import { DeepPartial } from 'typeorm';

@Injectable()
export class ProductoService {

    private readonly logger = new Logger('ProductoService');

    constructor(
        @InjectRepository(Producto)
        private readonly productoRepository: Repository<Producto>,

        @InjectRepository(ProductoImage)
        private readonly productoImageRepository: Repository<ProductoImage>,

        @InjectRepository(Proveedor)
        private readonly proveedorRepository: Repository<Proveedor>,

        private readonly dataSource: DataSource,
    ) {}

    async create(createProductoDto: CreateProductoDto, user: User) {

        const proveedorExiste = createProductoDto.idProveedor
            ? await this.proveedorRepository.findOne({ where: { id_proveedor: createProductoDto.idProveedor } })
            : null;

        try {
            if (createProductoDto.idProveedor && !proveedorExiste) {
                throw new NotFoundException(`El proveedor con ID ${createProductoDto.idProveedor} no existe`);
            }
            if (proveedorExiste && !proveedorExiste.activo) {
                throw new BadRequestException(`El proveedor ${proveedorExiste.id_proveedor} está inactivo`);
            }

            // ✅ Desestructuramos images (viene como string[]) y el resto
            const { images = [], ...productoDetails } = createProductoDto;

            const producto = this.productoRepository.create({
                ...productoDetails,                                               
                tipo_producto: productoDetails.tipo_producto as TipoProducto,   
                images: images.map(url => this.productoImageRepository.create({ url })), 
                user,
            });

            await this.productoRepository.save(producto);
            return { ...producto, images: producto.images?.map(img => img.url) };

        } catch (error) {
            this.manejoDBExcepciones(error);
        }
    }

    async findAll(paginationDto: PaginationDto) {
        const { limit = 10, offset = 0 } = paginationDto;

        const productos = await this.productoRepository.find({
            take: limit,
            skip: offset,
            relations: { images: true },
            order: { createdAt: 'DESC' },
        });

        const totalProductos = await this.productoRepository.count();

        return {
            count: totalProductos,
            pages: Math.ceil(totalProductos / limit),
            productos: productos.map(p => ({
                ...p,
                images: p.images?.map(img => img.url),
            })),
        };
    }

    async findByTipo(tipo: string, paginationDto: PaginationDto) {
        const { limit = 10, offset = 0 } = paginationDto;

        const productos = await this.productoRepository.find({
            where: { tipo_producto: tipo as TipoProducto, disponible: true },
            take: limit,
            skip: offset,
            relations: { images: true },
            order: { createdAt: 'DESC' },
        });

        return productos.map(p => ({
            ...p,
            images: p.images?.map(img => img.url),
        }));
    }

    async findStockBajo() {
        return await this.productoRepository
            .createQueryBuilder('producto')
            .where('producto.stock <= producto.stock_minimo')
            .andWhere('producto.tipo_producto != :tipo', { tipo: 'servicio' })
            .orderBy('producto.stock', 'ASC')
            .getMany();
    }

    async findOne(termino_busqueda: string) {
        let producto: Producto | null = null;

        if (isUUID(termino_busqueda)) {
            producto = await this.productoRepository.findOneBy({ id: termino_busqueda });
        } else {
            producto = await this.productoRepository
                .createQueryBuilder('prod')
                .where('UPPER(prod.nombre_producto) = :nombre OR prod.slug = :slug', {
                    nombre: termino_busqueda.toUpperCase(),
                    slug:   termino_busqueda.toLowerCase(),
                })
                .leftJoinAndSelect('prod.images', 'prodImages')
                .getOne();
        }

        if (!producto)
            throw new NotFoundException(`El producto con el término "${termino_busqueda}" no fue encontrado`);

        return producto;
    }

    async findOnePlain(termino_busqueda: string) {
        const { images = [], ...rest } = await this.findOne(termino_busqueda);
        return { ...rest, images: images.map(img => img.url) };
    }

    async update(id: string, updateProductoDto: UpdateProductoDto, user: User) {
        const { images, ...toUpdate } = updateProductoDto;

        const producto = await this.productoRepository.preload({
            id,
            ...toUpdate,
            ...(toUpdate.tipo_producto && { tipo_producto: toUpdate.tipo_producto as TipoProducto }),
        } as DeepPartial<Producto>);  

        if (!producto)
            throw new NotFoundException(`El producto con id ${id} NO existe`);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            if (images) {
                await queryRunner.manager.delete(ProductoImage, { producto: { id } });
                producto.images = images.map(url => this.productoImageRepository.create({ url }));
            }

            producto.user = user;
            await queryRunner.manager.save(producto);
            await queryRunner.commitTransaction();
            await queryRunner.release();

            return this.findOnePlain(id);

        } catch (error) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            this.manejoDBExcepciones(error);
        }
    }
    async remove(id: string) {
        const producto = await this.findOne(id);
        await this.productoRepository.remove(producto);
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

    async deleteAllProductos() {
        try {
            return await this.productoRepository.createQueryBuilder('producto').delete().where({}).execute();
        } catch (error) {
            this.manejoDBExcepciones(error);
        }
    }
}
