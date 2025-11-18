import { IsArray, IsDate, IsInt, IsOptional, IsPositive, IsString, MinLength } from "class-validator";



export class CreateModeloDto {

    @IsInt()
    @IsPositive()
    numero_modelo:number;//nombre de campo
    
    @IsString()
    @MinLength(1)
    nombre_modelo:string;//nombre de campo
    
    @IsString()
    @IsOptional()
    cilindrada?:string;//nombre de campo
    
    @IsDate()
    @IsOptional()
    anio_modelo?:Date;//nombre de campo
    
    @IsString()
    @IsOptional()
    tipo_combustible?:string;//nombre de campo
    
    @IsString()
    @IsOptional()
    capacidad_carga?: string;//nombre de campo
    
    @IsInt()
    @IsPositive()
    @IsOptional()
    numero_puertas?:number;//nombre de campo
    
    @IsInt()
    @IsPositive()
    @IsOptional()
    numero_plazas?:number;//nombre de campo
    
    @IsInt()
    @IsPositive()
    @IsOptional()
    numero_ruedas?:number;//nombre de campo

    @IsString()
    @IsOptional()
    regimen:string;//nombre de campo
    
    @IsString()
    @IsOptional()
    sub_tipo?:string;//nombre de campo
    
    @IsString()
    @IsOptional()
    transmision?: string;//nombre de campo
    
    @IsString()
    @IsOptional()
    numero_factura?: string; // esto esta por verse//nombre de campo//nombre de campo//nombre de campo//nombre de campo
    
    @IsInt()
    @IsPositive()
    @IsOptional()
    idMarca: number;
}
