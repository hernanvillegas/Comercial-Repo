import {
    BadRequestException, Injectable,
    InternalServerErrorException, NotFoundException,
    UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly jwtService: JwtService,
    ) {}

    // ── Registro (igual que antes) ────────────────────────────────────────
    async create(createUserDto: CreateUserDto) {
        try {
            const { password, ...userData } = createUserDto;

            const user = this.userRepository.create({
                ...userData,
                password: bcrypt.hashSync(password, 10),
            });

            await this.userRepository.save(user);
            delete (user as Partial<Pick<User, 'password'>>).password;

            return {
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    roles: user.roles,
                },
                token: this.getJwtToken({ id: user.id })
            };

        } catch (error) {
            this.ManejoExepciones(error);
        }
    }

    // ── Login (igual que antes) ───────────────────────────────────────────
    async login(loginUserDto: LoginUserDto) {
        const { password, email } = loginUserDto;

        const user = await this.userRepository.findOne({
            where: { email },
            select: { email: true, password: true, id: true, fullName: true, roles: true }
        });

        if (!user)
            throw new UnauthorizedException('Las credenciales no son válidas (email)');

        if (!bcrypt.compareSync(password, user.password))
            throw new UnauthorizedException('Las credenciales no son válidas (password)');

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                roles: user.roles,
            },
            token: this.getJwtToken({ id: user.id })
        };
    }

    // ── Check status (igual que antes) ────────────────────────────────────
    async checkAuthStatus(user: User) {
        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                roles: user.roles,
            },
            token: this.getJwtToken({ id: user.id })
        };
    }

    // ── NUEVO: listar todos los usuarios (solo super-user) ────────────────
    async findAll() {
    return await this.userRepository.find({
        select: {
            id: true, 
            nombre_user: true, 
            apellido_user: true,
            ci_user: true, 
            sucursal: true, 
            email: true,
            fullName: true, 
            roles: true, 
            isActive: true,
            celular: true, 
            fecha_ingreso: true, 
            fecha_nacimiento: true, // <--- AGREGADO
            direccion: true,        // <--- AGREGADO
            ingreso_mensual: true,  // <--- AGREGADO
            createdAt: true,
        },
        order: { createdAt: 'DESC' }
    });
}

    // ── NUEVO: ver un usuario por id ──────────────────────────────────────
    async findOne(id: string) {
    const user = await this.userRepository.findOne({
        where: { id },
        select: {
            id: true, 
            nombre_user: true, 
            apellido_user: true,
            ci_user: true, 
            sucursal: true, 
            email: true,
            fullName: true, 
            roles: true, 
            isActive: true,
            celular: true, 
            fecha_ingreso: true,
            fecha_nacimiento: true, // <--- AGREGADO
            direccion: true,        // <--- AGREGADO
            ingreso_mensual: true,  // <--- AGREGADO
            createdAt: true,
        }
    });

    if (!user)
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);

    return user;
}

    // ── NUEVO: actualizar usuario (solo super-user) ───────────────────────
    async update(id: string, updateUserDto: UpdateUserDto) {
    // 1. Buscamos si existe para evitar errores de base de datos
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);

    try {
        // 2. Limpieza de password para evitar errores de Bcrypt (Error 500)
        if (updateUserDto.password && updateUserDto.password.trim().length > 0) {
            updateUserDto.password = bcrypt.hashSync(updateUserDto.password, 10);
        } else {
            delete updateUserDto.password;
        }

        // 3. Preparamos la actualización parcial
        const userPreloaded = await this.userRepository.preload({
            id: id,
            ...updateUserDto
        });

        // 4. Validación para TypeScript (Soluciona el error de Overload)
        if ( !userPreloaded ) {
            throw new NotFoundException(`No se pudo preparar la actualización para el ID ${id}`);
        }

        // 5. Guardamos la entidad validada
        const userActualizado = await this.userRepository.save(userPreloaded);

        // 6. Quitamos el password de la respuesta por seguridad
        delete (userActualizado as any).password;
        
        return userActualizado;

    } catch (error) {
        this.ManejoExepciones(error);
    }
}

    // ── NUEVO: desactivar usuario (soft delete — no lo borra de BD) ───────
    async desactivar(id: string) {
        const user = await this.userRepository.findOneBy({ id });

        if (!user)
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);

        user.isActive = false;
        await this.userRepository.save(user);

        return { message: `Usuario ${user.fullName} desactivado correctamente` };
    }

    // ── NUEVO: eliminar usuario permanentemente (solo super-user) ─────────
    async remove(id: string) {
        const user = await this.userRepository.findOneBy({ id });

        if (!user)
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);

        await this.userRepository.remove(user);
        return { message: `Usuario eliminado correctamente` };
    }

    // ── NUEVO: cambiar rol de un usuario (solo super-user) ────────────────
    async cambiarRol(id: string, roles: string[]) {
        const user = await this.userRepository.findOneBy({ id });

        if (!user)
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);

        user.roles = roles;
        await this.userRepository.save(user);

        return { message: `Roles actualizados`, roles: user.roles };
    }

    // ─────────────────────────────────────────────────────────────────────
    private getJwtToken(payload: JwtPayload) {
        return this.jwtService.sign(payload);
    }

    private ManejoExepciones(error: any): never {
        if (error.code === '23505')
            throw new BadRequestException(error.detail);
        console.log(error);
        throw new InternalServerErrorException('Por favor, revisa los registros del servidor');
    }
}
