import {
    Controller, Get, Post, Body, Patch, Param,
    Delete, ParseUUIDPipe, Query
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { PaginationDto } from 'src/common/dto/paginacion.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { User } from 'src/auth/entities/user.entity';

@ApiTags('Producto')
@Controller('producto')
export class ProductoController {

    constructor(private readonly productoService: ProductoService) {}

    @Post()
    @Auth()
    @ApiResponse({ status: 201, description: 'Producto creado correctamente' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 403, description: 'Forbidden. Token related.' })
    create(@Body() createProductoDto: CreateProductoDto, @GetUser() user: User) {
        return this.productoService.create(createProductoDto, user);
    }

    @Get()
    findAll(@Query() paginationDto: PaginationDto) {
        return this.productoService.findAll(paginationDto);
    }

    @Get('stock-bajo')
    @Auth(ValidRoles.admin)
    findStockBajo() {
        return this.productoService.findStockBajo();
    }

    @Get('tipo/:tipo')
    findByTipo(@Param('tipo') tipo: string, @Query() paginationDto: PaginationDto) {
        return this.productoService.findByTipo(tipo, paginationDto);
    }

    @Get(':termino_busqueda')
    findOne(@Param('termino_busqueda') termino_busqueda: string) {
        return this.productoService.findOnePlain(termino_busqueda);
    }

    @Patch(':id')
    @Auth(ValidRoles.admin)
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateProductoDto: UpdateProductoDto,
        @GetUser() user: User,
    ) {
        return this.productoService.update(id, updateProductoDto, user);
    }

    @Delete(':id')
    @Auth(ValidRoles.admin)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.productoService.remove(id);
    }
}
