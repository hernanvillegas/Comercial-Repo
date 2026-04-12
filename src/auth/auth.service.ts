import {
    BadRequestException, Injectable,
    InternalServerErrorException, Logger, NotFoundException,
    UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User }          from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto }  from './dto';
import { JwtPayload }    from './interfaces/jwt-payload.interface';
import { JwtService }    from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

    private readonly logger = new Logger('AuthService');

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

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
                    id:       user.id,
                    email:    user.email,
                    fullName: user.fullName,
                    roles:    user.roles,
                },
                token:        this.getJwtToken({ id: user.id }),
                refreshToken: this.getRefreshToken({ id: user.id }),
            };

        } catch (error) {
            this.ManejoExepciones(error);
        }
    }

    async login(loginUserDto: LoginUserDto) {
        const { password, email } = loginUserDto;

        const user = await this.userRepository.findOne({
            where:  { email },
            select: { email: true, password: true, id: true, fullName: true, roles: true }
        });

        if (!user)
            throw new UnauthorizedException('Las credenciales no son válidas (email)');

        if (!bcrypt.compareSync(password, user.password))
            throw new UnauthorizedException('Las credenciales no son válidas (password)');

        return {
            user: {
                id:       user.id,
                email:    user.email,
                fullName: user.fullName,
                roles:    user.roles,
            },
            token:        this.getJwtToken({ id: user.id }),
            refreshToken: this.getRefreshToken({ id: user.id }),
        };
    }

    async checkAuthStatus(user: User) {
        return {
            user: {
                id:       user.id,
                email:    user.email,
                fullName: user.fullName,
                roles:    user.roles,
            },
            token:        this.getJwtToken({ id: user.id }),
            refreshToken: this.getRefreshToken({ id: user.id }),
        };
    }

    async refreshToken(user: User) {
        return {
            token:        this.getJwtToken({ id: user.id }),
            refreshToken: this.getRefreshToken({ id: user.id }),
        };
    }

    async findAll() {
        return await this.userRepository.find({
            select: {
                id:              true,
                nombre_user:     true,
                apellido_user:   true,
                ci_user:         true,
                sucursal:        true,
                email:           true,
                fullName:        true,
                roles:           true,
                isActive:        true,
                celular:         true,
                fecha_ingreso:   true,
                fecha_nacimiento: true,
                direccion:       true,
                ingreso_mensual: true,
                createdAt:       true,
            },
            order: { createdAt: 'DESC' }
        });
    }

    async findOne(id: string) {
        const user = await this.userRepository.findOne({
            where:  { id },
            select: {
                id:              true,
                nombre_user:     true,
                apellido_user:   true,
                ci_user:         true,
                sucursal:        true,
                email:           true,
                fullName:        true,
                roles:           true,
                isActive:        true,
                celular:         true,
                fecha_ingreso:   true,
                fecha_nacimiento: true,
                direccion:       true,
                ingreso_mensual: true,
                createdAt:       true,
            }
        });

        if (!user)
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);

        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        const user = await this.userRepository.findOneBy({ id });
        if (!user)
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);

        try {
            if (updateUserDto.password && updateUserDto.password.trim().length > 0) {
                updateUserDto.password = bcrypt.hashSync(updateUserDto.password, 10);
            } else {
                delete updateUserDto.password;
            }

            const userPreloaded = await this.userRepository.preload({ id, ...updateUserDto });

            if (!userPreloaded)
                throw new NotFoundException(`No se pudo preparar la actualización para el ID ${id}`);

            const userActualizado = await this.userRepository.save(userPreloaded);
            delete (userActualizado as any).password;

            return userActualizado;

        } catch (error) {
            this.ManejoExepciones(error);
        }
    }

    async desactivar(id: string) {
        const user = await this.userRepository.findOneBy({ id });

        if (!user)
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);

        user.isActive = false;
        await this.userRepository.save(user);

        return { message: `Usuario ${user.fullName} desactivado correctamente` };
    }

    async remove(id: string) {
        const user = await this.userRepository.findOneBy({ id });

        if (!user)
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);

        await this.userRepository.remove(user);
        return { message: `Usuario eliminado correctamente` };
    }

    async cambiarRol(id: string, roles: string[]) {
        const user = await this.userRepository.findOneBy({ id });

        if (!user)
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);

        user.roles = roles;
        await this.userRepository.save(user);

        return { message: `Roles actualizados`, roles: user.roles };
    }

    private getJwtToken(payload: JwtPayload): string {
        return this.jwtService.sign(payload);
    }

    private getRefreshToken(payload: JwtPayload): string {
        return this.jwtService.sign(payload, {
            secret:    this.configService.getOrThrow('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
        });
    }

    private ManejoExepciones(error: any): never {
        if (error.code === '23505')
            throw new BadRequestException(error.detail);
        this.logger.error(error);
        throw new InternalServerErrorException('Por favor, revisa los registros del servidor');
    }
}