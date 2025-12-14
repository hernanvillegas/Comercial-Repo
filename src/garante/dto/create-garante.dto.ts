import { IsBoolean, IsDate, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Max, MaxLength, Min, MinLength } from "class-validator";


export class CreateGaranteDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    nombre_garante: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    apellido_garante: string;

    @IsInt()
    @IsNotEmpty()
    ci_garante: number;

    @IsDate()
    @IsOptional()
    fecha_nacimiento: Date;

    @IsString()
    @IsNotEmpty()
    relacion: string;

    @IsInt()
    @IsNotEmpty()
    @IsPositive()
    @Min(60000000, { message: 'El celular debe ser válido (8 dígitos)' })
    @Max(79999999, { message: 'El celular debe ser válido (8 dígitos)' })
    celular: number;

    @IsString()
    @IsNotEmpty()
    direccion: string;

    @IsBoolean()
    @IsOptional()
    verificado?: boolean;

    @IsDate()
    @IsOptional()
    fecha_registro: Date;
}
