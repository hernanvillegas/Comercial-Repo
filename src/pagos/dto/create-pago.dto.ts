import { Type } from 'class-transformer';
import {
    IsDateString, IsEnum, IsNumber,
    IsOptional, IsPositive, IsString, IsUUID
} from 'class-validator';

export enum TipoPago {
    ENTRADA_INICIAL  = 'entrada_inicial',
    CUOTA            = 'cuota',
    PAGO_CONTADO     = 'pago_contado',
    PAGO_PARCIAL     = 'pago_parcial',
    PAGO_SERVICIO    = 'pago_servicio',
    OTRO             = 'otro',
}

export enum MetodoPago {
    EFECTIVO      = 'efectivo',
    TRANSFERENCIA = 'transferencia',
    TARJETA       = 'tarjeta',
    QR            = 'qr',
    CHEQUE        = 'cheque',
    MIXTO         = 'mixto',
}

export class CreatePagoDto {

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @Type(() => Number)
    montoPago: number;

    @IsEnum(TipoPago)
    tipoPago: TipoPago;

    @IsEnum(MetodoPago)
    metodoPago: MetodoPago;

    @IsString()
    numeroRecibo: string;

    // Al menos uno de los dos debe venir
    @IsUUID()
    @IsOptional()
    idVentaFk?: string;

    @IsUUID()
    @IsOptional()
    idCuotaFk?: string;

    @IsUUID()
    idEmpleadoFk: string;

    @IsDateString()
    @IsOptional()
    fechaPago?: Date;

    @IsString()
    @IsOptional()
    observaciones?: string;
}
