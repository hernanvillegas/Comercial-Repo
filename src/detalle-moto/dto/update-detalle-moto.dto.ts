import { PartialType } from '@nestjs/swagger';
import { CreateDetalleMotoDto } from './create-detalle-moto.dto';

export class UpdateDetalleMotoDto extends PartialType(CreateDetalleMotoDto) {}
