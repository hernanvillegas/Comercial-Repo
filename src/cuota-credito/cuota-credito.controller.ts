import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CuotaCreditoService } from './cuota-credito.service';
import { CreateCuotaCreditoDto } from './dto/create-cuota-credito.dto';
import { UpdateCuotaCreditoDto } from './dto/update-cuota-credito.dto';
import { FilterCuotaCreditoDto } from './dto/filter-cuota-credito.dto';
import { PagarCuotaDto } from './dto/pagar-cuota.dto';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { PaginationDto } from 'src/common/dto/paginacion.dto';

@ApiTags('Cuota-Credito')
@Controller('cuota-credito')
export class CuotaCreditoController {

    constructor(private readonly cuotaCreditoService: CuotaCreditoService) {}

    @Post()
    @Auth(ValidRoles.superAdmin, ValidRoles.admin)
    create(@Body() createCuotaCreditoDto: CreateCuotaCreditoDto) {
        return this.cuotaCreditoService.create(createCuotaCreditoDto);
    }

    @Get()
    @Auth(ValidRoles.superAdmin, ValidRoles.admin)
    findAll(
        @Query() filters: FilterCuotaCreditoDto,
        @Query() pagination: PaginationDto,
    ) {
        if (Object.keys(filters).length === 0) {
            return this.cuotaCreditoService.findAll(pagination);
        }
        return this.cuotaCreditoService.findWithFilters(filters);
    }

    @Get('venta/:idVenta')
    @Auth(ValidRoles.superAdmin, ValidRoles.admin)
    findByVenta(@Param('idVenta', ParseUUIDPipe) idVenta: string) {
        return this.cuotaCreditoService.findByVenta(idVenta);
    }

    @Get(':id')
    @Auth(ValidRoles.superAdmin, ValidRoles.admin)
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.cuotaCreditoService.findOne(id);
    }

    // admin puede cobrar cuotas
    @Post(':id/pagar')
    @Auth(ValidRoles.superAdmin, ValidRoles.admin)
    pagarCuota(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() pagarCuotaDto: PagarCuotaDto,
    ) {
        return this.cuotaCreditoService.pagarCuota(id, pagarCuotaDto);
    }

    @Get(':id/mora')
    @Auth(ValidRoles.superAdmin, ValidRoles.admin)
    calcularMora(@Param('id', ParseUUIDPipe) id: string) {
        return this.cuotaCreditoService.calcularMora(id);
    }

    @Patch(':id')
    @Auth(ValidRoles.superAdmin, ValidRoles.admin)
    update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCuotaCreditoDto: UpdateCuotaCreditoDto) {
        return this.cuotaCreditoService.update(id, updateCuotaCreditoDto);
    }

    // Solo super-user puede eliminar cuotas
    @Delete(':id')
    @Auth(ValidRoles.superAdmin)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.cuotaCreditoService.remove(id);
    }
}
