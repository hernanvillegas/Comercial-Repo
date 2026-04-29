import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { FilterVentaDto } from './dto/filter-venta.dto';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@ApiTags('Ventas')
@Controller('ventas')
export class VentasController {

    constructor(private readonly ventasService: VentasService) {}

    @Post('register')
    @Auth(ValidRoles.superAdmin, ValidRoles.admin)
    create(@Body() createVentaDto: CreateVentaDto) {
        return this.ventasService.create(createVentaDto);
    }

    @Get()
    @Auth(ValidRoles.superAdmin, ValidRoles.admin)
    findAll(@Query() query: FilterVentaDto) {
        const { limit, offset, ...filters } = query;

        const hasFilters = Object.values(filters).some(v => v !== undefined);

        if (!hasFilters) {
            return this.ventasService.findAll({ limit, offset });
        }
        return this.ventasService.findWithFilters(query);
    }

    @Get(':id')
    @Auth(ValidRoles.superAdmin, ValidRoles.admin)
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.ventasService.findOne(id);
    }

    @Patch(':id')
    @Auth(ValidRoles.superAdmin, ValidRoles.admin)
    update(@Param('id', ParseUUIDPipe) id: string, @Body() updateVentaDto: UpdateVentaDto) {
        return this.ventasService.update(id, updateVentaDto);
    }

    @Delete(':id')
    @Auth(ValidRoles.superAdmin)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.ventasService.remove(id);
    }
}