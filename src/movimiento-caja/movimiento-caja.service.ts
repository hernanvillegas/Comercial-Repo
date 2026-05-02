import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovimientoCajaDto }  from './dto/create-movimiento-caja.dto';
import { UpdateMovimientoCajaDto }  from './dto/update-movimiento-caja.dto';
import { InjectRepository }         from '@nestjs/typeorm';
import { MovimientoCaja }           from './entities/movimiento-caja.entity';
import { Between, LessThan, Repository } from 'typeorm';
import { FilterMovimientoCajaDto }  from './dto/filter-movimiento-caja.dto';
import { PaginationDto }            from 'src/common/dto/paginacion.dto';

@Injectable()
export class MovimientoCajaService {

    constructor(
        @InjectRepository(MovimientoCaja)
        private movimientosRepository: Repository<MovimientoCaja>,
    ) {}

    async create(createMovimientoCajaDto: CreateMovimientoCajaDto): Promise<MovimientoCaja> {
        const movimiento = this.movimientosRepository.create(createMovimientoCajaDto);
        return await this.movimientosRepository.save(movimiento);
    }

    async findAll(paginationDto: PaginationDto): Promise<MovimientoCaja[]> {
        const { limit = 20, offset = 0 } = paginationDto;
        return await this.movimientosRepository.find({
            relations: ['venta', 'cuota', 'venta.cliente'],
            order:     { fechaPago: 'DESC' },
            take:      limit,
            skip:      offset,
        });
    }

    async findOne(id: string): Promise<MovimientoCaja> {
        const movimiento = await this.movimientosRepository.findOne({
            where:     { idMovimiento: id },
            relations: ['venta', 'cuota', 'venta.cliente'],
        });

        if (!movimiento)
            throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);

        return movimiento;
    }

    async findWithFilters(filters: FilterMovimientoCajaDto): Promise<MovimientoCaja[]> {
        const queryBuilder = this.movimientosRepository.createQueryBuilder('movimiento');

        if (filters.idVentaFk)
            queryBuilder.andWhere('movimiento.idVentaFk = :idVentaFk', { idVentaFk: filters.idVentaFk });

        if (filters.idCuotaFk)
            queryBuilder.andWhere('movimiento.idCuotaFk = :idCuotaFk', { idCuotaFk: filters.idCuotaFk });

        if (filters.tipoMovimiento)
            queryBuilder.andWhere('movimiento.tipoMovimiento = :tipoMovimiento', { tipoMovimiento: filters.tipoMovimiento });

        if (filters.metodoPago)
            queryBuilder.andWhere('movimiento.metodoPago = :metodoPago', { metodoPago: filters.metodoPago });

        if (filters.fechaPago) {
            const fecha      = new Date(filters.fechaPago);
            const fechaInicio = new Date(fecha.setHours(0,  0,  0,   0));
            const fechaFin    = new Date(fecha.setHours(23, 59, 59, 999));
            queryBuilder.andWhere('movimiento.fechaPago BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin });
        }

        if (filters.fechaDesde && filters.fechaHasta) {
            queryBuilder.andWhere('movimiento.fechaPago BETWEEN :fechaDesde AND :fechaHasta', {
                fechaDesde: filters.fechaDesde,
                fechaHasta: filters.fechaHasta,
            });
        } else if (filters.fechaDesde) {
            queryBuilder.andWhere('movimiento.fechaPago >= :fechaDesde', { fechaDesde: filters.fechaDesde });
        } else if (filters.fechaHasta) {
            queryBuilder.andWhere('movimiento.fechaPago <= :fechaHasta', { fechaHasta: filters.fechaHasta });
        }

        queryBuilder.orderBy('movimiento.fechaPago', 'DESC');
        return await queryBuilder.getMany();
    }

    async findByVenta(idVenta: string): Promise<MovimientoCaja[]> {
        return await this.movimientosRepository.find({
            where:  { idVentaFk: idVenta },
            relations: ['cuota'],
            order:  { fechaPago: 'DESC' },
        });
    }

    async findByCuota(idCuota: string): Promise<MovimientoCaja[]> {
        return await this.movimientosRepository.find({
            where:  { idCuotaFk: idCuota },
            order:  { fechaPago: 'DESC' },
        });
    }

    async update(id: string, updateMovimientoCajaDto: UpdateMovimientoCajaDto): Promise<MovimientoCaja> {
        const movimiento          = await this.findOne(id);
        const movimientoActualizado = Object.assign(movimiento, updateMovimientoCajaDto);
        return await this.movimientosRepository.save(movimientoActualizado);
    }

    async remove(id: string): Promise<void> {
        const movimiento = await this.findOne(id);
        await this.movimientosRepository.remove(movimiento);
    }

    // ── Resumen diario (BUG CORREGIDO) ────────────────────────────────────────

    async obtenerResumenDiario(fecha: Date = new Date()): Promise<any> {
        const fechaInicio = new Date(fecha);
        fechaInicio.setHours(0,  0,  0,   0);
        const fechaFin    = new Date(fecha);
        fechaFin.setHours(23, 59, 59, 999);

        const movimientos = await this.movimientosRepository.find({
            where: { fechaPago: Between(fechaInicio, fechaFin) },
        });

        const resumen = {
            totalDelDia:   0,   // saldo neto = ingresos - egresos
            totalIngresos: 0,
            totalEgresos:  0,
            efectivo:      0,
            transferencia: 0,
            tarjeta:       0,
            qr:            0,
            ventas:        0,   // ingresos por venta_contado
            creditos:      0,   // ingresos por cobro_cuota + entrada_inicial
        };

        movimientos.forEach(mov => {
            const monto     = Number(mov.montoPago);
            const esIngreso = mov.tipoMovimiento === 'ingreso';

            // Saldo neto del día
            resumen.totalDelDia += esIngreso ? monto : -monto;

            if (esIngreso) {
                resumen.totalIngresos += monto;

                // Desglose por método de pago (solo ingresos)
                if (mov.metodoPago === 'efectivo')      resumen.efectivo      += monto;
                if (mov.metodoPago === 'transferencia') resumen.transferencia += monto;
                if (mov.metodoPago === 'tarjeta')       resumen.tarjeta       += monto;
                if (mov.metodoPago === 'qr')            resumen.qr            += monto;

                // Desglose por categoría de ingreso
                if (mov.categoria === 'venta_contado')   resumen.ventas   += monto;
                if (mov.categoria === 'cobro_cuota' ||
                    mov.categoria === 'entrada_inicial') resumen.creditos += monto;
            } else {
                resumen.totalEgresos += monto;
            }
        });

        return resumen;
    }

    // ── NUEVO: Saldo histórico acumulado ──────────────────────────────────────

    /**
     * Suma todos los ingresos menos todos los egresos desde el inicio
     * hasta la fecha indicada (inclusive). Si no se pasa fecha, usa hoy.
     * Esto representa el dinero total que debería haber en caja.
     */
    async obtenerSaldoHistorico(hastaFecha?: Date): Promise<{
        saldoHistorico: number;
        totalIngresosHistorico: number;
        totalEgresosHistorico:  number;
        primerMovimiento:       Date | null;
    }> {
        const hasta = hastaFecha ? new Date(hastaFecha) : new Date();
        hasta.setHours(23, 59, 59, 999);

        const movimientos = await this.movimientosRepository.find({
            where: { fechaPago: LessThan(hasta) },
            select: ['montoPago', 'tipoMovimiento', 'fechaPago'],
            order:  { fechaPago: 'ASC' },
        });

        let totalIngresos = 0;
        let totalEgresos  = 0;
        let primerMovimiento: Date | null = null;

        movimientos.forEach(mov => {
            const monto = Number(mov.montoPago);
            if (mov.tipoMovimiento === 'ingreso') totalIngresos += monto;
            else                                  totalEgresos  += monto;

            if (!primerMovimiento) primerMovimiento = mov.fechaPago;
        });

        return {
            saldoHistorico:          totalIngresos - totalEgresos,
            totalIngresosHistorico:  totalIngresos,
            totalEgresosHistorico:   totalEgresos,
            primerMovimiento,
        };
    }

    // ── NUEVO: Resumen por período (semana / mes / rango) ─────────────────────

    /**
     * Agrupa los movimientos por día dentro de un rango y devuelve
     * totales diarios + resumen del período completo.
     * Útil para gráficas de semana o mes en el frontend.
     */
    async obtenerResumenPeriodo(fechaDesde: Date, fechaHasta: Date): Promise<{
        resumenPeriodo: {
            totalIngresos:  number;
            totalEgresos:   number;
            saldoPeriodo:   number;
            ventas:         number;
            creditos:       number;
            gastos:         number;
        };
        porDia: {
            fecha:     string;
            ingresos:  number;
            egresos:   number;
            saldo:     number;
        }[];
    }> {
        const inicio = new Date(fechaDesde);
        inicio.setHours(0, 0, 0, 0);
        const fin = new Date(fechaHasta);
        fin.setHours(23, 59, 59, 999);

        const movimientos = await this.movimientosRepository.find({
            where: { fechaPago: Between(inicio, fin) },
            order: { fechaPago: 'ASC' },
        });

        // Acumuladores globales del período
        const resumenPeriodo = {
            totalIngresos: 0,
            totalEgresos:  0,
            saldoPeriodo:  0,
            ventas:        0,
            creditos:      0,
            gastos:        0,
        };

        // Mapa día → { ingresos, egresos }
        const mapasDia = new Map<string, { ingresos: number; egresos: number }>();

        movimientos.forEach(mov => {
            const monto     = Number(mov.montoPago);
            const esIngreso = mov.tipoMovimiento === 'ingreso';
            const diaKey    = new Date(mov.fechaPago).toISOString().slice(0, 10);

            if (!mapasDia.has(diaKey))
                mapasDia.set(diaKey, { ingresos: 0, egresos: 0 });

            const dia = mapasDia.get(diaKey)!;

            if (esIngreso) {
                dia.ingresos           += monto;
                resumenPeriodo.totalIngresos += monto;

                if (mov.categoria === 'venta_contado')   resumenPeriodo.ventas   += monto;
                if (mov.categoria === 'cobro_cuota' ||
                    mov.categoria === 'entrada_inicial') resumenPeriodo.creditos += monto;
            } else {
                dia.egresos           += monto;
                resumenPeriodo.totalEgresos += monto;
                resumenPeriodo.gastos       += monto;
            }
        });

        resumenPeriodo.saldoPeriodo = resumenPeriodo.totalIngresos - resumenPeriodo.totalEgresos;

        const porDia = Array.from(mapasDia.entries())
            .map(([fecha, datos]) => ({
                fecha,
                ingresos: datos.ingresos,
                egresos:  datos.egresos,
                saldo:    datos.ingresos - datos.egresos,
            }))
            .sort((a, b) => a.fecha.localeCompare(b.fecha));

        return { resumenPeriodo, porDia };
    }
}