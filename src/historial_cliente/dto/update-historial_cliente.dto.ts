import { PartialType } from '@nestjs/mapped-types';
import { CreateHistorialClienteDto } from './create-historial_cliente.dto';

export class UpdateHistorialClienteDto extends PartialType(CreateHistorialClienteDto) {}
