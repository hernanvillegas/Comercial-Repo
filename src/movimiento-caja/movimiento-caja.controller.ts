import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MovimientoCajaService } from './movimiento-caja.service';
import { CreateMovimientoCajaDto } from './dto/create-movimiento-caja.dto';
import { UpdateMovimientoCajaDto } from './dto/update-movimiento-caja.dto';
import { FilterMovimientoCajaDto } from './dto/filter-movimiento-caja.dto';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@ApiTags('Movimiento-Caja')
@Controller('movimiento-caja')
export class MovimientoCajaController {

    constructor(private readonly movimientoCajaService: MovimientoCajaService) {}

    // admin y super-user registran movimientos de caja
    @Post('register')
    @Auth(ValidRoles.superUser, ValidRoles.admin)
    create(@Body() createMovimientoCajaDto: CreateMovimientoCajaDto) {
        return this.movimientoCajaService.create(createMovimientoCajaDto);
    }

    @Get()
    @Auth(ValidRoles.superUser, ValidRoles.admin)
    findAll(@Query() filters: FilterMovimientoCajaDto) {
        if (Object.keys(filters).length === 0) {
            return this.movimientoCajaService.findAll();
        }
        return this.movimientoCajaService.findWithFilters(filters);
    }

    @Get('venta/:idVenta')
    @Auth(ValidRoles.superUser, ValidRoles.admin)
    findByVenta(@Param('idVenta', ParseUUIDPipe) idVenta: string) {
        return this.movimientoCajaService.findByVenta(idVenta);
    }

    @Get('cuota/:idCuota')
    @Auth(ValidRoles.superUser, ValidRoles.admin)
    findByCuota(@Param('idCuota', ParseUUIDPipe) idCuota: string) {
        return this.movimientoCajaService.findByCuota(idCuota);
    }

    // Resumen diario solo admin y super-user
    @Get('resumen/diario')
    @Auth(ValidRoles.superUser, ValidRoles.admin)
    obtenerResumenDiario(@Query('fecha') fecha?: string) {
        const fechaConsulta = fecha ? new Date(fecha) : new Date();
        return this.movimientoCajaService.obtenerResumenDiario(fechaConsulta);
    }

    @Get(':id')
    @Auth(ValidRoles.superUser, ValidRoles.admin)
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.movimientoCajaService.findOne(id);
    }

    // Solo super-user puede editar o eliminar movimientos de caja
    @Patch(':id')
    @Auth(ValidRoles.superUser)
    update(@Param('id', ParseUUIDPipe) id: string, @Body() updateMovimientoCajaDto: UpdateMovimientoCajaDto) {
        return this.movimientoCajaService.update(id, updateMovimientoCajaDto);
    }

    @Delete(':id')
    @Auth(ValidRoles.superUser)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.movimientoCajaService.remove(id);
    }
}
