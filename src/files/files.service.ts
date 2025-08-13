import { join } from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';


@Injectable()
export class FilesService {

    getStaticProductImage(imageName:string){

        const path = join(__dirname, '../../static/product-image',imageName);

        if(!existsSync(path))
            throw new BadRequestException(`No se encontro ningun producto con imagen ${imageName}`);

        return path;
    }
  
}
