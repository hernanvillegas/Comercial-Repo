import { Transform } from 'class-transformer';
import { IsDateString, IsEmail, IsNotEmpty, IsNumber, IsPositive, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';


export class CreateUserDto {


    @IsString()
    @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    nombre_user: string;

    @IsString()
    @MinLength(3, { message: 'El apellido debe tener al menos 3 caracteres' })
    apellido_user: string;

    @IsNumber()
    @Min(1000000, { message: 'El CI debe tener al menos 7 dígitos' })
    @Max(99999999, { message: 'El CI debe tener máximo 8 dígitos' })
    ci_user: number;

    @IsString()
    sucursal: string;

    @IsDateString()
    fecha_nacimiento: string;

    @IsNumber()
    @Min(10000000, { message: 'El celular debe tener exactamente 8 dígitos' })
    @Max(99999999, { message: 'El celular debe tener exactamente 8 dígitos' })
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


    //////////////////////////////////////////////////
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

    @IsString()
    @MinLength(1)
    fullName: string;

}