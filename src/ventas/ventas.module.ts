import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VentasService }    from './ventas.service';
import { VentasController } from './ventas.controller';
import { Venta }            from './entities/venta.entity';
import { Producto }         from 'src/producto/entities/producto.entity';
import { DetalleMoto }      from 'src/detalle-moto/entities/detalle-moto.entity';
import { HistorialCliente } from 'src/historial_cliente/entities/historial_cliente.entity';
import { MovimientoCaja }   from 'src/movimiento-caja/entities/movimiento-caja.entity';
import { CuotaCredito }     from 'src/cuota-credito/entities/cuota-credito.entity'; // NUEVO
import { AuthModule }       from 'src/auth/auth.module';

@Module({
    controllers: [VentasController],
    providers:   [VentasService],
    imports: [
        AuthModule,
        TypeOrmModule.forFeature([
            Venta,
            Producto,
            DetalleMoto,
            HistorialCliente,
            MovimientoCaja,
            CuotaCredito,   // NUEVO: para cancelar cuotas al anular
        ]),
    ],
    exports: [VentasService],
})
export class VentasModule {}