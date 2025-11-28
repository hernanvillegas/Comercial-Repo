import { IsArray, IsDate, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateProductDto {

        @IsString()
        @MinLength(1)
        titulo_moto: string;
    
        @IsString()
        @MinLength(1)
        codigo_moto: string;
    
        @IsInt()
        @IsPositive()
        poliza_importacion:number;
    
        @IsString()
        @MinLength(1)
        numero_chasis: string;
    
        @IsString()
        @MinLength(1)
        numero_motor: string;
    
        @IsIn(['negro','rojo','azul','cafe','blanco'])
        color_moto: string; //negra, rojo, azul,etc
    
        @IsInt()
        @IsPositive()
        @IsOptional()
        cantidad_moto?: number;
    
        @IsIn(['nueva','seminueva','usada'])
        tipo_moto:string; // nueva, seminueva, usada
    
        @IsNumber()
        @IsPositive()
        @IsOptional()
        precio_compra?: number;
    
        @IsNumber()
        @IsPositive()
        @IsOptional()
        precio_venta?: number;
    
        @IsIn(['vendida','disponible','reservada','mantenimiento'])
        estado_moto:string; //vendida, disponible, reservada, en reparacion
    
        @IsDate()
        @IsOptional()
        fecha_ingreso?:Date;
    
        @IsDate()
        @IsOptional()
        fecha_venta?: Date;
    
        @IsIn(['hombre','mujer','unisex','niños'])
        genero_moto:string; //moto de varon o mujer UNISEX
    
        @IsString()
        @IsOptional()
        traccion?:string; //2x2, 2x1
    
        @IsString()
        @IsOptional()
        descripcion?:string;

        @IsString()
        @IsOptional()
        slug?:string;

        @IsString({each:true})
        @IsArray()
        @IsOptional()
        etiquetas:string[];

        @IsString({each:true})
        @IsArray()
        @IsOptional()
        images?:string[];

        @IsInt()
        @IsPositive()
        @IsOptional()
        idProveedor: number;
    
}
