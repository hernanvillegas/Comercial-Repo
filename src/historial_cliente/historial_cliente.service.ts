import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateHistorialClienteDto } from './dto/create-historial_cliente.dto';
import { UpdateHistorialClienteDto } from './dto/update-historial_cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistorialCliente } from './entities/historial_cliente.entity';

@Injectable()
export class HistorialClienteService {

  private readonly logger = new Logger('HistorialService');
  
  constructor(
    @InjectRepository(HistorialCliente)
    private readonly historialRepository: Repository<HistorialCliente>,
  ) {}
  
  
  async create(createHistorialClienteDto: CreateHistorialClienteDto) {
    try {
      const historial = this.historialRepository.create(createHistorialClienteDto);
      await this.historialRepository.save(historial);
      return historial;
    } catch (error) {
      this.manejoDBExcepciones(error);
    }
  }

  async findAll() {
    try {
      return await this.historialRepository.find({
        order: {
          fecha_ultima_compra: 'DESC'
        }
      });
    } catch (error) {
      this.manejoDBExcepciones(error);
    }
  }

  
  async findOne(id: number) {
    const historial = await this.historialRepository.findOneBy({ id_historial: id });
    
    if (!historial) {
      throw new NotFoundException(`Historial con id ${id} no encontrado`);
    }
    
    return historial;
  }

  async update(id: number, updateHistorialClienteDto: UpdateHistorialClienteDto) {
    const historial = await this.historialRepository.preload({
      id_historial: id,
      ...updateHistorialClienteDto,
    });

    if (!historial) {
      throw new NotFoundException(`Historial con id ${id} no encontrado`);
    }

    try {
      await this.historialRepository.save(historial);
      return historial;
    } catch (error) {
      this.manejoDBExcepciones(error);
    }
  }

  
  
  async remove(id: number) {
    const historial = await this.findOne(id);
    await this.historialRepository.remove(historial);
    return { message: `Historial con id ${id} eliminado exitosamente` };
  }

  // Método adicional para obtener compras cumplidas
  // async findByCumplido(cumplido: boolean) {
  //   try {
  //     return await this.historialRepository.find({
  //       where: { cumplido },
  //       order: { fecha_ultima_compra: 'DESC' }
  //     });
  //   } catch (error) {
  //     this.manejoDBExcepciones(error);
  //   }
  // }

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
