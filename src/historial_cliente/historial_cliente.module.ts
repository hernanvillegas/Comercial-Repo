import { Module } from '@nestjs/common';
import { HistorialClienteService } from './historial_cliente.service';
import { HistorialClienteController } from './historial_cliente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialCliente } from './entities/historial_cliente.entity';
import { ClienteService } from 'src/cliente/cliente.service';
import { Cliente } from '../cliente/entities/cliente.entity';

@Module({
  controllers: [HistorialClienteController],
  providers: [HistorialClienteService],
  imports: [TypeOrmModule.forFeature([HistorialCliente,Cliente,ClienteService])],
  exports: [HistorialClienteService]

})
export class HistorialClienteModule {}

