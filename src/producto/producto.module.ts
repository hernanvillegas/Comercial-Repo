import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductoService }    from './producto.service';
import { ProductoController } from './producto.controller';
import { Producto }           from './entities/producto.entity';
import { ProductoImage }      from './entities/producto-image.entity';
import { Proveedor }          from 'src/proveedor/entities/proveedor.entity';
import { AuthModule }         from 'src/auth/auth.module';

@Module({
    controllers: [ProductoController],
    providers:   [ProductoService],
    imports: [
        TypeOrmModule.forFeature([Producto, ProductoImage, Proveedor]),
        AuthModule,
    ],
    exports: [
        ProductoService,
        TypeOrmModule,
    ]
})
export class ProductoModule {}
