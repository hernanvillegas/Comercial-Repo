import { Type } from 'class-transformer';
import {
    IsDate, IsIn, IsInt, IsOptional,
    IsPositive, IsString, IsUUID, MinLength
} from 'class-validator';

export class CreateDetalleMotoDto {

    @IsUUID()
    idProductoFk: string;

    @IsString()
    @MinLength(1)
    numero_chasis: string;

    @IsString()
    @MinLength(1)
    numero_motor: string;

    @IsInt()
    @IsPositive()
    poliza_importacion: number;

    @IsIn(['NEGRO', 'ROJO', 'AZUL', 'CAFE', 'BLANCO', 'VERDE', 'GRIS', 'NARANJA'])
    color_moto: string;

    @IsString()
    @IsOptional()
    traccion?: string;

    @IsIn(['nueva', 'seminueva', 'usada'])
    tipo_moto: string;

    @IsIn(['disponible', 'vendido', 'reservado', 'baja'])
    estado_moto: string;

    @Type(() => Date)
    @IsDate()
    fecha_ingreso: Date;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    fecha_venta?: Date;

    @IsInt()
    @IsPositive()
    @IsOptional()
    idModelo?: number;
}
