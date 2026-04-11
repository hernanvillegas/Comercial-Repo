import { Type } from 'class-transformer';
import {
    IsArray, IsBoolean, IsIn, IsInt, IsNumber,
    IsOptional, IsPositive, IsString, MinLength
} from 'class-validator';

export class CreateProductoDto {

    @IsString()
    @MinLength(1)
    nombre_producto: string;

    @IsString()
    @MinLength(1)
    codigo_producto: string;

    @IsIn(['moto', 'accesorio', 'repuesto', 'servicio', 'otro'])
    tipo_producto: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    precio_compra?: number;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    precio_venta?: number;

    // NULL para servicios
    @IsInt()
    @IsOptional()
    stock?: number;

    @IsInt()
    @IsOptional()
    stock_minimo?: number;

    @IsBoolean()
    @IsOptional()
    disponible?: boolean;

    @IsIn(['hombre', 'mujer', 'unisex', 'niños'])
    @IsOptional()
    gender?: string;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    etiquetas?: string[];

    // Imágenes igual que en producto_motos
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    images?: string[];

    @IsInt()
    @IsPositive()
    @IsOptional()
    idProveedor?: number;

    @IsInt()
    @IsPositive()
    @IsOptional()
    idCategoria?: number;
}
