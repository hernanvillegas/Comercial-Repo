import { IsBoolean, IsDateString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPositive, isPositive, IsString, Max, Min, MinLength } from "class-validator";
import { Transform } from 'class-transformer';


export class CreateClienteDto {

    @IsString()
    @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    nombre_cliente: string;

    @IsString()
    @MinLength(3, { message: 'El apellido debe tener al menos 3 caracteres' })
    apellido_cliente: string;

    @IsNumber()
    @Min(1000000, { message: 'El CI debe tener al menos 7 dígitos' })
    @Max(99999999, { message: 'El CI debe tener máximo 8 dígitos' })
    ci_cliente: number;

    @IsDateString()
    fecha_nacimiento: string;

    @IsNumber()
    @Min(10000000, { message: 'El celular debe tener exactamente 8 dígitos' })
    @Max(99999999, { message: 'El celular debe tener exactamente 8 dígitos' })
    celular: number;

    @IsEmail({}, { message: 'Debe proporcionar un email válido' })
    email: string;

    @IsString()
    ciudad: string;

    @IsString()
    provincia: string;

    @IsString()
    direccion: string;

    @IsString()
    ocupacion: string;

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    ingreso_mensual: number;

    @IsOptional()
    @IsBoolean()
    verificado?: boolean;

    @IsDateString()
    @IsOptional()
    fecha_registro: Date;
}
