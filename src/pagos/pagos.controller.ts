import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { PaginationDto } from 'src/common/dto/paginacion.dto';

@ApiTags('Pagos')
@Controller('pagos')
export class PagosController {

    constructor(private readonly pagosService: PagosService) {}

    @Post('register')
    @Auth()
    create(@Body() createPagoDto: CreatePagoDto) {
        return this.pagosService.create(createPagoDto);
    }

    @Get()
    @Auth()
    findAll(
        @Query() filters: any,
        @Query() pagination: PaginationDto,
    ) {
        if (Object.keys(filters).length === 0) {
            return this.pagosService.findAll(pagination);
        }
        return this.pagosService.findWithFilters(filters);
    }

    @Get('resumen/metodo')
    @Auth(ValidRoles.admin)
    obtenerResumenPorMetodo(
        @Query('fechaDesde') fechaDesde?: string,
        @Query('fechaHasta') fechaHasta?: string,
    ) {
        return this.pagosService.obtenerResumenPorMetodo(
            fechaDesde ? new Date(fechaDesde) : undefined,
            fechaHasta ? new Date(fechaHasta) : undefined,
        );
    }

    @Get('venta/:idVenta')
    @Auth()
    findByVenta(@Param('idVenta', ParseUUIDPipe) idVenta: string) {
        return this.pagosService.findByVenta(idVenta);
    }

    @Get('cuota/:idCuota')
    @Auth()
    findByCuota(@Param('idCuota', ParseUUIDPipe) idCuota: string) {
        return this.pagosService.findByCuota(idCuota);
    }

    @Get(':id')
    @Auth()
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.pagosService.findOne(id);
    }

    @Patch(':id')
    @Auth(ValidRoles.admin)
    update(@Param('id', ParseUUIDPipe) id: string, @Body() updatePagoDto: UpdatePagoDto) {
        return this.pagosService.update(id, updatePagoDto);
    }

    @Delete(':id')
    @Auth(ValidRoles.admin)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.pagosService.remove(id);
    }
}
