import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { Pago } from './entities/pago.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    controllers: [PagosController],
    providers: [PagosService],
    imports: [
        TypeOrmModule.forFeature([Pago]),
        AuthModule,
    ],
    exports: [
        PagosService,
        TypeOrmModule,
    ]
})
export class PagosModule {}
