import { Type } from 'class-transformer';
import {
    IsArray, IsBoolean, IsDate, IsNumber,
    IsOptional, IsPositive, IsString,
    MinLength, ValidateNested
} from 'class-validator';

export class CreatePackDetalleDto {

    @IsString()
    idProductoFk: string;

    @IsNumber()
    @IsPositive()
    cantidad: number;

    @IsNumber()
    @IsPositive()
    precio_unitario_referencia: number;
}

export class CreatePackDto {

    @IsString()
    @MinLength(1)
    nombre_pack: string;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @IsNumber()
    @IsPositive()
    precio_pack: number;

    @IsNumber()
    @IsOptional()
    descuento_pack?: number;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    vigencia_desde?: Date;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    vigencia_hasta?: Date;

    @IsBoolean()
    @IsOptional()
    activo?: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePackDetalleDto)
    items: CreatePackDetalleDto[];
}
