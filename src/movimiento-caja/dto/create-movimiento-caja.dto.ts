import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoMovimiento {
    INGRESO = 'ingreso',
    EGRESO  = 'egreso',
}

export enum CategoriaCaja {
    VENTA_CONTADO    = 'venta_contado',
    COBRO_CUOTA      = 'cobro_cuota',
    ENTRADA_INICIAL  = 'entrada_inicial',
    GASTO_OPERATIVO  = 'gasto_operativo',
    GASTO_PROVEEDOR  = 'gasto_proveedor',
    DEVOLUCION       = 'devolucion',
    AJUSTE           = 'ajuste',
    OTRO             = 'otro',
}

export enum MetodoPago {
    EFECTIVO      = 'efectivo',
    TRANSFERENCIA = 'transferencia',
    TARJETA       = 'tarjeta',
    QR            = 'qr',
    CHEQUE        = 'cheque',
    MIXTO         = 'mixto',
}

export class CreateMovimientoCajaDto {

    @IsOptional()
    @IsUUID()
    idVentaFk?: string;

    @IsOptional()
    @IsUUID()
    idCuotaFk?: string;

    // NUEVO: FK al pago que originó este movimiento
    @IsOptional()
    @IsUUID()
    idPagoFk?: string;

    // NUEVO: empleado responsable
    @IsOptional()
    @IsUUID()
    idEmpleadoFk?: string;

    @IsOptional()
    @IsDateString()
    fechaPago?: Date;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsNotEmpty()
    @Type(() => Number)
    montoPago: number;

    @IsEnum(TipoMovimiento)
    @IsNotEmpty()
    tipoMovimiento: TipoMovimiento;

    // NUEVO: categoría para reportes limpios
    @IsEnum(CategoriaCaja)
    @IsNotEmpty()
    categoria: CategoriaCaja;

    @IsString()
    @IsNotEmpty()
    conceptoPago: string;

    @IsEnum(MetodoPago)
    @IsNotEmpty()
    metodoPago: MetodoPago;

    @IsString()
    @IsOptional()
    numeroRecibo?: string;

    @IsString()
    @IsOptional()
    sucursal?: string;

    @IsOptional()
    @IsString()
    observaciones?: string;
}
