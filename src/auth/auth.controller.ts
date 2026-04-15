import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { IncomingHttpHeaders } from 'http';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth, GetUser, RawHeaders } from './decorators';
import { ValidRoles } from './interfaces';
import { User } from './entities/user.entity';
import { Throttle } from '@nestjs/throttler';


@ApiTags('Auth / Usuarios')
@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    // ── Rutas públicas ────────────────────────────────────────────────────


    // Sin @Auth — solo super-user debería usar esto en producción,
    // pero lo dejamos abierto para el primer usuario del sistema.
    
    // Registro público — sin guard, siempre crea con rol 'user'
    @Post('register')
    createUser(@Body() createUserDto: CreateUserDto) {
        return this.authService.create({ ...createUserDto, roles: ['user'] });
    }

    // Registro desde admin — requiere super-admin, acepta cualquier rol
    @Post('register/admin')
    @Auth(ValidRoles.superAdmin)
    createUserAdmin(@Body() createUserDto: CreateUserDto) {
        return this.authService.create(createUserDto);
    }

    @Throttle({ default: { ttl: 60000, limit: 5 } })
    @Post('login')
    loginUser(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }

    @Get('check-status')
    @Auth()
    checkAuthStatus(@GetUser() user: User) {
        return this.authService.checkAuthStatus(user);
    }

    @Post('refresh')
    @Auth()
    refreshToken(@GetUser() user: User) {
        return this.authService.refreshToken(user);
    }

    // ── CRUD usuarios (solo super-user) ───────────────────────────────────

    @Get('usuarios')
    @Auth(ValidRoles.superAdmin)
    @ApiResponse({ status: 200, description: 'Lista de todos los usuarios' })
    @ApiResponse({ status: 403, description: 'Solo super-user puede ver usuarios' })
    findAll() {
        return this.authService.findAll();
    }

    @Get('usuarios/:id')
    @Auth(ValidRoles.superAdmin)
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.authService.findOne(id);
    }

    @Patch('usuarios/:id')
    @Auth(ValidRoles.superAdmin)
    @ApiResponse({ status: 200, description: 'Usuario actualizado' })
    @ApiResponse({ status: 403, description: 'Solo super-user puede modificar usuarios' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.authService.update(id, updateUserDto);
    }

    @Patch('usuarios/:id/rol')
    @Auth(ValidRoles.superAdmin)
    @ApiResponse({ status: 200, description: 'Rol cambiado' })
    cambiarRol(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('roles') roles: string[],
    ) {
        return this.authService.cambiarRol(id, roles);
    }

    @Patch('usuarios/:id/desactivar')
    @Auth(ValidRoles.superAdmin)
    @ApiResponse({ status: 200, description: 'Usuario desactivado (no se elimina de BD)' })
    desactivar(@Param('id', ParseUUIDPipe) id: string) {
        return this.authService.desactivar(id);
    }

    @Delete('usuarios/:id')
    @Auth(ValidRoles.superAdmin)
    @ApiResponse({ status: 200, description: 'Usuario eliminado permanentemente' })
    @ApiResponse({ status: 403, description: 'Solo super-user puede eliminar usuarios' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.authService.remove(id);
    }
}
