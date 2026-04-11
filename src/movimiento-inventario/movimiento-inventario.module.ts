import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientoInventarioService } from './movimiento-inventario.service';
import { MovimientoInventarioController } from './movimiento-inventario.controller';
import { MovimientoInventario } from './entities/movimiento-inventario.entity';
import { Producto } from 'src/producto/entities/producto.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    controllers: [MovimientoInventarioController],
    providers: [MovimientoInventarioService],
    imports: [
        TypeOrmModule.forFeature([MovimientoInventario, Producto]),
        AuthModule,
    ],
    exports: [
        MovimientoInventarioService,
        TypeOrmModule,
    ]
})
export class MovimientoInventarioModule {}
