import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VentasService }    from './ventas.service';
import { VentasController } from './ventas.controller';
import { Venta }            from './entities/venta.entity';

// NUEVO: entidades necesarias para validación de stock e historial
import { Producto }         from 'src/producto/entities/producto.entity';
import { DetalleMoto }      from 'src/detalle-moto/entities/detalle-moto.entity';
import { HistorialCliente } from 'src/historial_cliente/entities/historial_cliente.entity';
import { AuthModule } from 'src/auth/auth.module';

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
        ]),
    ],
    exports: [VentasService],
})
export class VentasModule {}
