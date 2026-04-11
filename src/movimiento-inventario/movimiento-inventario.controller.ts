import { Controller, Get, Post, Body, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MovimientoInventarioService } from './movimiento-inventario.service';
import { CreateMovimientoInventarioDto } from './dto/create-movimiento-inventario.dto';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@ApiTags('Movimiento-Inventario')
@Controller('movimiento-inventario')
export class MovimientoInventarioController {

    constructor(private readonly movimientoInventarioService: MovimientoInventarioService) {}

    @Post('register')
    @Auth()
    create(@Body() createMovimientoInventarioDto: CreateMovimientoInventarioDto) {
        return this.movimientoInventarioService.create(createMovimientoInventarioDto);
    }

    @Get()
    @Auth()
    findAll(@Query() filters: any) {
        if (Object.keys(filters).length === 0) {
            return this.movimientoInventarioService.findAll();
        }
        return this.movimientoInventarioService.findWithFilters(filters);
    }

    @Get('producto/:idProducto')
    @Auth()
    findByProducto(@Param('idProducto', ParseUUIDPipe) idProducto: string) {
        return this.movimientoInventarioService.findByProducto(idProducto);
    }

    @Get(':id')
    @Auth()
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.movimientoInventarioService.findOne(id);
    }

    @Delete(':id')
    @Auth(ValidRoles.admin)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.movimientoInventarioService.remove(id);
    }
}
