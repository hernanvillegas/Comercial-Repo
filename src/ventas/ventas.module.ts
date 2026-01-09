import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';

@Module({
  controllers: [VentasController],
  providers: [VentasService],
  imports: [TypeOrmModule.forFeature([Venta])],
  exports: [VentasService],
})
export class VentasModule {}


