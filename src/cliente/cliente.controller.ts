import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseIntPipe, Query } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Controller('cliente')
export class ClienteController {

  constructor(private readonly clientesService: ClienteService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  @Patch(':id/garantes')
  asignarGarantes(
    @Param('id') id: number,
    @Body() body: { garanteIds: number[] },
  ) {
    return this.clientesService.asignarGarantes(id, body.garanteIds);
  }

  @Get()
  findAll() {
    return this.clientesService.findAll();
  }

  @Get(':id/cli_gar')
  findOne_cli_gar(@Param('id') id: number) {
    return this.clientesService.findOne_cli_gar(id);
  }

  @Get('verificados')
  findVerificados() {
    return this.clientesService.findVerificados();
  }

  @Get('ciudad/:ciudad')
  findByCiudad(@Param('ciudad') ciudad: string) {
    return this.clientesService.findByCiudad(ciudad);
  }

  @Get('provincia/:provincia')
  findByProvincia(@Param('provincia') provincia: string) {
    return this.clientesService.findByProvincia(provincia);
  }

  @Get('search/ci/:ci')
  findByCI(@Param('ci', ParseIntPipe) ci: number) {
    return this.clientesService.findByCI(ci);
  }

  @Get('search/email')
  findByEmail(@Query('email') email: string) {
    return this.clientesService.findByEmail(email);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.findOne(id);
  }


  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    return this.clientesService.update(id, updateClienteDto);
  }

  @Patch(':id/verificar')
  verificar(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.verificar(id);
  }

  @Patch(':id/desverificar')
  desverificar(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.desverificar(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.remove(id);
  }
}
