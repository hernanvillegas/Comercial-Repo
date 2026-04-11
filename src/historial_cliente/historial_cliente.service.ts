import {
  BadRequestException, Injectable,
  InternalServerErrorException, Logger, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HistorialCliente } from './entities/historial_cliente.entity';
import { Cliente }          from 'src/cliente/entities/cliente.entity';
import { Venta }            from 'src/ventas/entities/venta.entity';
import { CuotaCredito }     from 'src/cuota-credito/entities/cuota-credito.entity';

import { CreateHistorialClienteDto } from './dto/create-historial_cliente.dto';
import { UpdateHistorialClienteDto } from './dto/update-historial_cliente.dto';

@Injectable()
export class HistorialClienteService {

  private readonly logger = new Logger('HistorialService');

  constructor(
    @InjectRepository(HistorialCliente)
    private readonly historialRepository: Repository<HistorialCliente>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(CuotaCredito)
    private readonly cuotaRepository: Repository<CuotaCredito>,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // RESUMEN COMPLETO — GET /historial-cliente/:clienteId/resumen
  // ─────────────────────────────────────────────────────────────────────────
  async getResumenCliente(clienteId: number) {
    const cliente = await this.clienteRepository.findOne({
      where: { id_cliente: clienteId },
    });
    if (!cliente) throw new NotFoundException(`Cliente ${clienteId} no encontrado`);

    const historialBase = await this.historialRepository.findOne({
      where: { idClienteFk: clienteId },
    });

    const ventas = await this.ventaRepository.find({
      where: { idClienteFk: clienteId },
      relations: ['detalles', 'detalles.producto', 'cuotas', 'pagos'],
      order: { fechaVenta: 'DESC' },
    });

    const ventasResumen = ventas.map((v) => {
      const cuotas          = v.cuotas ?? [];
      const cuotasAtrasadas = cuotas.filter(c => c.estado === 'vencida' || Number(c.mora) > 0);
      const productos       = (v.detalles ?? []).map(d => ({
        nombre:          d.nombre_producto_snapshot,
        cantidad:        d.cantidad,
        precio_unitario: Number(d.precio_unitario),
        subtotal:        Number(d.subtotal),
      }));

      let estadoPago: string;
      if (v.tipoVenta === 'contado') {
        estadoPago = 'Contado';
      } else {
        const todasPagadas  = cuotas.length > 0 && cuotas.every(c => c.estado === 'pagada');
        const algunaVencida = cuotas.some(c => c.estado === 'vencida');
        if (todasPagadas)       estadoPago = 'Crédito saldado';
        else if (algunaVencida) estadoPago = 'Crédito con mora';
        else                    estadoPago = 'Crédito al día';
      }

      return {
        idVenta:          v.idVenta,
        numeroFactura:    v.numeroFactura,
        fechaVenta:       v.fechaVenta,
        tipoVenta:        v.tipoVenta,
        precioTotal:      Number(v.precioTotal),
        entradaInicial:   v.entradaInicial ? Number(v.entradaInicial) : null,
        numeroCuotas:     v.numeroCuotas,
        estadoVenta:      v.estadoVenta,
        estadoPago,
        observaciones:    v.observaciones,
        productos,
        totalCuotas:      cuotas.length,
        cuotasPagadas:    cuotas.filter(c => c.estado === 'pagada').length,
        cuotasPendientes: cuotas.filter(c => c.estado === 'pendiente').length,
        cuotasVencidas:   cuotasAtrasadas.length,
        moraTotalVenta:   cuotasAtrasadas.reduce((acc, c) => acc + Number(c.mora), 0),
        montoCuota:       cuotas[0]?.montoCuota ? Number(cuotas[0].montoCuota) : null,
        cuotas: cuotas
          .sort((a, b) => a.numeroDeCuota - b.numeroDeCuota)
          .map(c => ({
            numeroDeCuota:    c.numeroDeCuota,
            fechaVencimiento: c.fechaVencimiento,
            montoCuota:       Number(c.montoCuota),
            montoPagado:      Number(c.montoPagado),
            montoRestante:    Number(c.montoRestante),
            estado:           c.estado,
            mora:             Number(c.mora),
            observaciones:    c.observaciones,
          })),
      };
    });

    const totalGastado  = ventas.reduce((acc, v) => acc + Number(v.precioTotal), 0);
    const ventasContado = ventas.filter(v => v.tipoVenta === 'contado').length;
    const ventasCredito = ventas.filter(v => v.tipoVenta !== 'contado').length;
    const todasLasCuotas = ventas.flatMap(v => v.cuotas ?? []);
    const moraTotal      = todasLasCuotas.reduce((acc, c) => acc + Number(c.mora), 0);

    return {
      cliente: {
        id_cliente:      cliente.id_cliente,
        nombre_completo: `${cliente.nombre_cliente} ${cliente.apellido_cliente}`,
        ci:              cliente.ci_cliente,
        celular:         cliente.celular,
        email:           cliente.email,
        ciudad:          cliente.ciudad,
        verificado:      cliente.verificado,
      },
      resumen: {
        primera_compra:  historialBase?.fecha_compra       ?? ventas[ventas.length - 1]?.fechaVenta ?? null,
        ultima_compra:   historialBase?.fecha_ultima_compra ?? ventas[0]?.fechaVenta ?? null,
        total_compras:   historialBase?.total_compras       ?? ventas.length,
        total_gastado:   totalGastado,
        ventas_contado:  ventasContado,
        ventas_credito:  ventasCredito,
        mora_total:      moraTotal,
        tiene_mora:      moraTotal > 0,
        observaciones:   historialBase?.observaciones  ?? null,
        calificacion:    historialBase?.calificacion   ?? 'N',
      },
      ventas: ventasResumen,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EDITAR OBSERVACIONES — PATCH /historial-cliente/:clienteId/observaciones
  // Solo toca el campo observaciones, no altera ningún dato de ventas/cuotas
  // ─────────────────────────────────────────────────────────────────────────
  async updateObservaciones(clienteId: number, observaciones: string) {
    let historial = await this.historialRepository.findOne({
      where: { idClienteFk: clienteId },
    });

    if (!historial) throw new NotFoundException(`No existe historial para el cliente ${clienteId}`);

    historial.observaciones = observaciones;
    await this.historialRepository.save(historial);
    return { message: 'Observaciones actualizadas', observaciones: historial.observaciones };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RECALCULAR CALIFICACIÓN — PATCH /historial-cliente/:clienteId/calificar
  //
  // Reglas automáticas basadas en el historial real de cuotas:
  //   N = nuevo / solo contado        → sin créditos registrados
  //   A = excelente                   → créditos, sin mora nunca
  //   B = bueno                       → mora total < 500 Bs o < 2 cuotas vencidas
  //   C = regular                     → mora total 500–2000 Bs o 2–4 cuotas vencidas
  //   D = malo                        → mora total > 2000 Bs o > 4 cuotas vencidas
  // ─────────────────────────────────────────────────────────────────────────
  async recalcularCalificacion(clienteId: number) {
    const historial = await this.historialRepository.findOne({
      where: { idClienteFk: clienteId },
    });
    if (!historial) throw new NotFoundException(`No existe historial para el cliente ${clienteId}`);

    const ventas = await this.ventaRepository.find({
      where: { idClienteFk: clienteId },
      relations: ['cuotas'],
    });

    const ventasCredito  = ventas.filter(v => v.tipoVenta !== 'contado');
    const todasLasCuotas = ventasCredito.flatMap(v => v.cuotas ?? []);

    // Sin créditos → calificación N
    if (todasLasCuotas.length === 0) {
      historial.calificacion = 'N';
    } else {
      const moraTotal       = todasLasCuotas.reduce((acc, c) => acc + Number(c.mora), 0);
      const cuotasVencidas  = todasLasCuotas.filter(c => c.estado === 'vencida').length;

      if (moraTotal === 0 && cuotasVencidas === 0) {
        historial.calificacion = 'A';
      } else if (moraTotal < 500 && cuotasVencidas < 2) {
        historial.calificacion = 'B';
      } else if (moraTotal < 2000 && cuotasVencidas <= 4) {
        historial.calificacion = 'C';
      } else {
        historial.calificacion = 'D';
      }
    }

    await this.historialRepository.save(historial);
    return { message: 'Calificación actualizada', calificacion: historial.calificacion };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRUD ORIGINAL
  // ─────────────────────────────────────────────────────────────────────────
  async create(dto: CreateHistorialClienteDto) {
    const clienteExiste = await this.clienteRepository.findOne({
      where: { id_cliente: dto.idClienteFk },
    });
    try {
      if (!clienteExiste)
        throw new NotFoundException(`El Cliente con ID ${dto.idClienteFk} no existe`);
      if (!clienteExiste.verificado)
        throw new BadRequestException(`El Cliente ${dto.idClienteFk} no está verificado`);
      const historial = this.historialRepository.create(dto);
      await this.historialRepository.save(historial);
      return historial;
    } catch (error) { this.manejoDBExcepciones(error); }
  }

  async findAll() {
    try {
      return await this.historialRepository.find({ order: { fecha_ultima_compra: 'DESC' } });
    } catch (error) { this.manejoDBExcepciones(error); }
  }

  async findOne(id: number) {
    const historial = await this.historialRepository.findOneBy({ id_historial: id });
    if (!historial) throw new NotFoundException(`Historial con id ${id} no encontrado`);
    return historial;
  }

  async findActiveProductsByUserId(userId: number) {
    return await this.historialRepository.find({ where: { idClienteFk: userId } });
  }

  async update(id: number, dto: UpdateHistorialClienteDto) {
    const historial = await this.historialRepository.preload({ id_historial: id, ...dto });
    if (!historial) throw new NotFoundException(`Historial con id ${id} no encontrado`);
    try {
      await this.historialRepository.save(historial);
      return historial;
    } catch (error) { this.manejoDBExcepciones(error); }
  }

  async remove(id: number) {
    const historial = await this.findOne(id);
    await this.historialRepository.remove(historial);
    return { message: `Historial con id ${id} eliminado exitosamente` };
  }

  private manejoDBExcepciones(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    if (error.status === 400)   throw new BadRequestException(error.message || 'Solicitud incorrecta');
    if (error.status === 404)   throw new NotFoundException(error.message   || 'Recurso no encontrado');
    this.logger.error(error);
    throw new InternalServerErrorException('Error inesperado, verifica los registros del Servidor');
  }
}