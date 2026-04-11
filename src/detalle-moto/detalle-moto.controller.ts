import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DetalleMotoService } from './detalle-moto.service';
import { CreateDetalleMotoDto } from './dto/create-detalle-moto.dto';
import { UpdateDetalleMotoDto } from './dto/update-detalle-moto.dto';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@ApiTags('Detalle-Moto')
@Controller('detalle-moto')
export class DetalleMotoController {

    constructor(private readonly detalleMotoService: DetalleMotoService) {}

    @Post()
    @Auth()
    create(@Body() createDetalleMotoDto: CreateDetalleMotoDto) {
        return this.detalleMotoService.create(createDetalleMotoDto);
    }

    @Get()
    findAll() {
        return this.detalleMotoService.findAll();
    }

    @Get('estado/:estado')
    findByEstado(@Param('estado') estado: string) {
        return this.detalleMotoService.findByEstado(estado);
    }

    @Get('producto/:idProducto')
    findByProducto(@Param('idProducto') idProducto: string) {
        return this.detalleMotoService.findByProducto(idProducto);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.detalleMotoService.findOne(id);
    }

    @Patch(':id')
    @Auth(ValidRoles.admin)
    update(@Param('id', ParseIntPipe) id: number, @Body() updateDetalleMotoDto: UpdateDetalleMotoDto) {
        return this.detalleMotoService.update(id, updateDetalleMotoDto);
    }

    @Delete(':id')
    @Auth(ValidRoles.admin)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.detalleMotoService.remove(id);
    }
}
