import { BadRequestException, ConflictException, Injectable, NotFoundException, Patch } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { In, Repository } from 'typeorm';
import { Garante } from 'src/garante/entities/garante.entity';

@Injectable()
export class ClienteService {

  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Garante)
    private readonly garanteRepository: Repository<Garante>,
  ) { }

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

  // con la tabla garante // Asignar garante a un cliente existente*****************************
  @Patch(':id/garantes')
  async asignarGarantes(clienteId: number, garanteIds: number[]): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { id_cliente: clienteId },
      relations: ['garantes'],
    });

    if (!cliente) {
      throw new NotFoundException(`El Cliente con ID ${clienteId} no encontrado`);
    }

    // ***********************************************************
    // Validar que los cursos existan
    if (!garanteIds || garanteIds.length === 0) {
      throw new BadRequestException('Debe proporcionar al menos un ID de curso');
    }
     // Validar que los cursos existan y estén activos
    await this.validarGaranteExistenYActivos(garanteIds);

        
    const garantes = await this.garanteRepository.findByIds(garanteIds);
    cliente.garantes = [...cliente.garantes, ...garantes];
    return this.clienteRepository.save(cliente);
  }
  // hasta aqui *****************************************

  private async validarGaranteExistenYActivos(garanteIds: number[]): Promise<void> {
    // Buscar todos los garantes (activos e inactivos)
    const todosGarantes = await this.garanteRepository.find({
      where: { id_garante: In(garanteIds) },
    });

    // 1. Verificar que todos los IDs existan
    if (todosGarantes.length !== garanteIds.length) {
      const garantesEncontradosIds = todosGarantes.map(c => c.id_garante);
      const garantesNoEncontrados = garanteIds.filter(id => !garantesEncontradosIds.includes(id));
      
      throw new NotFoundException(
        `Los siguientes Garantes no existen: ${garantesNoEncontrados.join(', ')}`
      )
      }
    
      // 2. Verificar que TODOS estén ACTIVOS
    const garantesInactivos = todosGarantes.filter(garante => garante.verificado === false);
    
    // console.log(' Garantes inactivos encontrados:', garantesInactivos);

    if (garantesInactivos.length > 0) {
      const idsInactivos = garantesInactivos
        .map(c => `id_garante: ${c.id_garante}, nombre_garante: ${c.nombre_garante}, verificado: ${c.verificado}`)
        .join(' | ');
      
      // console.log('🚫 BLOQUEANDO: Hay Garantes inactivos');
      
      throw new BadRequestException(
        `❌ No se pueden asignar los siguientes Garantes porque están inactivos: ${idsInactivos}`
      );
    }
    }

    // Reemplazar cursos
  // estudiante.service.ts

async actualizarGarante(clienteId: number, garanteIds: number[]): Promise<Cliente> {
  const cliente = await this.clienteRepository.findOne({
    where: { id_cliente: clienteId },
    relations: ['garantes'],
  });

  if (!cliente) {
    throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);
  }

  // Validar que los cursos existan y estén activos
  await this.validarGaranteExistenYActivos(garanteIds);

  // Buscar los nuevos cursos
  const garantes = await this.garanteRepository.find({
    where: { 
      id_garante: In(garanteIds),
      verificado: true 
    },
  });

  // REEMPLAZAR todos los cursos (no agregar)
  cliente.garantes = garantes;

  return this.clienteRepository.save(cliente);
}
  
    
  async findAll(): Promise<Cliente[]> {
    return await this.clienteRepository.find({
      relations: ['garantes'],
      order: { fecha_registro: 'DESC' }
    });
  }

  // PARA MOSTRAR LOS GARANTES DE CLIENTES
  async findOne_cli_gar(id_cliente: number): Promise<Cliente> {
    const estudiante = await this.clienteRepository.findOne({
      where: { id_cliente },
      relations: ['garantes'],
    });

    if (!estudiante) {
      throw new NotFoundException(`Cliente con ID ${id_cliente} no fue encontrado`);
    }

    return estudiante;
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
