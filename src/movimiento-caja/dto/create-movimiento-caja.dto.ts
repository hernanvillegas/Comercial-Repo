import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoMovimiento {
  VENTAS = 'ventas',
  CREDITO = 'credito'
}

export enum MetodoPago {
  EFECTIVO = 'efectivo',
  TRANSFERENCIA = 'transferencia',
  TARJETA = 'tarjeta'
}

export class CreateMovimientoCajaDto {
  @IsString()
  @IsNotEmpty()
  idVentaFk: string;

  @IsString()
  @IsNotEmpty()
  idCuotaFk: string;

  @IsOptional()
  @IsDateString()
  fechaPago?: Date;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @Type(() => Number)
  montoPago: number;

  @IsEnum(TipoMovimiento)
  @IsNotEmpty()
  tipoMovimiento: TipoMovimiento;

  @IsString()
  @IsNotEmpty()
  conceptoPago: string;

  @IsEnum(MetodoPago)
  @IsNotEmpty()
  metodoPago: MetodoPago;

  @IsString()
  @IsNotEmpty()
  numeroRecibo: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}