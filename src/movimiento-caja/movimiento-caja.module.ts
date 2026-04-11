import { Module } from '@nestjs/common';
import { MovimientoCajaService } from './movimiento-caja.service';
import { MovimientoCajaController } from './movimiento-caja.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientoCaja } from './entities/movimiento-caja.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [MovimientoCajaController],
  providers: [MovimientoCajaService],
  imports: [ AuthModule, TypeOrmModule.forFeature([MovimientoCaja])],
  exports: [MovimientoCajaService],
})
export class MovimientoCajaModule {}

