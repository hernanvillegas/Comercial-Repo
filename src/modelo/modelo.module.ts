import { Module } from '@nestjs/common';
import { ModeloService } from './modelo.service';
import { ModeloController } from './modelo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Modelo } from './entities/modelo.entity';
import { Marca } from 'src/marca/entities/marca.entity';

@Module({
  controllers: [ModeloController],
  providers: [ModeloService],
  imports:[
      TypeOrmModule.forFeature([Modelo,Marca]) //LA LINEA MARCA ES LA QUE ME HIZO SUFRIR AL IMPORTAR
    ],
    exports:[ModeloService]
  
})
export class ModeloModule {}
