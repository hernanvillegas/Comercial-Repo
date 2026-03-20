import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @Type(() => Date)
  @IsDate()
  fecha_ingreso: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  fecha_venta: Date;
}
