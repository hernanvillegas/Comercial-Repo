import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseBoolPipe, ParseIntPipe } from '@nestjs/common';
import { HistorialClienteService } from './historial_cliente.service';
import { CreateHistorialClienteDto } from './dto/create-historial_cliente.dto';
import { UpdateHistorialClienteDto } from './dto/update-historial_cliente.dto';

@Controller('historial-cliente')
export class HistorialClienteController {
  constructor(private readonly historialClienteService: HistorialClienteService) { }


  @Post('register')
  create(@Body() createHistorialClienteDto: CreateHistorialClienteDto) {
    return this.historialClienteService.create(createHistorialClienteDto);
  }

  @Get()
  findAll() {
    return this.historialClienteService.findAll();
  }

  // @Get()
  // findAll(@Query('cumplido', new ParseBoolPipe({ optional: true })) cumplido?: boolean) {
  //   if (cumplido !== undefined) {
  //     return this.historialClienteService.findByCumplido(cumplido); 
  //   }
  //   return this.historialClienteService.findAll();
  // }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.historialClienteService.findOne(id);
  }

  @Get(':userId/relations')
  async findActiveProductsByUserId(@Param('userId') userId: string) {
    return await this.historialClienteService.findActiveProductsByUserId(+userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHistorialClienteDto: UpdateHistorialClienteDto,
  ) {
    return this.historialClienteService.update(id, updateHistorialClienteDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.historialClienteService.remove(id);
  }
}
