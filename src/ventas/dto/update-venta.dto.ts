import { IsString, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { EstadoVenta } from 'src/common/enums';

/**
 * Solo los campos que un admin puede modificar después de crear la venta.
 * Campos financieros (precioTotal, descuento, entradaInicial) y de
 * identificación (numeroFactura, idClienteFk, idEmpleadoFk) son inmutables.
 */
export class UpdateVentaDto {

    @IsOptional()
    @IsEnum(EstadoVenta)
    estadoVenta?: EstadoVenta;

    @IsOptional()
    @IsString()
    observaciones?: string;

    // ── Entrega física ────────────────────────────────────────────────────
    @IsOptional()
    @IsBoolean()
    segunda_llave_entregada?: boolean;

    @IsOptional()
    @IsDateString()
    fecha_segunda_llave?: string;

    @IsOptional()
    @IsBoolean()
    documentos_entregados?: boolean;

    @IsOptional()
    @IsDateString()
    fecha_entrega_documentos?: string;
}