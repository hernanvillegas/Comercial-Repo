import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarritoService } from './carrito.service';
import { CarritoController } from './carrito.controller';
import { Carrito } from './entities/carrito.entity';
import { CarritoDetalle } from './entities/carrito-detalle.entity';
import { Producto } from 'src/producto/entities/producto.entity';
import { DetalleVenta } from 'src/detalle-venta/entities/detalle-venta.entity';
import { MovimientoInventario } from 'src/movimiento-inventario/entities/movimiento-inventario.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    controllers: [CarritoController],
    providers: [CarritoService],
    imports: [
        TypeOrmModule.forFeature([
            Carrito,
            CarritoDetalle,
            Producto,
            DetalleVenta,
            MovimientoInventario,
        ]),
        AuthModule,
    ],
    exports: [
        CarritoService,
        TypeOrmModule,
    ]
})
export class CarritoModule {}
