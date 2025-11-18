import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateMarcaDto } from './dto/create.marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { Marca } from './entities/marca.entity';

@Injectable()
export class MarcaService {

  

  constructor(

    @InjectRepository(Marca)
    private readonly marcaRepository: Repository<Marca>,
  ){}
  
  // crear una marca
  async create(createMarcaDto: CreateMarcaDto) {

    try {
      
      const marca = this.marcaRepository.create(createMarcaDto);
      await this.marcaRepository.save(marca)

      return marca;

    } catch (error) {
      this.manejoDBExcepciones(error);
      
    }

  }

    // Obtener todas las marcas
  async findAll(): Promise<Marca[]> {
    return await this.marcaRepository.find({
      order: { nombre_marca: 'ASC' }
    });
  }

  // Obtener marcas activas
  async findActivas(): Promise<Marca[]> {
    return await this.marcaRepository.find({
      where: { activo: true },
      order: { nombre_marca: 'ASC' }
    });
  }
  
  // Obtener una marca por ID
  async findOne(id: number): Promise<Marca> {
    const marca = await this.marcaRepository.findOne({
      where: { id_marca: id }
    });

    if (!marca) {
      throw new NotFoundException(`Marca con ID ${id} no encontrada`);
    }

    return marca;
  }
// Obtener una marca con sus modelos
  async findOneWithModelos(id: number): Promise<Marca> {
    const marca = await this.marcaRepository.findOne({
      where: { id_marca: id },
      relations: ['modelos'],
    });

    if (!marca) {
      throw new NotFoundException(`Marca con ID ${id} no encontrada`);
    }

    return marca;
  }

   // Obtener todas las marcas con sus modelos
  async findAllWithModelos(): Promise<Marca[]> {
    return await this.marcaRepository.find({
      relations: ['modelos'],
      order: {
        nombre_marca: 'ASC',
        modelos: {
          anio_modelo: 'DESC'
        }
      }
    });
  }
   
  // actualizar marca
  async update(id: number, updateMarcaDto: UpdateMarcaDto) {

    const marca = await this.marcaRepository.preload({
      id_marca:id,
      ...updateMarcaDto

    });

    if(!marca) throw new NotFoundException(`La marca con el id ${id} no existe`);

    try {
      await this.marcaRepository.save(marca);
      return marca;

    } catch (error) {
      this.manejoDBExcepciones(error);
    }
    
  }

  // Eliminar una marca (elimina sus modelos por CASCADE)
   async remove(id_marca: number): Promise<void> {

    const marca = await this.findOne(id_marca);

    await this.marcaRepository.remove(marca);
  }

   // Activar o desactivar una marca
  async toggleActivo(id: number): Promise<Marca> {
    const marca = await this.findOne(id);
    marca.activo = !marca.activo;
    return await this.marcaRepository.save(marca);
  }

  private manejoDBExcepciones(error:any):never{
      if(error.code === '23505')
        throw new BadRequestException(error.detail);
  
      
      console.log(error)
      throw new InternalServerErrorException('Error inesperado, verifica los registros del Servidor');
    }
}
