import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from './entities/pago.entity';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';

@Injectable()
export class PagosService {

    private readonly logger = new Logger('PagosService');

    constructor(
        @InjectRepository(Pago)
        private readonly pagoRepository: Repository<Pago>,
    ) {}

    async create(createPagoDto: CreatePagoDto) {
        if (!createPagoDto.idVentaFk && !createPagoDto.idCuotaFk) {
            throw new BadRequestException('Debe especificar idVentaFk o idCuotaFk');
        }

        try {
            const pago = this.pagoRepository.create(createPagoDto);
            return await this.pagoRepository.save(pago);
        } catch (error) {
            this.manejoDBExcepciones(error);
        }
    }

    async findAll() {
        return await this.pagoRepository.find({
            relations: ['venta', 'cuota', 'empleado', 'venta.cliente'],
            order: { fechaPago: 'DESC' }
        });
    }

    async findOne(id: string) {
        const pago = await this.pagoRepository.findOne({
            where: { idPago: id },
            relations: ['venta', 'cuota', 'empleado', 'venta.cliente']
        });

        if (!pago)
            throw new NotFoundException(`Pago con ID ${id} no encontrado`);

        return pago;
    }

    async findByVenta(idVenta: string) {
        return await this.pagoRepository.find({
            where: { idVentaFk: idVenta },
            relations: ['cuota', 'empleado'],
            order: { fechaPago: 'DESC' }
        });
    }

    async findByCuota(idCuota: string) {
        return await this.pagoRepository.find({
            where: { idCuotaFk: idCuota },
            relations: ['venta', 'empleado'],
            order: { fechaPago: 'DESC' }
        });
    }

    async findWithFilters(filters: any) {
        const queryBuilder = this.pagoRepository.createQueryBuilder('pago')
            .leftJoinAndSelect('pago.venta', 'venta')
            .leftJoinAndSelect('pago.cuota', 'cuota')
            .leftJoinAndSelect('pago.empleado', 'empleado')
            .leftJoinAndSelect('venta.cliente', 'cliente');

        if (filters.tipoPago) {
            queryBuilder.andWhere('pago.tipoPago = :tipoPago', { tipoPago: filters.tipoPago });
        }

        if (filters.metodoPago) {
            queryBuilder.andWhere('pago.metodoPago = :metodoPago', { metodoPago: filters.metodoPago });
        }

        if (filters.fechaDesde) {
            queryBuilder.andWhere('pago.fechaPago >= :fechaDesde', { fechaDesde: filters.fechaDesde });
        }

        if (filters.fechaHasta) {
            queryBuilder.andWhere('pago.fechaPago <= :fechaHasta', { fechaHasta: filters.fechaHasta });
        }

        queryBuilder.orderBy('pago.fechaPago', 'DESC');

        return await queryBuilder.getMany();
    }

    async obtenerResumenPorMetodo(fechaDesde?: Date, fechaHasta?: Date) {
        const queryBuilder = this.pagoRepository.createQueryBuilder('pago')
            .select('pago.metodoPago', 'metodoPago')
            .addSelect('SUM(pago.montoPago)', 'total')
            .addSelect('COUNT(pago.idPago)', 'cantidad');

        if (fechaDesde) {
            queryBuilder.andWhere('pago.fechaPago >= :fechaDesde', { fechaDesde });
        }

        if (fechaHasta) {
            queryBuilder.andWhere('pago.fechaPago <= :fechaHasta', { fechaHasta });
        }

        return await queryBuilder
            .groupBy('pago.metodoPago')
            .getRawMany();
    }

    async update(id: string, updatePagoDto: UpdatePagoDto) {
        const pago = await this.findOne(id);

        try {
            const pagoActualizado = Object.assign(pago, updatePagoDto);
            return await this.pagoRepository.save(pagoActualizado);
        } catch (error) {
            this.manejoDBExcepciones(error);
        }
    }

    async remove(id: string) {
        const pago = await this.findOne(id);
        await this.pagoRepository.remove(pago);
    }

    private manejoDBExcepciones(error: any) {
        if (error.code === '23505')
            throw new BadRequestException(error.detail);

        if (error.status === 400)
            throw new BadRequestException(error.message || 'Solicitud incorrecta');

        if (error.status === 404)
            throw new NotFoundException(error.message || 'Recurso no encontrado');

        this.logger.error(error);
        throw new InternalServerErrorException('Error inesperado, verifica los registros del Servidor');
    }
}
