import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovimientoCajaDto } from './dto/create-movimiento-caja.dto';
import { UpdateMovimientoCajaDto } from './dto/update-movimiento-caja.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MovimientoCaja } from './entities/movimiento-caja.entity';
import { Between, Repository } from 'typeorm';
import { FilterMovimientoCajaDto } from './dto/filter-movimiento-caja.dto';

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

  async findAll(): Promise<MovimientoCaja[]> {
    return await this.movimientosRepository.find({
      relations: ['venta', 'cuota', 'venta.cliente'],
      order: { fechaPago: 'DESC' }
    });
  }

  async findOne(id: string): Promise<MovimientoCaja> {
    const movimiento = await this.movimientosRepository.findOne({
      where: { idMovimiento: id },
      relations: ['venta', 'cuota', 'venta.cliente']
    });

    if (!movimiento) {
      throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
    }

    return movimiento;
  }

  async findWithFilters(filters: FilterMovimientoCajaDto): Promise<MovimientoCaja[]> {
    const queryBuilder = this.movimientosRepository.createQueryBuilder('movimiento')
      .leftJoinAndSelect('movimiento.venta', 'venta')
      .leftJoinAndSelect('movimiento.cuota', 'cuota')
      .leftJoinAndSelect('venta.cliente', 'cliente');

    if (filters.idVentaFk) {
      queryBuilder.andWhere('movimiento.idVentaFk = :idVentaFk', { idVentaFk: filters.idVentaFk });
    }

    if (filters.idCuotaFk) {
      queryBuilder.andWhere('movimiento.idCuotaFk = :idCuotaFk', { idCuotaFk: filters.idCuotaFk });
    }

    if (filters.tipoMovimiento) {
      queryBuilder.andWhere('movimiento.tipoMovimiento = :tipoMovimiento', { tipoMovimiento: filters.tipoMovimiento });
    }

    if (filters.metodoPago) {
      queryBuilder.andWhere('movimiento.metodoPago = :metodoPago', { metodoPago: filters.metodoPago });
    }

    if (filters.fechaPago) {
      const fecha = new Date(filters.fechaPago);
      const fechaInicio = new Date(fecha.setHours(0, 0, 0, 0));
      const fechaFin = new Date(fecha.setHours(23, 59, 59, 999));
      queryBuilder.andWhere('movimiento.fechaPago BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin });
    }

    if (filters.fechaDesde && filters.fechaHasta) {
      queryBuilder.andWhere('movimiento.fechaPago BETWEEN :fechaDesde AND :fechaHasta', {
        fechaDesde: filters.fechaDesde,
        fechaHasta: filters.fechaHasta
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
      where: { idVentaFk: idVenta },
      relations: ['cuota'],
      order: { fechaPago: 'DESC' }
    });
  }

  async findByCuota(idCuota: string): Promise<MovimientoCaja[]> {
    return await this.movimientosRepository.find({
      where: { idCuotaFk: idCuota },
      order: { fechaPago: 'DESC' }
    });
  }

  async update(id: string, updateMovimientoCajaDto: UpdateMovimientoCajaDto): Promise<MovimientoCaja> {
    const movimiento = await this.findOne(id);
    const movimientoActualizado = Object.assign(movimiento, updateMovimientoCajaDto);
    return await this.movimientosRepository.save(movimientoActualizado);
  }

  async remove(id: string): Promise<void> {
    const movimiento = await this.findOne(id);
    await this.movimientosRepository.remove(movimiento);
  }

  async obtenerResumenDiario(fecha: Date = new Date()): Promise<any> {
    const fechaInicio = new Date(fecha.setHours(0, 0, 0, 0));
    const fechaFin = new Date(fecha.setHours(23, 59, 59, 999));

    const movimientos = await this.movimientosRepository.find({
      where: { fechaPago: Between(fechaInicio, fechaFin) }
    });

    const resumen = {
      totalDelDia: 0,
      efectivo: 0,
      transferencia: 0,
      tarjeta: 0,
      ventas: 0,
      creditos: 0
    };

    movimientos.forEach(mov => {
      const monto = Number(mov.montoPago);
      resumen.totalDelDia += monto;

      if (mov.metodoPago === 'efectivo') resumen.efectivo += monto;
      if (mov.metodoPago === 'transferencia') resumen.transferencia += monto;
      if (mov.metodoPago === 'tarjeta') resumen.tarjeta += monto;

      if (mov.tipoMovimiento === 'ventas') resumen.ventas += monto;
      if (mov.tipoMovimiento === 'credito') resumen.creditos += monto;
    });

    return resumen;
  }
}
