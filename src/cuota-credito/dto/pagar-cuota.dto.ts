import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PagarCuotaDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @Type(() => Number)
  montoPago: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}