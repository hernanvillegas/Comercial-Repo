import { IsOptional, IsEnum, IsUUID, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoCuota } from './create-cuota-credito.dto';

export class FilterCuotaCreditoDto {
  @IsOptional()
  @IsUUID()
  idVentaFk?: string;

  @IsOptional()
  @IsEnum(EstadoCuota)
  estado?: EstadoCuota;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  vencidas?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  proximasAVencer?: number;
}
