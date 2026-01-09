import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { MovimientoCajaService } from './movimiento-caja.service';
import { CreateMovimientoCajaDto } from './dto/create-movimiento-caja.dto';
import { UpdateMovimientoCajaDto } from './dto/update-movimiento-caja.dto';
import { FilterMovimientoCajaDto } from './dto/filter-movimiento-caja.dto';

@Controller('movimiento-caja')
export class MovimientoCajaController {
  constructor(private readonly movimientoCajaService: MovimientoCajaService) {}

  @Post('register')
  create(@Body() createMovimientoCajaDto: CreateMovimientoCajaDto) {
    return this.movimientoCajaService.create(createMovimientoCajaDto);
  }

  @Get()
  findAll(@Query() filters: FilterMovimientoCajaDto) {
    if (Object.keys(filters).length === 0) {
      return this.movimientoCajaService.findAll();
    }
    return this.movimientoCajaService.findWithFilters(filters);
  }

  @Get('venta/:idVenta')
  findByVenta(@Param('idVenta', ParseUUIDPipe) idVenta: string) {
    return this.movimientoCajaService.findByVenta(idVenta);
  }

  @Get('cuota/:idCuota')
  findByCuota(@Param('idCuota', ParseUUIDPipe) idCuota: string) {
    return this.movimientoCajaService.findByCuota(idCuota);
  }

  @Get('resumen/diario')
  obtenerResumenDiario(@Query('fecha') fecha?: string) {
    const fechaConsulta = fecha ? new Date(fecha) : new Date();
    return this.movimientoCajaService.obtenerResumenDiario(fechaConsulta);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.movimientoCajaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateMovimientoCajaDto: UpdateMovimientoCajaDto) {
    return this.movimientoCajaService.update(id, updateMovimientoCajaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.movimientoCajaService.remove(id);
  }
}
