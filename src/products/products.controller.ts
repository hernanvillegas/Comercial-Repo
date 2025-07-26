import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/paginacion.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll( @Query() paginationDto:PaginationDto ){
    return this.productsService.findAll(paginationDto);
  }

  @Get(':termino_busqueda')
  findOne(@Param('termino_busqueda') termino_busqueda: string) {
    return this.productsService.findOne(termino_busqueda);
  }



  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update( id, updateProductDto);
  }

  @Delete(':id_moto')
  remove(@Param('id_moto', ParseUUIDPipe) id_moto: string) {
    return this.productsService.remove(id_moto);
  }
}
