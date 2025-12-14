import { Module } from '@nestjs/common';
import { GaranteService } from './garante.service';
import { GaranteController } from './garante.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Garante } from './entities/garante.entity';

@Module({
  controllers: [GaranteController],
  providers: [GaranteService],
  imports: [TypeOrmModule.forFeature([Garante])],
  exports: [GaranteService],
})
export class GaranteModule {}
