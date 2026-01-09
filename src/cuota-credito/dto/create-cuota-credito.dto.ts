import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsUUID, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum EstadoCuota {
  PENDIENTE = 'pendiente',
  PAGADA = 'pagada',
  VENCIDA = 'vencida'
}

export class CreateCuotaCreditoDto {
  @IsUUID()
  @IsNotEmpty()
  idVentaFk: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  numeroDeCuota: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  faltanCuotas: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @Type(() => Number)
  montoCuota: number;

  @IsDateString()
  @IsNotEmpty()
  fechaVencimiento: Date;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @Type(() => Number)
  montoAcordado: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  montoPagado?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @Type(() => Number)
  montoRestante: number;

  @IsOptional()
  @IsEnum(EstadoCuota)
  estado?: EstadoCuota;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  mora?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}