import {
    Controller, Get, Post, Body,
    Patch, Param, Delete,
    ParseUUIDPipe, Query,
} from '@nestjs/common';
import { ApiTags }                  from '@nestjs/swagger';
import { MovimientoCajaService }    from './movimiento-caja.service';
import { CreateMovimientoCajaDto }  from './dto/create-movimiento-caja.dto';
import { UpdateMovimientoCajaDto }  from './dto/update-movimiento-caja.dto';
import { FilterMovimientoCajaDto }  from './dto/filter-movimiento-caja.dto';
import { Auth }                     from 'src/auth/decorators';
import { ValidRoles }               from 'src/auth/interfaces';

@ApiTags('Movimiento-Caja')
@Controller('movimiento-caja')
export class MovimientoCajaController {

    constructor(private readonly movimientoCajaService: MovimientoCajaService) {}

    // ── Rutas estáticas primero (antes que :id) ───────────────────────────────

    @Post('register')
    @Auth(ValidRoles.superAdmin, ValidRoles.admin)
    create(@Body() createMovimientoCajaDto: CreateMovimientoCajaDto) {
        return this.movimientoCajaService.create(createMovimientoCajaDto);
    }

    @Get()
    @Auth(ValidRoles.superAdmin, ValidRoles.admin)
    findAll(@Query() filters: FilterMovimientoCajaDto) {
        return this.movimientoCajaService.findWithFilters(filters);
    }

    /** GET /movimiento-caja/resumen/diario?fecha=YYYY-MM-DD */
    @Get('resumen/diario')
    @Auth(ValidRoles.superAdmin, ValidRoles.admin)
    obtenerResumenDiario(@Query('fecha') fecha?: string) {
        const fechaConsulta = fecha ? new Date(fecha) : new Date();
        return this.movimientoCajaService.obtenerResumenDiario(fechaConsulta);
    }

    /**
     * GET /movimiento-caja/resumen/periodo?fechaDesde=YYYY-MM-DD&fechaHasta=YYYY-MM-DD
     * Devuelve totales del período + desglose por día (para gráficas semana/mes)
     */
    @Get('resumen/periodo')
    @Auth(ValidRoles.superAdmin, ValidRoles.admin)
    obtenerResumenPeriodo(
        @Query('fechaDesde') fechaDesde: string,
        @Query('fechaHasta') fechaHasta: string,
    ) {
        const desde = new Date(fechaDesde || new Date().toISOString().slice(0, 10));
        const hasta = new Date(fechaHasta || new Date().toISOString().slice(0, 10));
        return this.movimientoCajaService.obtenerResumenPeriodo(desde, hasta);
    }

    /**
     * GET /movimiento-caja/saldo/historico?hasta=YYYY-MM-DD
     * Devuelve el saldo acumulado total desde el primer movimiento
     */
    @Get('saldo/historico')
    @Auth(ValidRoles.superAdmin, ValidRoles.admin)
    obtenerSaldoHistorico(@Query('hasta') hasta?: string) {
        const fechaHasta = hasta ? new Date(hasta) : undefined;
        return this.movimientoCajaService.obtenerSaldoHistorico(fechaHasta);
    }

    @Get('venta/:idVenta')
    @Auth(ValidRoles.superAdmin, ValidRoles.admin)
    findByVenta(@Param('idVenta', ParseUUIDPipe) idVenta: string) {
        return this.movimientoCajaService.findByVenta(idVenta);
    }

    @Get('cuota/:idCuota')
    @Auth(ValidRoles.superAdmin, ValidRoles.admin)
    findByCuota(@Param('idCuota', ParseUUIDPipe) idCuota: string) {
        return this.movimientoCajaService.findByCuota(idCuota);
    }

    @Get(':id')
    @Auth(ValidRoles.superAdmin, ValidRoles.admin)
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.movimientoCajaService.findOne(id);
    }

    @Patch(':id')
    @Auth(ValidRoles.superAdmin)
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateMovimientoCajaDto: UpdateMovimientoCajaDto,
    ) {
        return this.movimientoCajaService.update(id, updateMovimientoCajaDto);
    }

    @Delete(':id')
    @Auth(ValidRoles.superAdmin)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.movimientoCajaService.remove(id);
    }
}