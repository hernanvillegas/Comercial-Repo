import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/paginacion.dto';


import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { User } from 'src/auth/entities/user.entity';

@Controller('products')
// @Auth() PARA CUALQUIER OPERACION
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  // @Auth(ValidRoles.admin)  //PARA QUE CUALQUIER USUARIO PUEDA CREAR (admin,user,super-admin)
  @Auth()
  create(@Body() createProductDto: CreateProductDto,

  @GetUser() user:User,
  )  
  {
    return this.productsService.create(createProductDto,user);
  }

  @Get()
  //cualquiera puede ver los productos
  findAll( @Query() paginationDto:PaginationDto ){
    return this.productsService.findAll(paginationDto);
  }

  @Get(':termino_busqueda')
  findOne(@Param('termino_busqueda') termino_busqueda: string) {
    return this.productsService.findOnePlain(termino_busqueda);
  }



  @Patch(':id')
  @Auth(ValidRoles.admin) // solo admin
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User,
  ) {
    return this.productsService.update( id, updateProductDto, user);
  }

    @Delete(':id')
    @Auth(ValidRoles.admin)  //solo admin
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
