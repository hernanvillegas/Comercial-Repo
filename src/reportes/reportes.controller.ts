import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@ApiTags('Reportes')
@Controller('reportes')
@Auth(ValidRoles.superAdmin, ValidRoles.admin) // todos los reportes requieren al menos admin
export class ReportesController {

    constructor(private readonly reportesService: ReportesService) {}

    // GET /api/reportes/productos/mas-vendidos?fechaDesde=2024-01-01&fechaHasta=2024-12-31&limit=10
    @Get('productos/mas-vendidos')
    productosMasVendidos(
        @Query('fechaDesde') fechaDesde?: string,
        @Query('fechaHasta') fechaHasta?: string,
        @Query('limit')      limit = 10,
    ) {
        return this.reportesService.productosMasVendidos(fechaDesde, fechaHasta, Number(limit));
    }

    // GET /api/reportes/productos/menos-vendidos?limit=10
    @Get('productos/menos-vendidos')
    productosMenosVendidos(@Query('limit') limit = 10) {
        return this.reportesService.productosMenosVendidos(Number(limit));
    }

    // GET /api/reportes/productos/stock-bajo
    @Get('productos/stock-bajo')
    stockBajo() {
        return this.reportesService.stockBajo();
    }

    // GET /api/reportes/productos/rentabilidad?limit=10
    @Get('productos/rentabilidad')
    @Auth(ValidRoles.superAdmin) // solo super-user ve rentabilidad
    rentabilidad(@Query('limit') limit = 10) {
        return this.reportesService.rentabilidadProductos(Number(limit));
    }

    // GET /api/reportes/ventas/periodo?periodo=mes&fechaDesde=2024-01-01
    @Get('ventas/periodo')
    ventasPorPeriodo(
        @Query('periodo')    periodo: 'dia' | 'mes' | 'anio' = 'mes',
        @Query('fechaDesde') fechaDesde?: string,
        @Query('fechaHasta') fechaHasta?: string,
    ) {
        return this.reportesService.ventasPorPeriodo(periodo, fechaDesde, fechaHasta);
    }

    // GET /api/reportes/ventas/empleados?fechaDesde=2024-01-01
    @Get('ventas/empleados')
    ventasPorEmpleado(
        @Query('fechaDesde') fechaDesde?: string,
        @Query('fechaHasta') fechaHasta?: string,
    ) {
        return this.reportesService.ventasPorEmpleado(fechaDesde, fechaHasta);
    }

    // GET /api/reportes/clientes/ranking?limit=10
    @Get('clientes/ranking')
    rankingClientes(@Query('limit') limit = 10) {
        return this.reportesService.rankingClientes(Number(limit));
    }

    // GET /api/reportes/clientes/:idCliente/historial
    @Get('clientes/:idCliente/historial')
    historialCliente(@Param('idCliente', ParseIntPipe) idCliente: number) {
        return this.reportesService.historialComprasCliente(idCliente);
    }

    // GET /api/reportes/clientes/:idCliente/credito
    @Get('clientes/:idCliente/credito')
    seguimientoCredito(@Param('idCliente', ParseIntPipe) idCliente: number) {
        return this.reportesService.seguimientoCreditoCliente(idCliente);
    }

    // GET /api/reportes/cuotas/atrasadas
    @Get('cuotas/atrasadas')
    cuotasAtrasadas() {
        return this.reportesService.cuotasAtrasadas();
    }

    // GET /api/reportes/cuotas/proximas-vencer?dias=7
    @Get('cuotas/proximas-vencer')
    cuotasProximasVencer(@Query('dias') dias = 7) {
        return this.reportesService.cuotasProximasVencer(Number(dias));
    }

    // GET /api/reportes/caja/balance?fechaDesde=2024-01-01&fechaHasta=2024-01-31
    @Get('caja/balance')
    balanceCaja(
        @Query('fechaDesde') fechaDesde?: string,
        @Query('fechaHasta') fechaHasta?: string,
    ) {
        return this.reportesService.balanceCaja(fechaDesde, fechaHasta);
    }
}
