import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService }    from './app.service';

import { CommonModule }           from './common/common.module';
import { FilesModule }            from './files/files.module';
import { AuthModule }             from './auth/auth.module';
import { MarcaModule }            from './marca/marca.module';
import { ModeloModule }           from './modelo/modelo.module';
import { ProveedorModule }        from './proveedor/proveedor.module';
import { HistorialClienteModule } from './historial_cliente/historial_cliente.module';
import { GaranteModule }          from './garante/garante.module';
import { ClienteModule }          from './cliente/cliente.module';
import { VentasModule }           from './ventas/ventas.module';
import { CuotaCreditoModule }     from './cuota-credito/cuota-credito.module';
import { MovimientoCajaModule }   from './movimiento-caja/movimiento-caja.module';

import { CategoriaProductoModule }    from './categoria-producto/categoria-producto.module';
import { ProductoModule }             from './producto/producto.module';
import { DetalleMotoModule }          from './detalle-moto/detalle-moto.module';
import { PackModule }                 from './pack/pack.module';
import { DetalleVentaModule }         from './detalle-venta/detalle-venta.module';
import { PagosModule }                from './pagos/pagos.module';
import { MovimientoInventarioModule } from './movimiento-inventario/movimiento-inventario.module';
import { CarritoModule }              from './carrito/carrito.module';
import { ReportesModule }             from './reportes/reportes.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type:             'postgres',
      host:             process.env.DB_HOST,
      port:             +(process.env.DB_PORT ?? '5432'),
      database:         process.env.DB_NAME,
      username:         process.env.DB_USERNAME,
      password:         process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize:      process.env.NODE_ENV !== 'production',
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl:   60000,
      limit: 10,
    }]),
    CommonModule, FilesModule, AuthModule,
    MarcaModule, ModeloModule, ProveedorModule, HistorialClienteModule,
    GaranteModule, ClienteModule, VentasModule, CuotaCreditoModule,
    MovimientoCajaModule,
    CategoriaProductoModule, ProductoModule, DetalleMotoModule,
    PackModule, DetalleVentaModule, PagosModule,
    MovimientoInventarioModule, CarritoModule, ReportesModule,SeedModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide:  APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}