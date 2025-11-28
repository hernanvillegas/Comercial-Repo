import { IsBoolean, IsDate, IsInt, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateProveedorDto {
        
    @IsString()
    @MinLength(1)
    cod_proveedor:string;

    @IsString()
    @MinLength(1)
    nombre_proveedor:string;

    @IsString()
    @MinLength(1)
    tipo_proveedor:string;

    @IsString()
    @MinLength(1)
    cel_proveedor:string;

    @IsString()
    @MinLength(1)
    email_proveedor:string;

    @IsString()
    @MinLength(1)
    direccion_proveedor:string;

    @IsString()
    @MinLength(1)
    razon_social:string;
        
    @IsBoolean()
    @IsOptional()
    activo?: boolean;
        
    @IsDate()
    @IsOptional()
    fecha_registro_prov:Date;

    
}
