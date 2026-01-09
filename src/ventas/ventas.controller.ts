import { Controller, Get, Post, Body, Patch, Param, Delete,ParseUUIDPipe, Query } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { FilterVentaDto } from './dto/filter-venta.dto';
// import { FilterVentaDto } from './dto/filter-venta.dto';


@Controller('ventas')
export class VentasController {

constructor(private readonly ventasService: VentasService) {}

  @Post('register')
  create(@Body() createVentaDto: CreateVentaDto) {
    return this.ventasService.create(createVentaDto);
  }

  @Get()
  findAll(@Query() filters: FilterVentaDto) {
    if (Object.keys(filters).length === 0) {
      return this.ventasService.findAll();
    }
    return this.ventasService.findWithFilters(filters);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ventasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateVentaDto: UpdateVentaDto) {
    return this.ventasService.update(id, updateVentaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ventasService.remove(id);
  }
}
