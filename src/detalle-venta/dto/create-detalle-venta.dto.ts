import { IsInt, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateDetalleVentaDto {

    @IsUUID()
    idVentaFk: string;

    // Al menos uno de los dos debe venir
    @IsUUID()
    @IsOptional()
    idProductoFk?: string;

    @IsUUID()
    @IsOptional()
    idPackFk?: string;

    @IsInt()
    @IsPositive()
    cantidad: number;

    @IsNumber()
    @IsPositive()
    precio_unitario: number;

    @IsNumber()
    @IsOptional()
    descuento?: number;

    @IsNumber()
    @IsPositive()
    subtotal: number;

    @IsString()
    @MinLength(1)
    nombre_producto_snapshot: string;
}
