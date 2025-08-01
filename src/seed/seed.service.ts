import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService
  ) {}
  
  async runSeed() {

    await this.insertNewProducts();

    return 'SEED EXECUTED';
  }

  private async insertNewProducts() {
    await this.productsService.deleteAllProducts();  

    const seedProducts = initialData.products;

    //const insertPromises = [];
    const insertPromises: Promise<any>[] = [];

    seedProducts.forEach( product => {
       const ayuda =  this.productsService.create(product)
      insertPromises.push( ayuda);
      console.log(ayuda);
    });

    

    const result = await Promise.all( insertPromises );

    return result;
  }
}
