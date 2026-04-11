import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackService } from './pack.service';
import { PackController } from './pack.controller';
import { Pack } from './entities/pack.entity';
import { PackDetalle } from './entities/pack-detalle.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    controllers: [PackController],
    providers: [PackService],
    imports: [
        TypeOrmModule.forFeature([Pack, PackDetalle]),
        AuthModule,
    ],
    exports: [
        PackService,
        TypeOrmModule,
    ]
})
export class PackModule {}
