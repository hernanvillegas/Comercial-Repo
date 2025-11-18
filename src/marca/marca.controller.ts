import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MarcaService } from './marca.service';
import { CreateMarcaDto } from './dto/create.marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';

@Controller('marca')
export class MarcaController {
  constructor(private readonly marcaService: MarcaService) {}

  @Post('register')
  create(@Body() createMarcaDto: CreateMarcaDto) {
    return this.marcaService.create(createMarcaDto);
  }
   
  @Get()
  findAll() {
    return this.marcaService.findAll();
  }

  @Get('activas')
  findActivas() {
    return this.marcaService.findActivas();
  }

  // marcas con modelos
  @Get('with-modelos')
  findAllWithModelos() {
    return this.marcaService.findAllWithModelos();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.marcaService.findOne( +id );
  }

   @Patch(':id')
  update(@Param('id') id: string, @Body() updateMarcaDto: UpdateMarcaDto) {
    return this.marcaService.update(+id, updateMarcaDto);
  }

  @Patch(':id/toggle-activo')
  toggleActivo(@Param('id') id: string) {
    return this.marcaService.toggleActivo(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.marcaService.remove(+id);
  }
}
