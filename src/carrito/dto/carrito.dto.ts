import { IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class AgregarItemCarritoDto {

    // Al menos uno debe venir
    @IsUUID()
    @IsOptional()
    idProductoFk?: string;

    @IsUUID()
    @IsOptional()
    idPackFk?: string;

    @IsInt()
    @IsPositive()
    cantidad: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @Type(() => Number)
    precio_unitario_snapshot: number;
}

export class UpdateCarritoDto {

    @IsIn(['activo', 'abandonado'])
    @IsOptional()
    estado?: string;
}
