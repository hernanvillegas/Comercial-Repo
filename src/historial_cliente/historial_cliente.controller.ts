import {
  Controller, Get, Post, Body, Patch,
  Param, Delete, ParseIntPipe,
} from '@nestjs/common';
import { HistorialClienteService }   from './historial_cliente.service';
import { CreateHistorialClienteDto } from './dto/create-historial_cliente.dto';
import { UpdateHistorialClienteDto } from './dto/update-historial_cliente.dto';

@Controller('historial-cliente')
export class HistorialClienteController {
  constructor(private readonly historialClienteService: HistorialClienteService) {}

  @Post('register')
  create(@Body() dto: CreateHistorialClienteDto) {
    return this.historialClienteService.create(dto);
  }

  @Get()
  findAll() {
    return this.historialClienteService.findAll();
  }

  @Get(':clienteId/resumen')
  getResumenCliente(@Param('clienteId', ParseIntPipe) clienteId: number) {
    return this.historialClienteService.getResumenCliente(clienteId);
  }

  @Patch(':clienteId/observaciones')
  updateObservaciones(
    @Param('clienteId', ParseIntPipe) clienteId: number,
    @Body('observaciones') observaciones: string,
  ) {
    return this.historialClienteService.updateObservaciones(clienteId, observaciones);
  }

  @Patch(':clienteId/calificar')
  recalcularCalificacion(@Param('clienteId', ParseIntPipe) clienteId: number) {
    return this.historialClienteService.recalcularCalificacion(clienteId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.historialClienteService.findOne(id);
  }

  @Get(':userId/relations')
  findActiveProductsByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.historialClienteService.findActiveProductsByUserId(userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHistorialClienteDto,
  ) {
    return this.historialClienteService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.historialClienteService.remove(id);
  }
}