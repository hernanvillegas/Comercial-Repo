import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';

import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/paginacion.dto';

import {validate as isUUID} from 'uuid';

@Injectable()
export class ProductsService {

  private readonly logger= new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository:Repository<Product>,
  ){}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto); // solo crea la instancia del poroducto
      await this.productRepository.save(product); // lo guarda en la bd 
      return product;
    } catch (error) {
      this.manejoDBExcepciones(error);
    }
    
    
  }

  findAll(paginationDto:PaginationDto) {

    const {limit = 10 , offset = 0} = paginationDto;
    return this.productRepository.find({
      take: limit,
      skip: offset,
    }); 
  }

  async findOne(termino_busqueda: string) {

    let product: Product | null = null;

    if(isUUID(termino_busqueda)){
      product = await this.productRepository.findOneBy({id_moto:termino_busqueda});
    }else{
      //product = await this.productRepository.findOneBy({slug:termino_busqueda});
      const queryBuilder = this.productRepository.createQueryBuilder();
      // select * from products where slug ='fff' or titulo='ggg'
      product = await queryBuilder
      .where('UPPER(titulo_moto) =:titulo_moto or slug =:slug',{
        titulo_moto: termino_busqueda.toUpperCase(),
        slug: termino_busqueda.toLowerCase()
      }).getOne();
      
    }

    if(!product)
      throw new NotFoundException(`El producto con el ID ${termino_busqueda} no fue encontrado`);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    

    const product = await this.productRepository.preload({
      id_moto:id,
      ...updateProductDto
    });

    if(!product)throw new NotFoundException(`el producto con el id ${id} NO esxiste`);

    try {
      await this.productRepository.save(product)
      return product;
    } catch (error) {
      this.manejoDBExcepciones(error);
    }
    
  }

  async remove(id_moto: string) {
    const product = await this.findOne(id_moto);
    await this.productRepository.remove(product);
  }


  private manejoDBExcepciones(error:any){
    if(error.code==='23505')
      throw new BadRequestException(error.detail);

    this.logger.error(error)
    // console.log(error)
    throw new InternalServerErrorException('Error inesperado, verifica los registros del Servidor');
  }
}
