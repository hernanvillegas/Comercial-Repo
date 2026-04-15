import { Transform } from 'class-transformer';
import { IsArray, IsDateString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateUserDto {

    @IsString()
    @MinLength(3)
    nombre_user: string;

    @IsString()
    @MinLength(3)
    apellido_user: string;

    @IsNumber()
    @Min(1000000)
    @Max(99999999)
    ci_user: number;

    @IsString()
    sucursal: string;

    @IsDateString()
    fecha_nacimiento: string;

    @IsNumber()
    @Min(10000000)
    @Max(99999999)
    celular: number;

    @IsString()
    direccion: string;

    @IsDateString()
    fecha_ingreso: string;

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    ingreso_mensual: number;

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'La contraseña debe tener una letra mayúscula, una letra minúscula y un número.'
    })
    password: string;


    // ── Roles opcionales ──────────────────────────────────────────────────
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    roles?: string[];
}