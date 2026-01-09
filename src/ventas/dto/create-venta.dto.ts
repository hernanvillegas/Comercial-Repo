import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoVenta {
  CREDITO = 'credito',
  CONTADO = 'contado'
}

export enum EstadoVenta {
  ACTIVA = 'activa',
  PAGADA = 'pagada',
  CANCELADA = 'cancelada'
}

export class CreateVentaDto {
  @IsString()
  @IsNotEmpty()
  numeroFactura: string;

  @IsEnum(TipoVenta)
  @IsNotEmpty()
  tipoVenta: TipoVenta;

  @IsOptional()
  fechaVenta?: Date;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @Type(() => Number)
  precioVenta: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  descuento?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @Type(() => Number)
  precioTotal: number;

  @IsEnum(EstadoVenta)
  @IsNotEmpty()
  estadoVenta: EstadoVenta;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  numeroCuotas?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1000)
  @Type(() => Number)
  entradaInicial?: number;

  @IsString() /////////////////
  @IsNotEmpty()
  idEmpleadoFk: string;

  @IsUUID()
  @IsNotEmpty()
  idProductoFk: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  idClienteFk: number;
}