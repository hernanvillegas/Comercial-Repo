import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleVentaService } from './detalle-venta.service';
import { DetalleVentaController } from './detalle-venta.controller';
import { DetalleVenta } from './entities/detalle-venta.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    controllers: [DetalleVentaController],
    providers: [DetalleVentaService],
    imports: [
        TypeOrmModule.forFeature([DetalleVenta]),
        AuthModule,
    ],
    exports: [
        DetalleVentaService,
        TypeOrmModule,
    ]
})
export class DetalleVentaModule {}
