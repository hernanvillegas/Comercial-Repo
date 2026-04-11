import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportesService }    from './reportes.service';
import { ReportesController } from './reportes.controller';

import { Venta }          from 'src/ventas/entities/venta.entity';
import { DetalleVenta }   from 'src/detalle-venta/entities/detalle-venta.entity';
import { Producto }       from 'src/producto/entities/producto.entity';
import { CuotaCredito }   from 'src/cuota-credito/entities/cuota-credito.entity';
import { MovimientoCaja } from 'src/movimiento-caja/entities/movimiento-caja.entity';
import { Cliente }        from 'src/cliente/entities/cliente.entity';
import { AuthModule }     from 'src/auth/auth.module';

@Module({
    controllers: [ReportesController],
    providers:   [ReportesService],
    imports: [
        TypeOrmModule.forFeature([
            Venta,
            DetalleVenta,
            Producto,
            CuotaCredito,
            MovimientoCaja,
            Cliente,
        ]),
        AuthModule,
    ],
})
export class ReportesModule {}
