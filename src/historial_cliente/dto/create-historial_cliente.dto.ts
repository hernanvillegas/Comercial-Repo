import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, Min } from "class-validator";


export class CreateHistorialClienteDto {
  
  @IsDateString()
  @IsOptional()
  fecha_compra?: Date;

  @IsDateString()
  @IsOptional()
  fecha_ultima_compra?: Date;

  @IsInt()
  @Min(1)
  @IsOptional()
  total_compras?: number;

  // @IsBoolean()
  // @IsOptional()
  // cumplido?: boolean;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
