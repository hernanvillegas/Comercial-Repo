// src/ventas/dto/filter-venta.dto.ts
import { IsOptional, IsEnum, IsNumber, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoVenta, EstadoVenta } from './create-venta.dto';

export class FilterVentaDto {
  @IsOptional()
  @IsEnum(EstadoVenta)
  estado?: EstadoVenta;

  @IsOptional()
  @IsEnum(TipoVenta)
  tipo?: TipoVenta;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minCuotas?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxCuotas?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  dias?: number;

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  precioMin?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  precioMax?: number;

  @IsOptional()
  @IsString()
  numeroFactura?: string;
}