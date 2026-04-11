import {
    Controller, Get, Post, Body, Patch, Param,
    Delete, ParseUUIDPipe, Query
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/paginacion.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { User } from 'src/auth/entities/user.entity';
import { Product } from './entities/product.entity';

@ApiTags('Products')
@Controller('products')
export class ProductsController {

    constructor(private readonly productsService: ProductsService) {}

    // Solo super-user puede crear productos en el catálogo
    @Post()
    @Auth(ValidRoles.superUser)
    @ApiResponse({ status: 201, description: 'Producto creado', type: Product })
    @ApiResponse({ status: 403, description: 'Solo super-user puede crear productos' })
    create(@Body() createProductDto: CreateProductDto, @GetUser() user: User) {
        return this.productsService.create(createProductDto, user);
    }

    // Cualquiera puede ver el catálogo
    @Get()
    findAll(@Query() paginationDto: PaginationDto) {
        return this.productsService.findAll(paginationDto);
    }

    @Get(':termino_busqueda')
    findOne(@Param('termino_busqueda') termino_busqueda: string) {
        return this.productsService.findOnePlain(termino_busqueda);
    }

    // Solo super-user puede editar el catálogo
    @Patch(':id')
    @Auth(ValidRoles.superUser)
    @ApiResponse({ status: 403, description: 'Solo super-user puede editar productos' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateProductDto: UpdateProductDto,
        @GetUser() user: User,
    ) {
        return this.productsService.update(id, updateProductDto, user);
    }

    // Solo super-user puede eliminar
    @Delete(':id')
    @Auth(ValidRoles.superUser)
    @ApiResponse({ status: 403, description: 'Solo super-user puede eliminar productos' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.productsService.remove(id);
    }
}
