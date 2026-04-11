import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleMotoService } from './detalle-moto.service';
import { DetalleMotoController } from './detalle-moto.controller';
import { DetalleMoto } from './entities/detalle-moto.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    controllers: [DetalleMotoController],
    providers: [DetalleMotoService],
    imports: [
        TypeOrmModule.forFeature([DetalleMoto]),
        AuthModule,
    ],
    exports: [
        DetalleMotoService,
        TypeOrmModule,
    ]
})
export class DetalleMotoModule {}
