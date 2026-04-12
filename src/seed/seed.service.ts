import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {

    private readonly logger = new Logger('SeedService');

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async onApplicationBootstrap() {
        await this.seedAdminUser();
    }

    private async seedAdminUser() {
        const adminEmail = 'admin@haojin.com';

        const existe = await this.userRepository.findOne({
            where: { email: adminEmail }
        });

        if (existe) return; // ya existe, no hacer nada

        const admin = this.userRepository.create({
            nombre_user:      'Admin',
            apellido_user:    'Sistema',
            email:            adminEmail,
            fullName:         'Administrador',
            password:         bcrypt.hashSync('Admin1234', 10),
            roles:            ['admin', 'user','super-user'],
            isActive:         true,
            fecha_nacimiento: new Date('1990-01-01'),
            sucursal:         'Principal',
        });

        await this.userRepository.save(admin);
        this.logger.log(`✅ Usuario admin creado: ${adminEmail} / Admin1234!`);
    }
}