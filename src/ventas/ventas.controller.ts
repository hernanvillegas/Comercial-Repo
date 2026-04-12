import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { FilterVentaDto } from './dto/filter-venta.dto';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { PaginationDto } from 'src/common/dto/paginacion.dto';

@ApiTags('Ventas')
@Controller('ventas')
export class VentasController {

    constructor(private readonly ventasService: VentasService) {}

    // admin y super-user pueden crear ventas
    @Post('register')
    @Auth(ValidRoles.superAdmin, ValidRoles.admin)
    create(@Body() createVentaDto: CreateVentaDto) {
        return this.ventasService.create(createVentaDto);
    }

    // admin y super-user pueden ver ventas
    @Get()
    @Auth(ValidRoles.superAdmin, ValidRoles.admin)
    findAll(
        @Query() filters: FilterVentaDto,
        @Query() pagination: PaginationDto,
    ) {
        if (Object.keys(filters).length === 0) {
            return this.ventasService.findAll(pagination);
        }
        return this.ventasService.findWithFilters(filters);
    }
    @Get(':id')
    @Auth(ValidRoles.superAdmin, ValidRoles.admin)
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.ventasService.findOne(id);
    }

    // admin puede actualizar estado de venta, super-user también
    @Patch(':id')
    @Auth(ValidRoles.superAdmin, ValidRoles.admin)
    update(@Param('id', ParseUUIDPipe) id: string, @Body() updateVentaDto: UpdateVentaDto) {
        return this.ventasService.update(id, updateVentaDto);
    }

    // Solo super-user puede eliminar ventas
    @Delete(':id')
    @Auth(ValidRoles.superAdmin)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.ventasService.remove(id);
    }
}
