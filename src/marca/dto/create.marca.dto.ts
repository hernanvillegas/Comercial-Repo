import { IsBoolean, IsDate, IsOptional, IsString, MinLength } from "class-validator";


export class CreateMarcaDto {

    @IsString()
    @MinLength(1)
    nombre_marca:string;
    
    @IsString()
    @MinLength(1)
    pais_origen:string; 
    
    @IsBoolean()
    @IsOptional()
    activo?: boolean;
    
    @IsDate()
    @IsOptional()
    fecha_registro?:Date;
}

