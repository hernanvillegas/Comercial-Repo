import { Module }        from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule }    from 'src/auth/auth.module';

import { HistorialClienteService }    from './historial_cliente.service';
import { HistorialClienteController } from './historial_cliente.controller';
import { HistorialCliente }           from './entities/historial_cliente.entity';
import { Cliente }                    from '../cliente/entities/cliente.entity';
import { Venta }                      from '../ventas/entities/venta.entity';
import { CuotaCredito }               from '../cuota-credito/entities/cuota-credito.entity';

@Module({
  controllers: [HistorialClienteController],
  providers:   [HistorialClienteService],
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([HistorialCliente, Cliente, Venta, CuotaCredito]),
  ],
  exports: [HistorialClienteService],
})
export class HistorialClienteModule {}