import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { CategoriaProductoService } from './categoria-producto.service';
import { CreateCategoriaProductoDto } from './dto/create-categoria-producto.dto';
import { UpdateCategoriaProductoDto } from './dto/update-categoria-producto.dto';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Categoria-Producto')
@Controller('categoria-producto')
export class CategoriaProductoController {

    constructor(private readonly categoriaProductoService: CategoriaProductoService) {}

    @Post()
    @Auth(ValidRoles.admin)
    create(@Body() createCategoriaProductoDto: CreateCategoriaProductoDto) {
        return this.categoriaProductoService.create(createCategoriaProductoDto);
    }

    @Get()
    findAll() {
        return this.categoriaProductoService.findAll();
    }

    @Get('tipo/:tipo')
    findByTipo(@Param('tipo') tipo: string) {
        return this.categoriaProductoService.findByTipo(tipo);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.categoriaProductoService.findOne(id);
    }

    @Patch(':id')
    @Auth(ValidRoles.admin)
    update(@Param('id', ParseIntPipe) id: number, @Body() updateCategoriaProductoDto: UpdateCategoriaProductoDto) {
        return this.categoriaProductoService.update(id, updateCategoriaProductoDto);
    }

    @Delete(':id')
    @Auth(ValidRoles.admin)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.categoriaProductoService.remove(id);
    }
}
