import { Transform } from 'class-transformer';
import {
    IsArray, IsBoolean, IsDateString, IsEmail,
    IsIn, IsNumber, IsOptional, IsPositive,
    IsString, Max, MaxLength, Min, MinLength,
    Matches
} from 'class-validator';

export class UpdateUserDto {

    @IsString()
    @MinLength(3)
    @IsOptional()
    nombre_user?: string;

    @IsString()
    @MinLength(3)
    @IsOptional()
    apellido_user?: string;

    @IsNumber()
    @Min(1000000)
    @Max(99999999)
    @IsOptional()
    ci_user?: number;

    @IsString()
    @IsOptional()
    sucursal?: string;

    @IsDateString()
    @IsOptional()
    fecha_nacimiento?: string;

    @IsNumber()
    @Min(10000000)
    @Max(99999999)
    @IsOptional()
    celular?: number;

    @IsString()
    @IsOptional()
    direccion?: string;

    @IsDateString()
    @IsOptional()
    fecha_ingreso?: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    @Transform(({ value }) => parseFloat(value))
    ingreso_mensual?: number;

    @IsString()
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @IsOptional()
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'La contraseña debe tener una letra mayúscula, una letra minúscula y un número.'
    })
    password?: string;

    @IsString()
    @MinLength(1)
    @IsOptional()
    fullName?: string;

    // Solo super-user puede cambiar roles
    @IsArray()
    @IsIn(['super-user', 'admin', 'user'], { each: true })
    @IsOptional()
    roles?: string[];

    // Solo super-user puede activar/desactivar
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
