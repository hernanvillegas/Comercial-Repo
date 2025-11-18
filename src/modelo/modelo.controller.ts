import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ModeloService } from './modelo.service';
import { CreateModeloDto } from './dto/create-modelo.dto';
import { UpdateModeloDto } from './dto/update-modelo.dto';

@Controller('modelo')
export class ModeloController {
  constructor(private readonly modeloService: ModeloService) {}

  @Post('register')
  create(@Body() createModeloDto: CreateModeloDto) {
    return this.modeloService.create(createModeloDto);
  }

  @Get()
  findAll() {
    return this.modeloService.findAll();
  }

  @Get('marca/:idMarca')
  findByMarca(@Param('idMarca') idMarca: string) {
    return this.modeloService.findByMarca(+idMarca);
  }

  @Get('combustible/:tipo')
  findByTipoCombustible(@Param('tipo') tipo: string) {
    return this.modeloService.findByTipoCombustible(tipo);
  }

  @Get('anio/:anio')
  findByAño(@Param('año') anio: Date) {
    return this.modeloService.findByAño(anio);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modeloService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateModeloDto: UpdateModeloDto) {
    return this.modeloService.update(+id, updateModeloDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.modeloService.remove(+id);
  }
}
