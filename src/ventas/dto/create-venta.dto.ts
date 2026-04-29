import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsUUID, IsBoolean, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoVenta, EstadoVenta } from 'src/common/enums';

export class CreateVentaDto {

    @IsString()
    @IsNotEmpty()
    numeroFactura: string;

    @IsEnum(TipoVenta)
    @IsNotEmpty()
    tipoVenta: TipoVenta;

    @IsOptional()
    fechaVenta?: Date;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsOptional()
    @Type(() => Number)
    subtotal?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Type(() => Number)
    descuento?: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsNotEmpty()
    @Type(() => Number)
    precioTotal: number;

    @IsEnum(EstadoVenta)
    @IsNotEmpty()
    estadoVenta: EstadoVenta;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    numeroCuotas?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(1000)
    @Type(() => Number)
    entradaInicial?: number;

    @IsOptional()
    @IsString()
    observaciones?: string;

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

    @IsString()
    @IsNotEmpty()
    idEmpleadoFk: string;

    @IsOptional()
    @IsUUID()
    idProductoFk?: string;

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    idClienteFk: number;
}