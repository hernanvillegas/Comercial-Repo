import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/paginacion.dto';

import {validate as isUUID} from 'uuid';
import { ProductImage, Product } from './entities';
@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository:Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository:Repository<ProductImage>,

    private readonly dataSource : DataSource,
  ){}

  async create(createProductDto: CreateProductDto) {
    try {
      const {images=[],...productDetails}=createProductDto;
      const product = this.productRepository.create({
        ...productDetails,
        images:images.map(image =>this.productImageRepository.create({url:image}))
    }); // solo crea la instancia del poroducto
      await this.productRepository.save(product); // lo guarda en la bd 
      return {...product,images};

    } catch (error) {
      this.manejoDBExcepciones(error);
    }
  }

  async findAll(paginationDto:PaginationDto) {

    const {limit = 10 , offset = 0} = paginationDto;
    const products= await this.productRepository.find({
      take: limit,
      skip: offset,

      //realciones
      relations:{
        images: true,
      }
    }); 
     return products.map(({images, ...rest})=>({
      ...rest,
      images:images?.map(img=>img.url)
    }))
  }

  async findOne(termino_busqueda: string) {

    let product : Product | null = null;

    if(isUUID(termino_busqueda)){
      product = await this.productRepository.findOneBy({id:termino_busqueda});
    }else{
      //product = await this.productRepository.findOneBy({slug:termino_busqueda});
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      // select * from products where slug ='fff' or titulo='ggg'
      product = await queryBuilder
      .where('UPPER(titulo_moto) =:titulo_moto or slug =:slug',{
        titulo_moto: termino_busqueda.toUpperCase(),
        slug: termino_busqueda.toLowerCase()
      })
      .leftJoinAndSelect('prod.images','prodImages')
      .getOne();
      
    }

    if(!product){
      throw new NotFoundException(`El producto con el ID ${termino_busqueda} no fue encontrado`);
  }
    return product;
  }


  //metodo para aplanar imagenes

  async findOnePlain(termino_busqueda:string){
    const {images=[], ...rest}= await this.findOne(termino_busqueda);
    return{
      ...rest,
      images:images.map(image => image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const {images, ...toUpdate} = updateProductDto; // actualiza sin las imagenes
    const product = await this.productRepository.preload({ id, ...toUpdate}); //una sola linea para actualizar imagenes

    if(!product)throw new NotFoundException(`el producto con el id ${id} NO esxiste`);

    // create query runner (no impacta la bd hasta que se ejecute el commit (o se apliquen los cambios))
    const queryRunner=this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    

    try {

      if(images){
        await queryRunner.manager.delete(ProductImage, {product: {id}}) //elimina todas los datos cuyo columna sea product en la tabla imagenes
        product.images=images.map(image=>this.productImageRepository.create({url:image})) //aun no impacta a la bd
      }else{
        //product.images = await this.productImageRepository.findBy({product:{id_moto:id}})
      }

      await queryRunner.manager.save(product);//aun no impacta la bd
      //await this.productRepository.save(product)

      await queryRunner.commitTransaction(); //ahora si impacta la bd
      await queryRunner.release(); //con esto ya no sirve el query runner
      // return product;

      return this.findOnePlain(id);
      //return product;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.manejoDBExcepciones(error);
    }
    
  }

  async remove(id_moto: string) {
    const product = await this.findOne(id_moto);
    await this.productRepository.remove(product);
  }


  private manejoDBExcepciones(error:any){
    if(error.code === '23505')
      throw new BadRequestException(error.detail);

    this.logger.error(error)
    // console.log(error)
    throw new InternalServerErrorException('Error inesperado, verifica los registros del Servidor');
  }


  // ejecutar solo cuando haya una emergencia--- elimina toda la BD
  async deleteAllProducts(){
  const query = this.productRepository.createQueryBuilder('product');

  try {

    return await query
    .delete()
    .where({})
    .execute();
    
  } catch (error) {

    this.manejoDBExcepciones(error);
    
  }

}

}
