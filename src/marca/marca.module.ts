import { Module } from '@nestjs/common';
import { MarcaService } from './marca.service';
import { MarcaController } from './marca.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Marca } from './entities/marca.entity';

@Module({
  controllers: [MarcaController],
  providers: [MarcaService],
  imports:[
    TypeOrmModule.forFeature([Marca])
  ],
  exports:[MarcaService,
    TypeOrmModule
  ]
})
export class MarcaModule {}
