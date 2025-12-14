import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGaranteDto } from './dto/create-garante.dto';
import { UpdateGaranteDto } from './dto/update-garante.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Garante } from './entities/garante.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GaranteService {

  constructor(
    @InjectRepository(Garante)
    private readonly garanteRepository: Repository<Garante>,
  ) { }


  async create(createGaranteDto: CreateGaranteDto): Promise<Garante> {
    // Verificar si el CI ya existe
    const existingGarante = await this.garanteRepository.findOne({
      where: { ci_garante: createGaranteDto.ci_garante }
    });

    if (existingGarante) {
      throw new ConflictException(`Ya existe un garante con el CI ${createGaranteDto.ci_garante}`);
    }

    const garante = this.garanteRepository.create(createGaranteDto);
    return await this.garanteRepository.save(garante);
  }

  async findAll(): Promise<Garante[]> {
    return await this.garanteRepository.find({
      order: { fecha_registro: 'DESC' }
    });
  }
  async findOne(id: number): Promise<Garante> {
    const garante = await this.garanteRepository.findOne({
      where: { id_garante: id }
    });

    if (!garante) {
      throw new NotFoundException(`Garante con ID ${id} no encontrado`);
    }

    return garante;
  }

  async findByCI(ci: number): Promise<Garante> {
    const garante = await this.garanteRepository.findOne({
      where: { ci_garante: ci }
    });

    if (!garante) {
      throw new NotFoundException(`Garante con CI ${ci} no encontrado`);
    }

    return garante;
  }

  async findVerificados(): Promise<Garante[]> {
    return await this.garanteRepository.find({
      where: { verificado: true },
      order: { fecha_registro: 'DESC' }
    });
  }

  async update(id: number, updateGaranteDto: UpdateGaranteDto): Promise<Garante> {
    const garante = await this.findOne(id);

    // Si se está actualizando el CI, verificar que no exista otro garante con ese CI
    if (updateGaranteDto.ci_garante && updateGaranteDto.ci_garante !== garante.ci_garante) {
      const existingGarante = await this.garanteRepository.findOne({
        where: { ci_garante: updateGaranteDto.ci_garante }
      });

      if (existingGarante) {
        throw new ConflictException(`Ya existe un garante con el CI ${updateGaranteDto.ci_garante}`);
      }
    }

    Object.assign(garante, updateGaranteDto);
    return await this.garanteRepository.save(garante);
  }


  async remove(id: number): Promise<void> {
    const garante = await this.findOne(id);
    await this.garanteRepository.remove(garante);
  }

  async verificar(id: number): Promise<Garante> {
    const garante = await this.findOne(id);
    garante.verificado = true;
    return await this.garanteRepository.save(garante);
  }

  async desverificar(id: number): Promise<Garante> {
    const garante = await this.findOne(id);
    garante.verificado = false;
    return await this.garanteRepository.save(garante);
  }
}
