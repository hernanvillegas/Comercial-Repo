import { Module } from '@nestjs/common';
import { CuotaCreditoService } from './cuota-credito.service';
import { CuotaCreditoController } from './cuota-credito.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuotaCredito } from './entities/cuota-credito.entity';
import { MovimientoCaja } from 'src/movimiento-caja/entities/movimiento-caja.entity';

@Module({
  controllers: [CuotaCreditoController],
  providers: [CuotaCreditoService],
  imports: [TypeOrmModule.forFeature([CuotaCredito, MovimientoCaja])],
  exports: [CuotaCreditoService],
})
export class CuotaCreditoModule {}

  
