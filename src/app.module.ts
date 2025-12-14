import { join } from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AppController } from './app.controller';
import { AppService } from './app.service';



import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { MarcaModule } from './marca/marca.module';
import { ModeloModule } from './modelo/modelo.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { HistorialClienteModule } from './historial_cliente/historial_cliente.module';
import { GaranteModule } from './garante/garante.module';
import { ClienteModule } from './cliente/cliente.module';

@Module({
  imports: [

    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      //port: +process.env.DB_PORT,
      port: 5432,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,      
      autoLoadEntities: true, 
      synchronize: true, // en produccion es mejor dejarlo en false
    }),

    // ServeStaticModule.forRoot({     para directorios publicos
    //   rootPath: join(__dirname,'..','public')
    // }),

    ProductsModule,

    CommonModule,

    SeedModule,

    FilesModule,

    AuthModule,

    MarcaModule,

    ModeloModule,

    ProveedorModule,

    HistorialClienteModule,

    GaranteModule,

    ClienteModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
