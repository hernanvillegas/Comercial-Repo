import { IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCategoriaProductoDto {

    @IsString()
    @MinLength(1)
    nombre_categoria: string;

    @IsIn(['moto', 'accesorio', 'repuesto', 'servicio', 'otro'])
    tipo: string;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @IsBoolean()
    @IsOptional()
    activo?: boolean;
}
