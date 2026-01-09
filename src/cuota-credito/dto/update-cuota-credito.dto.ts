import { PartialType } from '@nestjs/mapped-types';
import { CreateCuotaCreditoDto } from './create-cuota-credito.dto';

export class UpdateCuotaCreditoDto extends PartialType(CreateCuotaCreditoDto) {}
