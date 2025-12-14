import { PartialType } from '@nestjs/mapped-types';
import { CreateGaranteDto } from './create-garante.dto';

export class UpdateGaranteDto extends PartialType(CreateGaranteDto) {}
