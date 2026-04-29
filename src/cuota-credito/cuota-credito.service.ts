import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCuotaCreditoDto } from './dto/create-cuota-credito.dto';
import { UpdateCuotaCreditoDto } from './dto/update-cuota-credito.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CuotaCredito } from './entities/cuota-credito.entity';
import { Repository } from 'typeorm';
import { MovimientoCaja } from 'src/movimiento-caja/entities/movimiento-caja.entity';
import { FilterCuotaCreditoDto } from './dto/filter-cuota-credito.dto';
import { PagarCuotaDto } from './dto/pagar-cuota.dto';
import { ConfigService } from '@nestjs/config';
import { PaginationDto } from 'src/common/dto/paginacion.dto';
import { EstadoCuota } from 'src/common/enums';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class CuotaCreditoService {

    constructor(
        @InjectRepository(CuotaCredito)
        private cuotasRepository: Repository<CuotaCredito>,
        @InjectRepository(MovimientoCaja)
        private movimientosRepository: Repository<MovimientoCaja>,
        private readonly configService: ConfigService,
    ) {}

    async create(createCuotaCreditoDto: CreateCuotaCreditoDto): Promise<CuotaCredito> {
        const cuota = this.cuotasRepository.create(createCuotaCreditoDto);
        return await this.cuotasRepository.save(cuota);
    }

    async findAll(paginationDto: PaginationDto): Promise<CuotaCredito[]> {
        const { limit = 20, offset = 0 } = paginationDto;
        return await this.cuotasRepository.find({
            relations: ['ventaFk', 'ventaFk.cliente', 'movimientos'],
            order: { fechaVencimiento: 'ASC' },
            take: limit,
            skip: offset,
        });
    }

    async findOne(id: string): Promise<CuotaCredito> {
        const cuota = await this.cuotasRepository.findOne({
            where: { idCuota: id },
            relations: ['ventaFk', 'ventaFk.cliente', 'movimientos']
        });

        if (!cuota)
            throw new NotFoundException(`Cuota con ID ${id} no encontrada`);

        return cuota;
    }

    async findByVenta(idVenta: string): Promise<CuotaCredito[]> {
        return await this.cuotasRepository.find({
            where: { idVentaFk: idVenta },
            relations: ['ventaFk', 'movimientos'],
            order: { numeroDeCuota: 'ASC' }
        });
    }

    async findByCliente(idCliente: string): Promise<CuotaCredito[]> {
        return await this.cuotasRepository
            .createQueryBuilder('cuota')
            .leftJoinAndSelect('cuota.ventaFk', 'venta')
            .where('venta.idClienteFk = :idCliente', { idCliente })
            .andWhere('venta.tipoVenta = :tipo', { tipo: 'credito' })
            .andWhere('venta.estadoVenta != :estado', { estado: 'anulada' })
            .orderBy('cuota.fechaVencimiento', 'ASC')
            .getMany();
    }

    async findWithFilters(filters: FilterCuotaCreditoDto): Promise<CuotaCredito[]> {
        const queryBuilder = this.cuotasRepository.createQueryBuilder('cuota')
            .leftJoinAndSelect('cuota.ventaFk', 'ventaFk')
            .leftJoinAndSelect('ventaFk.cliente', 'cliente');

        if (filters.idVentaFk)
            queryBuilder.andWhere('cuota.idVentaFk = :idVentaFk', { idVentaFk: filters.idVentaFk });

        if (filters.estado)
            queryBuilder.andWhere('cuota.estado = :estado', { estado: filters.estado });

        if (filters.vencidas) {
            const hoy = new Date();
            queryBuilder.andWhere('cuota.fechaVencimiento < :hoy', { hoy })
                .andWhere('cuota.estado = :estado', { estado: EstadoCuota.PENDIENTE });
        }

        if (filters.proximasAVencer) {
            const hoy = new Date();
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() + filters.proximasAVencer);

            queryBuilder.andWhere('cuota.fechaVencimiento BETWEEN :hoy AND :fechaLimite', { hoy, fechaLimite })
                .andWhere('cuota.estado = :estado', { estado: EstadoCuota.PENDIENTE });
        }

        queryBuilder.orderBy('cuota.fechaVencimiento', 'ASC');
        return await queryBuilder.getMany();
    }

    async update(id: string, updateCuotaCreditoDto: UpdateCuotaCreditoDto): Promise<CuotaCredito> {
        const cuota = await this.findOne(id);
        const cuotaActualizada = Object.assign(cuota, updateCuotaCreditoDto);
        return await this.cuotasRepository.save(cuotaActualizada);
    }

    async remove(id: string): Promise<void> {
        const cuota = await this.findOne(id);
        await this.cuotasRepository.remove(cuota);
    }

    async pagarCuota(id: string, pagarCuotaDto: PagarCuotaDto, user: User): Promise<{ cuota: CuotaCredito; movimiento: MovimientoCaja }> {
        const cuota = await this.cuotasRepository.findOne({
            where: { idCuota: id },
            relations: ['ventaFk']
        });

        if (!cuota)
            throw new NotFoundException(`Cuota con ID ${id} no encontrada`);

        if (cuota.estado === EstadoCuota.PAGADA)
            throw new BadRequestException('Esta cuota ya está pagada');

        const nuevoMontoPagado   = Number(cuota.montoPagado) + Number(pagarCuotaDto.montoPago);
        const nuevoMontoRestante = Number(cuota.montoAcordado) - nuevoMontoPagado;

        cuota.montoPagado   = nuevoMontoPagado;
        cuota.montoRestante = nuevoMontoRestante;

        if (nuevoMontoRestante <= 0) {
            cuota.estado        = EstadoCuota.PAGADA;
            cuota.montoRestante = 0;

            if (cuota.faltanCuotas > 1) {
                const nuevaFecha = new Date(cuota.fechaVencimiento);
                nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
                cuota.fechaVencimiento = nuevaFecha;
            }

            cuota.faltanCuotas = Math.max(0, cuota.faltanCuotas - 1);
        }

        const cuotaActualizada = await this.cuotasRepository.save(cuota);

        const movimiento = this.movimientosRepository.create({
            idCuotaFk:      cuota.idCuota,
            idVentaFk:      cuota.idVentaFk,
            montoPago:      pagarCuotaDto.montoPago,
            tipoMovimiento: 'ingreso',
            categoria:      'cobro_cuota',
            conceptoPago:   `Pago cuota ${cuota.numeroDeCuota} - Factura ${cuota.ventaFk?.numeroFactura ?? ''}`,
            metodoPago:     pagarCuotaDto.metodoPago ?? 'efectivo',
            numeroRecibo:   `REC-${Date.now()}`,
            observaciones:  pagarCuotaDto.observaciones,
            idEmpleadoFk:   user.id,
        });

        const movimientoCreado = await this.movimientosRepository.save(movimiento);

        return { cuota: cuotaActualizada, movimiento: movimientoCreado };
    }

    async calcularMora(id: string): Promise<CuotaCredito> {
        const cuota = await this.cuotasRepository.findOne({
            where: { idCuota: id },
            relations: ['ventaFk']
        });

        if (!cuota)
            throw new NotFoundException(`Cuota con ID ${id} no encontrada`);

        if (cuota.estado === EstadoCuota.PAGADA)
            return cuota;

        const hoy              = new Date();
        const fechaVencimiento = new Date(cuota.fechaVencimiento);

        if (hoy > fechaVencimiento && cuota.estado === EstadoCuota.PENDIENTE) {
            cuota.estado = EstadoCuota.VENCIDA;

            const diasMora       = Math.floor((hoy.getTime() - fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24));
            const tasaMoraDiaria = this.configService.get<number>('TASA_MORA_DIARIA') ?? 0.02;
            const mora           = Number(cuota.montoRestante) * tasaMoraDiaria * diasMora;
            cuota.mora           = Number(mora.toFixed(2));

            return await this.cuotasRepository.save(cuota);
        }

        return cuota;
    }

    async actualizarMorasMasivas(): Promise<number> {
        const cuotasPendientes = await this.cuotasRepository.find({
            where: { estado: EstadoCuota.PENDIENTE }
        });

        let actualizadas = 0;
        for (const cuota of cuotasPendientes) {
            await this.calcularMora(cuota.idCuota);
            actualizadas++;
        }

        return actualizadas;
    }

    async generarCuotasAutomaticas(
        idVenta: string,
        numeroCuotas: number,
        montoTotal: number,
        entradaInicial: number = 0
    ): Promise<CuotaCredito[]> {
        const montoAFinanciar = montoTotal - entradaInicial;
        const montoPorCuota   = montoAFinanciar / numeroCuotas;
        const cuotas: CuotaCredito[] = [];

        for (let i = 1; i <= numeroCuotas; i++) {
            const fechaVencimiento = new Date();
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);

            const cuota = this.cuotasRepository.create({
                idVentaFk:      idVenta,
                numeroDeCuota:  i,
                faltanCuotas:   numeroCuotas - i,
                montoCuota:     Number(montoPorCuota.toFixed(2)),
                fechaVencimiento,
                montoAcordado:  Number(montoPorCuota.toFixed(2)),
                montoPagado:    0,
                montoRestante:  Number(montoPorCuota.toFixed(2)),
                estado:         EstadoCuota.PENDIENTE,
                mora:           0
            });

            const cuotaCreada = await this.cuotasRepository.save(cuota);
            cuotas.push(cuotaCreada);
        }

        return cuotas;
    }
}