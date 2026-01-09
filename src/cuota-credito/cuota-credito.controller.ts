import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { CuotaCreditoService } from './cuota-credito.service';
import { CreateCuotaCreditoDto } from './dto/create-cuota-credito.dto';
import { UpdateCuotaCreditoDto } from './dto/update-cuota-credito.dto';
import { PagarCuotaDto } from './dto/pagar-cuota.dto';
import { FilterCuotaCreditoDto } from './dto/filter-cuota-credito.dto';

@Controller('cuota-credito')
export class CuotaCreditoController {
  constructor(private readonly cuotaCreditoService: CuotaCreditoService) {}

   @Post('register')
  create(@Body() createCuotaCreditoDto: CreateCuotaCreditoDto) {
    return this.cuotaCreditoService.create(createCuotaCreditoDto);
  }

  @Get()
  findAll(@Query() filters: FilterCuotaCreditoDto) {
    if (Object.keys(filters).length === 0) {
      return this.cuotaCreditoService.findAll();
    }
    return this.cuotaCreditoService.findWithFilters(filters);
  }

  @Get('venta/:idVenta')
  findByVenta(@Param('idVenta', ParseUUIDPipe) idVenta: string) {
    return this.cuotaCreditoService.findByVenta(idVenta);
  }

  @Get('vencidas')
  findVencidas() {
    return this.cuotaCreditoService.findWithFilters({ vencidas: 1 });
  }

  @Get('proximas-vencer')
  findProximasVencer(@Query('dias') dias: number = 7) {
    return this.cuotaCreditoService.findWithFilters({ proximasAVencer: dias });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.cuotaCreditoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCuotaCreditoDto: UpdateCuotaCreditoDto) {
    return this.cuotaCreditoService.update(id, updateCuotaCreditoDto);
  }

  @Post(':id/pagar')
  pagarCuota(@Param('id', ParseUUIDPipe) id: string, @Body() pagarCuotaDto: PagarCuotaDto) {
    return this.cuotaCreditoService.pagarCuota(id, pagarCuotaDto);
  }

  @Post(':id/calcular-mora')
  calcularMora(@Param('id', ParseUUIDPipe) id: string) {
    return this.cuotaCreditoService.calcularMora(id);
  }

  @Post('actualizar-moras')
  actualizarMoras() {
    return this.cuotaCreditoService.actualizarMorasMasivas();
  }

  @Post('generar-automaticas')
  generarCuotasAutomaticas(@Body() body: { idVenta: string; numeroCuotas: number; montoTotal: number; entradaInicial?: number }) {
    return this.cuotaCreditoService.generarCuotasAutomaticas(body.idVenta, body.numeroCuotas, body.montoTotal, body.entradaInicial);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.cuotaCreditoService.remove(id);
  }
}
