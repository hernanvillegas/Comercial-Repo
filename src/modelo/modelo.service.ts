import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateModeloDto } from './dto/create-modelo.dto';
import { UpdateModeloDto } from './dto/update-modelo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Modelo } from './entities/modelo.entity';
import { Repository } from 'typeorm';
import { Marca } from 'src/marca/entities/marca.entity';

@Injectable()
export class ModeloService {

  constructor(
  
      @InjectRepository(Modelo) private readonly  modeloRepository: Repository<Modelo>,
      @InjectRepository(Marca)  private marcaRepository: Repository<Marca>,
    ){}

    
  // async create(createModeloDto: CreateModeloDto) {
   async create(createModeloDto: CreateModeloDto) {
    
    // Verificar si la marca existe
    const marcaExiste = await this.marcaRepository.findOne({where: { id_marca: createModeloDto.idMarca } });
   
    try {
        if (!marcaExiste) {
      throw new NotFoundException(
        `La marca con ID ${createModeloDto.idMarca} no existe`
      );
    }
    // Verificar si la marca está activa (opcional pero recomendado)
    if (!marcaExiste.activo) {
      throw new BadRequestException(
        `La marca ${marcaExiste.nombre_marca} está inactiva y no se pueden crear modelos`
      );
    }

    
         
         const marca = this.modeloRepository.create(createModeloDto);
         await this.modeloRepository.save(marca)
   
         return marca;
   
       } catch (error) {
         this.manejoDBExcepciones(error);
         
       }
   
     }

     

  // Obtener todos los modelos con información de marca
  async findAll(): Promise<Modelo[]> {
    return await this.modeloRepository.find({
      relations: ['marca'],
      order: { anio_modelo: 'DESC' }
    });
  }

  // Obtener un modelo por ID
  async findOne(id: number): Promise<Modelo> {
    const modelo = await this.modeloRepository.findOne({
      where: { id_modelo: id },
      relations: ['marca']
    });

    if (!modelo) {
      throw new NotFoundException(`Modelo con ID ${id} no encontrado`);
    }

    return modelo;
  }

  // Obtener modelos por marca
  async findByMarca(idMarca: number): Promise<Modelo[]> {
    return await this.modeloRepository.find({
      where: { idMarca },
      relations: ['marca'],
      order: { anio_modelo: 'DESC' }
    });
  }

  // Obtener modelos por tipo de combustible
  async findByTipoCombustible(tipo_combustible: string): Promise<Modelo[]> {
    return await this.modeloRepository.find({
      where: { tipo_combustible },
      relations: ['marca'],
      order: { anio_modelo: 'DESC' }
    });
  }

  // Obtener modelos por año
  async findByAño(anio_modelo: Date): Promise<Modelo[]> {
    return await this.modeloRepository.find({
      where: { anio_modelo: anio_modelo },
      relations: ['marca'],
      order: { nombre_modelo: 'ASC' }
    });
  }

  // Actualizar un modelo
  async update(id: number, updateModeloDto: UpdateModeloDto): Promise<Modelo> {
    const modelo = await this.findOne(id);
    Object.assign(modelo, updateModeloDto);
    return await this.modeloRepository.save(modelo);
  }

  // Eliminar un modelo
  async remove(id: number): Promise<void> {
    const modelo = await this.findOne(id);
    await this.modeloRepository.remove(modelo);
  }

  private manejoDBExcepciones(error:any):never{
        if(error.code === '23505')
          throw new BadRequestException(error.detail);
    
        
        console.log(error)
        throw new InternalServerErrorException('Error inesperado, verifica los registros del Servidor');
      }
}
