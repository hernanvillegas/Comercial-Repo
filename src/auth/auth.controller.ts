import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, ParseUUIDPipe,
    UseGuards, Req, Headers
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { IncomingHttpHeaders } from 'http';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth, GetUser, RawHeaders } from './decorators';
import { ValidRoles } from './interfaces';
import { User } from './entities/user.entity';

@ApiTags('Auth / Usuarios')
@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    // ── Rutas públicas ────────────────────────────────────────────────────

    @Post('register')
    // Sin @Auth — solo super-user debería usar esto en producción,
    // pero lo dejamos abierto para el primer usuario del sistema.
    createUser(@Body() createUserDto: CreateUserDto) {
        return this.authService.create(createUserDto);
    }

    @Post('login')
    loginUser(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }

    @Get('check-status')
    @Auth()
    checkAuthStatus(@GetUser() user: User) {
        return this.authService.checkAuthStatus(user);
    }

    // ── CRUD usuarios (solo super-user) ───────────────────────────────────

    @Get('usuarios')
    @Auth(ValidRoles.superUser)
    @ApiResponse({ status: 200, description: 'Lista de todos los usuarios' })
    @ApiResponse({ status: 403, description: 'Solo super-user puede ver usuarios' })
    findAll() {
        return this.authService.findAll();
    }

    @Get('usuarios/:id')
    @Auth(ValidRoles.superUser)
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.authService.findOne(id);
    }

    @Patch('usuarios/:id')
    @Auth(ValidRoles.superUser)
    @ApiResponse({ status: 200, description: 'Usuario actualizado' })
    @ApiResponse({ status: 403, description: 'Solo super-user puede modificar usuarios' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.authService.update(id, updateUserDto);
    }

    @Patch('usuarios/:id/rol')
    @Auth(ValidRoles.superUser)
    @ApiResponse({ status: 200, description: 'Rol cambiado' })
    cambiarRol(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('roles') roles: string[],
    ) {
        return this.authService.cambiarRol(id, roles);
    }

    @Patch('usuarios/:id/desactivar')
    @Auth(ValidRoles.superUser)
    @ApiResponse({ status: 200, description: 'Usuario desactivado (no se elimina de BD)' })
    desactivar(@Param('id', ParseUUIDPipe) id: string) {
        return this.authService.desactivar(id);
    }

    @Delete('usuarios/:id')
    @Auth(ValidRoles.superUser)
    @ApiResponse({ status: 200, description: 'Usuario eliminado permanentemente' })
    @ApiResponse({ status: 403, description: 'Solo super-user puede eliminar usuarios' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.authService.remove(id);
    }
}
