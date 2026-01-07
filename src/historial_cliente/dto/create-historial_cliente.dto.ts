import { IsBoolean, IsDateString, IsInt, IsOptional, IsPositive, IsString, Min } from "class-validator";


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

  // para la llave foranea
  @IsInt()
  @IsPositive()
  @IsOptional()
  idClienteFk: number;
}
