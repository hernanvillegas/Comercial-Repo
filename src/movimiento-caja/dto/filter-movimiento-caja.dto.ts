import { IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { TipoMovimiento, MetodoPago } from './create-movimiento-caja.dto';

export class FilterMovimientoCajaDto {
  @IsOptional()
  @IsUUID()
  idVentaFk?: string;

  @IsOptional()
  @IsUUID()
  idCuotaFk?: string;

  @IsOptional()
  @IsEnum(TipoMovimiento)
  tipoMovimiento?: TipoMovimiento;

  @IsOptional()
  @IsEnum(MetodoPago)
  metodoPago?: MetodoPago;

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @IsOptional()
  @IsDateString()
  fechaPago?: string;
}