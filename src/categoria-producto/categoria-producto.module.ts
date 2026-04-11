import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaProductoService } from './categoria-producto.service';
import { CategoriaProductoController } from './categoria-producto.controller';
import { CategoriaProducto } from './entities/categoria-producto.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    controllers: [CategoriaProductoController],
    providers: [CategoriaProductoService],
    imports: [
        TypeOrmModule.forFeature([CategoriaProducto]),
        AuthModule,
    ],
    exports: [
        CategoriaProductoService,
        TypeOrmModule,
    ]
})
export class CategoriaProductoModule {}
