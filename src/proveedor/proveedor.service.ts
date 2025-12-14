import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from './entities/proveedor.entity';

@Injectable()
export class ProveedorService {

  private readonly logger = new Logger('ProveedoresService');

  constructor(
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor> 

  ){}

  async create(createProveedorDto: CreateProveedorDto) {
    try {
      
      const proveedor = this.proveedorRepository.create(createProveedorDto);
      await this.proveedorRepository.save(proveedor);

      return proveedor;

    } catch (error) {
      this.manejoExcepciones(error);
    }
  }


  async findAll() {
    try {
      return await this.proveedorRepository.find();
    } catch (error) {
      this.manejoExcepciones(error);
    }
  }

  async findOne(id: number) {
    const proveedor = await this.proveedorRepository.findOneBy({ id_proveedor: id });
    
    if (!proveedor) {
      throw new NotFoundException(`Proveedor con id ${id} no encontrado`);
    }
    
    return proveedor;
  }

 
  async update(id: number, updateProveedorDto: UpdateProveedorDto) {
    const proveedor = await this.proveedorRepository.preload({
      id_proveedor: id,
      ...updateProveedorDto,
    });

    if (!proveedor) {
      throw new NotFoundException(`Proveedor con id ${id} no encontrado`);
    }

    try {
      await this.proveedorRepository.save(proveedor);
      return proveedor;
    } catch (error) {
      this.manejoExcepciones(error);
    }
  }

  async remove(id: number) {
    const proveedor = await this.findOne(id);
    await this.proveedorRepository.remove(proveedor);
    return { message: `Proveedor con id ${id} eliminado exitosamente` };
  }
  
  private manejoExcepciones(error: any):never {
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
