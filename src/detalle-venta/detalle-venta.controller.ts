import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DetalleVentaService } from './detalle-venta.service';
import { CreateDetalleVentaDto } from './dto/create-detalle-venta.dto';
import { UpdateDetalleVentaDto } from './dto/update-detalle-venta.dto';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@ApiTags('Detalle-Venta')
@Controller('detalle-venta')
export class DetalleVentaController {

    constructor(private readonly detalleVentaService: DetalleVentaService) {}

    @Post()
    @Auth()
    create(@Body() createDetalleVentaDto: CreateDetalleVentaDto) {
        return this.detalleVentaService.create(createDetalleVentaDto);
    }

    @Get()
    findAll() {
        return this.detalleVentaService.findAll();
    }

    @Get('venta/:idVenta')
    findByVenta(@Param('idVenta', ParseUUIDPipe) idVenta: string) {
        return this.detalleVentaService.findByVenta(idVenta);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.detalleVentaService.findOne(id);
    }

    @Patch(':id')
    @Auth(ValidRoles.admin)
    update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDetalleVentaDto: UpdateDetalleVentaDto) {
        return this.detalleVentaService.update(id, updateDetalleVentaDto);
    }

    @Delete(':id')
    @Auth(ValidRoles.admin)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.detalleVentaService.remove(id);
    }
}
