import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Venta }            from 'src/ventas/entities/venta.entity';
import { DetalleVenta }     from 'src/detalle-venta/entities/detalle-venta.entity';
import { Producto }         from 'src/producto/entities/producto.entity';
import { CuotaCredito }     from 'src/cuota-credito/entities/cuota-credito.entity';
import { MovimientoCaja }   from 'src/movimiento-caja/entities/movimiento-caja.entity';
import { Cliente }          from 'src/cliente/entities/cliente.entity';

@Injectable()
export class ReportesService {

    constructor(
        @InjectRepository(Venta)
        private ventaRepository: Repository<Venta>,

        @InjectRepository(DetalleVenta)
        private detalleVentaRepository: Repository<DetalleVenta>,

        @InjectRepository(Producto)
        private productoRepository: Repository<Producto>,

        @InjectRepository(CuotaCredito)
        private cuotaRepository: Repository<CuotaCredito>,

        @InjectRepository(MovimientoCaja)
        private cajaRepository: Repository<MovimientoCaja>,

        @InjectRepository(Cliente)
        private clienteRepository: Repository<Cliente>,
    ) {}

    // ── 1. Productos más vendidos ─────────────────────────────────────────
    async productosMasVendidos(fechaDesde?: string, fechaHasta?: string, limit = 10) {
        const qb = this.detalleVentaRepository
            .createQueryBuilder('dv')
            .select('p.id',                    'id')
            .addSelect('p.nombre_producto',    'nombre')
            .addSelect('p.tipo_producto',      'tipo')
            .addSelect('SUM(dv.cantidad)',      'unidades_vendidas')
            .addSelect('SUM(dv.subtotal)',      'total_generado')
            .innerJoin('dv.producto', 'p')
            .innerJoin('dv.venta',    'v')
            .where('v.estadoVenta != :estado', { estado: 'anulada' });

        if (fechaDesde) qb.andWhere('v.fechaVenta >= :fechaDesde', { fechaDesde });
        if (fechaHasta) qb.andWhere('v.fechaVenta <= :fechaHasta', { fechaHasta });

        return qb
            .groupBy('p.id')
            .addGroupBy('p.nombre_producto')
            .addGroupBy('p.tipo_producto')
            .orderBy('unidades_vendidas', 'DESC')
            .limit(limit)
            .getRawMany();
    }

    // ── 2. Productos menos vendidos ───────────────────────────────────────
    async productosMenosVendidos(limit = 10) {
        return this.detalleVentaRepository
            .createQueryBuilder('dv')
            .select('p.id',                 'id')
            .addSelect('p.nombre_producto', 'nombre')
            .addSelect('p.tipo_producto',   'tipo')
            .addSelect('SUM(dv.cantidad)',  'unidades_vendidas')
            .innerJoin('dv.producto', 'p')
            .innerJoin('dv.venta',    'v')
            .where('v.estadoVenta != :estado', { estado: 'anulada' })
            .groupBy('p.id')
            .addGroupBy('p.nombre_producto')
            .addGroupBy('p.tipo_producto')
            .orderBy('unidades_vendidas', 'ASC')
            .limit(limit)
            .getRawMany();
    }

    // ── 3. Ventas por período ─────────────────────────────────────────────
    async ventasPorPeriodo(periodo: 'dia' | 'mes' | 'anio', fechaDesde?: string, fechaHasta?: string) {
        const formato = {
            dia:  `DATE(v.fechaVenta)`,
            mes:  `TO_CHAR(v.fechaVenta, 'YYYY-MM')`,
            anio: `TO_CHAR(v.fechaVenta, 'YYYY')`,
        }[periodo];

        const qb = this.ventaRepository
            .createQueryBuilder('v')
            .select(formato,              'periodo')
            .addSelect('COUNT(v.idVenta)', 'cantidad_ventas')
            .addSelect('SUM(v.precioTotal)', 'total_ingresos')
            .where('v.estadoVenta != :estado', { estado: 'anulada' });

        if (fechaDesde) qb.andWhere('v.fechaVenta >= :fechaDesde', { fechaDesde });
        if (fechaHasta) qb.andWhere('v.fechaVenta <= :fechaHasta', { fechaHasta });

        return qb
            .groupBy(formato)
            .orderBy('periodo', 'DESC')
            .getRawMany();
    }

    // ── 4. Stock bajo (stock <= stock_minimo) ─────────────────────────────
    async stockBajo() {
        return this.productoRepository
            .createQueryBuilder('p')
            .select('p.id',                 'id')
            .addSelect('p.nombre_producto', 'nombre')
            .addSelect('p.tipo_producto',   'tipo')
            .addSelect('p.stock',           'stock_actual')
            .addSelect('p.stock_minimo',    'stock_minimo')
            .addSelect('p.stock - p.stock_minimo', 'diferencia')
            .leftJoin('p.proveedor', 'prov')
            .addSelect('prov.nombre_proveedor', 'proveedor')
            .where('p.stock <= p.stock_minimo')
            .andWhere('p.tipo_producto != :tipo', { tipo: 'servicio' })
            .andWhere('p.disponible = true')
            .orderBy('diferencia', 'ASC')
            .getRawMany();
    }

    // ── 5. Cuotas atrasadas con datos del cliente ─────────────────────────
    async cuotasAtrasadas() {
        return this.cuotaRepository
            .createQueryBuilder('cc')
            .select('c.nombre_cliente',       'nombre')
            .addSelect('c.apellido_cliente',  'apellido')
            .addSelect('c.celular',           'celular')
            .addSelect('c.email',             'email')
            .addSelect('v.numeroFactura',     'factura')
            .addSelect('cc.numeroDeCuota',    'numero_cuota')
            .addSelect('cc.fechaVencimiento', 'fecha_vencimiento')
            .addSelect('cc.montoRestante',    'monto_pendiente')
            .addSelect('cc.mora',             'mora')
            .addSelect(`CURRENT_DATE - DATE(cc.fechaVencimiento)`, 'dias_atraso')
            .innerJoin('cc.ventaFk', 'v')
            .innerJoin('v.cliente',  'c')
            .where('cc.estado IN (:...estados)', { estados: ['pendiente', 'parcial'] })
            .andWhere('cc.fechaVencimiento < NOW()')
            .orderBy('dias_atraso', 'DESC')
            .getRawMany();
    }

    // ── 6. Cuotas próximas a vencer ───────────────────────────────────────
    async cuotasProximasVencer(dias = 7) {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() + dias);

        return this.cuotaRepository
            .createQueryBuilder('cc')
            .select('c.nombre_cliente',       'nombre')
            .addSelect('c.apellido_cliente',  'apellido')
            .addSelect('c.celular',           'celular')
            .addSelect('v.numeroFactura',     'factura')
            .addSelect('cc.numeroDeCuota',    'numero_cuota')
            .addSelect('cc.fechaVencimiento', 'fecha_vencimiento')
            .addSelect('cc.montoCuota',       'monto_cuota')
            .addSelect('cc.faltanCuotas',     'cuotas_restantes')
            .innerJoin('cc.ventaFk', 'v')
            .innerJoin('v.cliente',  'c')
            .where('cc.estado = :estado', { estado: 'pendiente' })
            .andWhere('cc.fechaVencimiento BETWEEN NOW() AND :fechaLimite', { fechaLimite })
            .orderBy('cc.fechaVencimiento', 'ASC')
            .getRawMany();
    }

    // ── 7. Seguimiento completo de crédito por cliente ────────────────────
    async seguimientoCreditoCliente(idCliente: number) {
        return this.cuotaRepository
            .createQueryBuilder('cc')
            .select('v.numeroFactura',       'factura')
            .addSelect('v.precioTotal',      'precio_total_venta')
            .addSelect('v.entradaInicial',   'entrada_inicial')
            .addSelect('cc.numeroDeCuota',   'numero_cuota')
            .addSelect('cc.montoCuota',      'monto_cuota')
            .addSelect('cc.montoPagado',     'monto_pagado')
            .addSelect('cc.montoRestante',   'monto_restante')
            .addSelect('cc.fechaVencimiento','fecha_vencimiento')
            .addSelect('cc.estado',          'estado')
            .addSelect('cc.mora',            'mora')
            .innerJoin('cc.ventaFk', 'v')
            .innerJoin('v.cliente',  'c')
            .where('c.id_cliente = :idCliente', { idCliente })
            .orderBy('v.fechaVenta',     'DESC')
            .addOrderBy('cc.numeroDeCuota', 'ASC')
            .getRawMany();
    }

    // ── 8. Historial completo de compras por cliente ──────────────────────
    async historialComprasCliente(idCliente: number) {
        return this.ventaRepository
            .createQueryBuilder('v')
            .select('v.idVenta',          'id_venta')
            .addSelect('v.numeroFactura', 'factura')
            .addSelect('v.tipoVenta',     'tipo')
            .addSelect('v.fechaVenta',    'fecha')
            .addSelect('v.precioTotal',   'total')
            .addSelect('v.estadoVenta',   'estado')
            .innerJoin('v.cliente', 'c')
            .where('c.id_cliente = :idCliente', { idCliente })
            .orderBy('v.fechaVenta', 'DESC')
            .getRawMany();
    }

    // ── 9. Ranking de clientes por monto comprado ─────────────────────────
    async rankingClientes(limit = 10) {
        return this.ventaRepository
            .createQueryBuilder('v')
            .select('c.id_cliente',          'id')
            .addSelect('c.nombre_cliente',   'nombre')
            .addSelect('c.apellido_cliente', 'apellido')
            .addSelect('c.celular',          'celular')
            .addSelect('COUNT(v.idVenta)',   'total_compras')
            .addSelect('SUM(v.precioTotal)', 'monto_total')
            .innerJoin('v.cliente', 'c')
            .where('v.estadoVenta != :estado', { estado: 'anulada' })
            .groupBy('c.id_cliente')
            .addGroupBy('c.nombre_cliente')
            .addGroupBy('c.apellido_cliente')
            .addGroupBy('c.celular')
            .orderBy('monto_total', 'DESC')
            .limit(limit)
            .getRawMany();
    }

    // ── 10. Balance de caja por período ───────────────────────────────────
    async balanceCaja(fechaDesde?: string, fechaHasta?: string) {
        const qb = this.cajaRepository
            .createQueryBuilder('mc')
            .select('mc.tipoMovimiento', 'tipo')
            .addSelect('mc.categoria',   'categoria')
            .addSelect('SUM(mc.montoPago)', 'total')
            .addSelect('COUNT(*)',          'cantidad');

        if (fechaDesde) qb.where('mc.fechaPago >= :fechaDesde', { fechaDesde });
        if (fechaHasta) qb.andWhere('mc.fechaPago <= :fechaHasta', { fechaHasta });

        const detalle = await qb
            .groupBy('mc.tipoMovimiento')
            .addGroupBy('mc.categoria')
            .orderBy('mc.tipoMovimiento', 'ASC')
            .getRawMany();

        // Calcular resumen de ingresos vs egresos
        const ingresos = detalle
            .filter(r => r.tipo === 'ingreso')
            .reduce((acc, r) => acc + Number(r.total), 0);

        const egresos = detalle
            .filter(r => r.tipo === 'egreso')
            .reduce((acc, r) => acc + Number(r.total), 0);

        return {
            resumen: {
                total_ingresos: ingresos,
                total_egresos:  egresos,
                balance_neto:   ingresos - egresos,
            },
            detalle,
        };
    }

    // ── 11. Rentabilidad por producto ─────────────────────────────────────
    async rentabilidadProductos(limit = 10) {
        return this.detalleVentaRepository
            .createQueryBuilder('dv')
            .select('p.id',                           'id')
            .addSelect('p.nombre_producto',           'nombre')
            .addSelect('p.tipo_producto',             'tipo')
            .addSelect('p.precio_compra',             'precio_compra')
            .addSelect('AVG(dv.precio_unitario)',      'precio_venta_promedio')
            .addSelect('SUM(dv.cantidad)',             'unidades_vendidas')
            .addSelect(
                '(AVG(dv.precio_unitario) - p.precio_compra) * SUM(dv.cantidad)',
                'ganancia_total'
            )
            .innerJoin('dv.producto', 'p')
            .innerJoin('dv.venta',    'v')
            .where('v.estadoVenta != :estado', { estado: 'anulada' })
            .groupBy('p.id')
            .addGroupBy('p.nombre_producto')
            .addGroupBy('p.tipo_producto')
            .addGroupBy('p.precio_compra')
            .orderBy('ganancia_total', 'DESC')
            .limit(limit)
            .getRawMany();
    }

    // ── 12. Ventas por empleado ───────────────────────────────────────────
    async ventasPorEmpleado(fechaDesde?: string, fechaHasta?: string) {
        const qb = this.ventaRepository
            .createQueryBuilder('v')
            .select('u.id',               'id_empleado')
            .addSelect('u.fullName',       'nombre_empleado')
            .addSelect('u.sucursal',       'sucursal')
            .addSelect('COUNT(v.idVenta)', 'total_ventas')
            .addSelect('SUM(v.precioTotal)', 'monto_total')
            .innerJoin('v.empleados', 'u')
            .where('v.estadoVenta != :estado', { estado: 'anulada' });

        if (fechaDesde) qb.andWhere('v.fechaVenta >= :fechaDesde', { fechaDesde });
        if (fechaHasta) qb.andWhere('v.fechaVenta <= :fechaHasta', { fechaHasta });

        return qb
            .groupBy('u.id')
            .addGroupBy('u.fullName')
            .addGroupBy('u.sucursal')
            .orderBy('monto_total', 'DESC')
            .getRawMany();
    }
}
