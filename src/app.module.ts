import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService }    from './app.service';

// ── Módulos existentes ────────────────────────────────────────────────────
import { ProductsModule }         from './products/products.module';
import { CommonModule }           from './common/common.module';
import { SeedModule }             from './seed/seed.module';
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

// ── Módulos nuevos ────────────────────────────────────────────────────────
import { CategoriaProductoModule }    from './categoria-producto/categoria-producto.module';
import { ProductoModule }             from './producto/producto.module';
import { DetalleMotoModule }          from './detalle-moto/detalle-moto.module';
import { PackModule }                 from './pack/pack.module';
import { DetalleVentaModule }         from './detalle-venta/detalle-venta.module';
import { PagosModule }                from './pagos/pagos.module';
import { MovimientoInventarioModule } from './movimiento-inventario/movimiento-inventario.module';
import { CarritoModule }              from './carrito/carrito.module';
import { ReportesModule }             from './reportes/reportes.module';

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
      synchronize:      true,
    }),
    ScheduleModule.forRoot(),
    // Existentes
    ProductsModule, CommonModule, SeedModule, FilesModule, AuthModule,
    MarcaModule, ModeloModule, ProveedorModule, HistorialClienteModule,
    GaranteModule, ClienteModule, VentasModule, CuotaCreditoModule,
    MovimientoCajaModule,
    // Nuevos
    CategoriaProductoModule, ProductoModule, DetalleMotoModule,
    PackModule, DetalleVentaModule, PagosModule,
    MovimientoInventarioModule, CarritoModule, ReportesModule,
  ],
  controllers: [AppController],
  providers:   [AppService],
})
export class AppModule {}
