import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClienteService {
  
 constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    // Verificar si el CI ya existe
    const existingClienteByCI = await this.clienteRepository.findOne({
      where: { ci_cliente: createClienteDto.ci_cliente }
    });

    if (existingClienteByCI) {
      throw new ConflictException(`Ya existe un cliente con el CI ${createClienteDto.ci_cliente}`);
    }

    // Verificar si el celular ya existe
    const existingClienteByCelular = await this.clienteRepository.findOne({
      where: { celular: createClienteDto.celular }
    });

    if (existingClienteByCelular) {
      throw new ConflictException(`Ya existe un cliente con el celular ${createClienteDto.celular}`);
    }

    // Verificar si el email ya existe
    const existingClienteByEmail = await this.clienteRepository.findOne({
      where: { email: createClienteDto.email }
    });

    if (existingClienteByEmail) {
      throw new ConflictException(`Ya existe un cliente con el email ${createClienteDto.email}`);
    }

    // Validar que la fecha de nacimiento no sea futura
    const fechaNacimiento = new Date(createClienteDto.fecha_nacimiento);
    if (fechaNacimiento > new Date()) {
      throw new BadRequestException('La fecha de nacimiento no puede ser futura');
    }

    // Calcular edad
    const edad = this.calcularEdad(fechaNacimiento);
    if (edad < 18) {
      throw new BadRequestException('El cliente debe ser mayor de 18 años');
    }

    const cliente = this.clienteRepository.create(createClienteDto);
    return await this.clienteRepository.save(cliente);
  }

  async findAll(): Promise<Cliente[]> {
    return await this.clienteRepository.find({
      order: { fecha_registro: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({ 
      where: { id_cliente: id } 
    });
    
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    
    return cliente;
  }

  async findByCI(ci: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({ 
      where: { ci_cliente: ci } 
    });
    
    if (!cliente) {
      throw new NotFoundException(`Cliente con CI ${ci} no encontrado`);
    }
    
    return cliente;
  }

  async findByEmail(email: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({ 
      where: { email } 
    });
    
    if (!cliente) {
      throw new NotFoundException(`Cliente con email ${email} no encontrado`);
    }
    
    return cliente;
  }

  async findVerificados(): Promise<Cliente[]> {
    return await this.clienteRepository.find({
      where: { verificado: true },
      order: { fecha_registro: 'DESC' }
    });
  }

  async findByCiudad(ciudad: string): Promise<Cliente[]> {
    return await this.clienteRepository.find({
      where: { ciudad },
      order: { apellido_cliente: 'ASC' }
    });
  }

  async findByProvincia(provincia: string): Promise<Cliente[]> {
    return await this.clienteRepository.find({
      where: { provincia },
      order: { apellido_cliente: 'ASC' }
    });
  }

  async update(id: number, updateClienteDto: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.findOne(id);

    // Validar CI único si se está actualizando
    if (updateClienteDto.ci_cliente && updateClienteDto.ci_cliente !== cliente.ci_cliente) {
      const existingCliente = await this.clienteRepository.findOne({
        where: { ci_cliente: updateClienteDto.ci_cliente }
      });

      if (existingCliente) {
        throw new ConflictException(`Ya existe un cliente con el CI ${updateClienteDto.ci_cliente}`);
      }
    }

    // Validar celular único si se está actualizando
    if (updateClienteDto.celular && updateClienteDto.celular !== cliente.celular) {
      const existingCliente = await this.clienteRepository.findOne({
        where: { celular: updateClienteDto.celular }
      });

      if (existingCliente) {
        throw new ConflictException(`Ya existe un cliente con el celular ${updateClienteDto.celular}`);
      }
    }

    // Validar email único si se está actualizando
    if (updateClienteDto.email && updateClienteDto.email !== cliente.email) {
      const existingCliente = await this.clienteRepository.findOne({
        where: { email: updateClienteDto.email }
      });

      if (existingCliente) {
        throw new ConflictException(`Ya existe un cliente con el email ${updateClienteDto.email}`);
      }
    }

    // Validar fecha de nacimiento si se está actualizando
    if (updateClienteDto.fecha_nacimiento) {
      const fechaNacimiento = new Date(updateClienteDto.fecha_nacimiento);
      if (fechaNacimiento > new Date()) {
        throw new BadRequestException('La fecha de nacimiento no puede ser futura');
      }

      const edad = this.calcularEdad(fechaNacimiento);
      if (edad < 18) {
        throw new BadRequestException('El cliente debe ser mayor de 18 años');
      }
    }

    Object.assign(cliente, updateClienteDto);
    return await this.clienteRepository.save(cliente);
  }

  async remove(id: number): Promise<void> {
    const cliente = await this.findOne(id);
    await this.clienteRepository.remove(cliente);
  }

  async verificar(id: number): Promise<Cliente> {
    const cliente = await this.findOne(id);
    cliente.verificado = true;
    return await this.clienteRepository.save(cliente);
  }

  async desverificar(id: number): Promise<Cliente> {
    const cliente = await this.findOne(id);
    cliente.verificado = false;
    return await this.clienteRepository.save(cliente);
  }

  // Método auxiliar para calcular edad
  private calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }

  // Obtener edad del cliente
  async getEdad(id: number): Promise<number> {
    const cliente = await this.findOne(id);
    return this.calcularEdad(cliente.fecha_nacimiento);
  }
}
