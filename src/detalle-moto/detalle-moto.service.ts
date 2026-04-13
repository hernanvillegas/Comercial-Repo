import {
  BadRequestException, Injectable, InternalServerErrorException,
  Logger, NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DetalleMoto }          from './entities/detalle-moto.entity';
import { CreateDetalleMotoDto } from './dto/create-detalle-moto.dto';
import { UpdateDetalleMotoDto } from './dto/update-detalle-moto.dto';
import { EstadoMoto }           from 'src/common/enums';

@Injectable()
export class DetalleMotoService {

  private readonly logger = new Logger('DetalleMotoService');

  constructor(
    @InjectRepository(DetalleMoto)
    private readonly detalleMotoRepository: Repository<DetalleMoto>,
  ) {}

  // ── CREATE ────────────────────────────────────────────────────────────────
  async create(createDetalleMotoDto: CreateDetalleMotoDto) {
    try {
      const detalle = this.detalleMotoRepository.create({
        ...createDetalleMotoDto,
        estado_moto: createDetalleMotoDto.estado_moto as EstadoMoto,
      });
      await this.detalleMotoRepository.save(detalle);
      return detalle;
    } catch (error) {
      this.manejoDBExcepciones(error);
    }
  }

  // ── FIND ALL — serializa images para el front ─────────────────────────────
  async findAll() {
    const detalles = await this.detalleMotoRepository.find({
      relations: ['producto', 'producto.images', 'modelo'],
      order: { createdAt: 'DESC' }
    });

    return detalles.map(d => this.serializar(d));
  }

  // ── FIND ONE público — serializa images para el front ────────────────────
  async findOne(id: number) {
    const detalle = await this.findOneEntity(id);
    return this.serializar(detalle);
  }

  // ── FIND ONE privado — entidad sin transformar para TypeORM ──────────────
  private async findOneEntity(id: number): Promise<DetalleMoto> {
    const detalle = await this.detalleMotoRepository.findOne({
      where: { id_detalle: id },
      relations: ['producto', 'producto.images', 'modelo']
    });

    if (!detalle)
      throw new NotFoundException(`DetalleMoto con ID ${id} no encontrado`);

    return detalle;
  }

  // ── FIND BY PRODUCTO — serializa images para el front ────────────────────
  async findByProducto(idProducto: string) {
    const detalle = await this.detalleMotoRepository.findOne({
      where: { idProductoFk: idProducto },
      relations: ['producto', 'producto.images', 'modelo', 'modelo.marcas']
    });

    if (!detalle)
      throw new NotFoundException(`No existe detalle de moto para el producto ${idProducto}`);

    return this.serializar(detalle);
  }

  // ── FIND BY ESTADO ────────────────────────────────────────────────────────
  async findByEstado(estado: string) {
    const detalles = await this.detalleMotoRepository.find({
      where: { estado_moto: estado as EstadoMoto },
      relations: ['producto', 'producto.images'],
      order: { fecha_ingreso: 'DESC' }
    });

    return detalles.map(d => this.serializar(d));
  }

  // ── UPDATE — usa findOneEntity para no romper TypeORM ────────────────────
  async update(id: number, updateDetalleMotoDto: UpdateDetalleMotoDto) {
    const detalle = await this.findOneEntity(id);

    try {
      const detalleActualizado = Object.assign(detalle, updateDetalleMotoDto);
      return await this.detalleMotoRepository.save(detalleActualizado);
    } catch (error) {
      this.manejoDBExcepciones(error);
    }
  }

  // ── REMOVE — usa findOneEntity para no romper TypeORM ────────────────────
  async remove(id: number) {
    const detalle = await this.findOneEntity(id);
    await this.detalleMotoRepository.remove(detalle);
  }

  // ── HELPER — serializa images a strings ──────────────────────────────────
  private serializar(detalle: DetalleMoto) {
    return {
      ...detalle,
      producto: {
        ...detalle.producto,
        images: detalle.producto?.images?.map(img => img.url) ?? [],
      }
    };
  }

  // ── MANEJO DE ERRORES ─────────────────────────────────────────────────────
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