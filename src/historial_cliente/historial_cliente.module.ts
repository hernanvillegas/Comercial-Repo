import { Module } from '@nestjs/common';
import { HistorialClienteService } from './historial_cliente.service';
import { HistorialClienteController } from './historial_cliente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialCliente } from './entities/historial_cliente.entity';

@Module({
  controllers: [HistorialClienteController],
  providers: [HistorialClienteService],
  imports: [TypeOrmModule.forFeature([HistorialCliente])],
  exports: [HistorialClienteService]
})
export class HistorialClienteModule {}

