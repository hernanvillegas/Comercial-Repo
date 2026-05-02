import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DetalleVentaService }    from './detalle-venta.service';
import { DetalleVentaController } from './detalle-venta.controller';
import { DetalleVenta }           from './entities/detalle-venta.entity';
import { Producto }               from 'src/producto/entities/producto.entity'; // NUEVO
import { AuthModule }             from 'src/auth/auth.module';

@Module({
    controllers: [DetalleVentaController],
    providers:   [DetalleVentaService],
    imports: [
        TypeOrmModule.forFeature([
            DetalleVenta,
            Producto,   // NUEVO: para descontar stock de accesorios/repuestos
        ]),
        AuthModule,
    ],
    exports: [
        DetalleVentaService,
        TypeOrmModule,
    ],
})
export class DetalleVentaModule {}