import { Controller, Get, } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

 @Get()
//  @Auth(ValidRoles.admin) // ESTO ES PARA DAR PERMISOS para que solo un admin entre a este sitio
 executeSeed(){
   return this.seedService.runSeed()
 }
}


