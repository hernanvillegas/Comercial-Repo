import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMovimientoInventarioDto {

    @IsUUID()
    idProductoFk: string;

    @IsInt()
    @IsNotEmpty()
    cantidad: number; // positivo = entrada, negativo = salida

    @IsIn(['compra', 'venta', 'ajuste', 'devolucion', 'baja'])
    tipo_movimiento: string;

    @IsUUID()
    idEmpleadoFk: string;

    @IsUUID()
    @IsOptional()
    idVentaFk?: string;

    @IsString()
    @IsOptional()
    observaciones?: string;
}
