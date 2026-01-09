import { Module } from '@nestjs/common';
import { MovimientoCajaService } from './movimiento-caja.service';
import { MovimientoCajaController } from './movimiento-caja.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientoCaja } from './entities/movimiento-caja.entity';

@Module({
  controllers: [MovimientoCajaController],
  providers: [MovimientoCajaService],
  imports: [TypeOrmModule.forFeature([MovimientoCaja])],
  exports: [MovimientoCajaService],
})
export class MovimientoCajaModule {}

