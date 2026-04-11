import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SeedService }    from './seed.service';
import { SeedController } from './seed.controller';

import { AuthModule }           from 'src/auth/auth.module';
import { User }                 from 'src/auth/entities/user.entity';
import { Marca }                from 'src/marca/entities/marca.entity';
import { Modelo }               from 'src/modelo/entities/modelo.entity';
import { Proveedor }            from 'src/proveedor/entities/proveedor.entity';
import { CategoriaProducto }    from 'src/categoria-producto/entities/categoria-producto.entity';
import { Producto }             from 'src/producto/entities/producto.entity';
import { ProductImage }         from 'src/products/entities/product-image.entity';
import { ProductoImage }        from 'src/producto/entities/producto-image.entity';
import { DetalleMoto }          from 'src/detalle-moto/entities/detalle-moto.entity';
import { Cliente }              from 'src/cliente/entities/cliente.entity';
import { Garante }              from 'src/garante/entities/garante.entity';
import { Pack }                 from 'src/pack/entities/pack.entity';
import { PackDetalle }          from 'src/pack/entities/pack-detalle.entity';

@Module({
    controllers: [SeedController],
    providers:   [SeedService],
    imports: [
        TypeOrmModule.forFeature([
            User,
            Marca,
            Modelo,
            Proveedor,
            CategoriaProducto,
            Producto,
            ProductImage,
            ProductoImage,
            DetalleMoto,
            Cliente,
            Garante,
            Pack,
            PackDetalle,
        ]),
        AuthModule,
    ],
})
export class SeedModule {}
