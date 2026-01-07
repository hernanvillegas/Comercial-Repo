import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { GaranteService } from './garante.service';
import { CreateGaranteDto } from './dto/create-garante.dto';
import { UpdateGaranteDto } from './dto/update-garante.dto';
import { Garante } from './entities/garante.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('garante')
export class GaranteController {
  constructor(private readonly garanteService: GaranteService,
    @InjectRepository(Garante)
    private garanteRepository: Repository<Garante>
  ) {}
  
    
@Post('register')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createGaranteDto: CreateGaranteDto) {
    return this.garanteService.create(createGaranteDto);
  }

  // @Get()
  // findAll() {
  //   return this.garanteService.findAll();
  // }

  @Get()
  findAll() {
    return this.garanteRepository.find({ relations: ['clientes'] });
  }


  @Get('verificados')
  findVerificados() {
    return this.garanteService.findVerificados();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.garanteService.findOne(id);
  }

  @Get('ci/:ci')
  findByCI(@Param('ci', ParseIntPipe) ci: number) {
    return this.garanteService.findByCI(ci);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGaranteDto: UpdateGaranteDto,
  ) {
    return this.garanteService.update(id, updateGaranteDto);
  }

  @Patch(':id/verificar')
  verificar(@Param('id', ParseIntPipe) id: number) {
    return this.garanteService.verificar(id);
  }

  @Patch(':id/desverificar')
  desverificar(@Param('id', ParseIntPipe) id: number) {
    return this.garanteService.desverificar(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.garanteService.remove(id);
  }
  }

  
