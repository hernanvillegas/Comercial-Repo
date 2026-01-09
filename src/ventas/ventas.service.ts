import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';
import { Repository } from 'typeorm';


@Injectable()
export class VentasService {
   
    constructor(
    @InjectRepository(Venta)
    private ventasRepository: Repository<Venta>,
  ) {}

  async create(createVentaDto: CreateVentaDto): Promise<Venta> {
    try {
      if (createVentaDto.entradaInicial && createVentaDto.entradaInicial < 1000) {
        throw new BadRequestException('La entrada inicial debe ser mayor a 1000');
      }

      const venta = this.ventasRepository.create(createVentaDto);
      return await this.ventasRepository.save(venta);

    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('El número de factura ya existe');
      }
      throw error;
    }
  }

  async findAll(): Promise<Venta[]> {
    return await this.ventasRepository.find({
      relations: ['empleado', 'producto', 'cliente', 'cuotas', 'movimientos'],
      order: { fechaVenta: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Venta> {
    const venta = await this.ventasRepository.findOne({
      where: { idVenta: id },
      relations: ['empleado', 'producto', 'cliente', 'cuotas', 'movimientos']
    });

    if (!venta) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    return venta;
  }

  async update(id: string, updateVentaDto: UpdateVentaDto): Promise<Venta> {
    if (updateVentaDto.entradaInicial && updateVentaDto.entradaInicial < 1000) {
      throw new BadRequestException('La entrada inicial debe ser mayor a 1000');
    }

    const venta = await this.findOne(id);
    
    try {
      const ventaActualizada = Object.assign(venta, updateVentaDto);
      return await this.ventasRepository.save(ventaActualizada);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('El número de factura ya existe');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const venta = await this.findOne(id);
    await this.ventasRepository.remove(venta);
  }

  async findWithFilters(filters: any): Promise<Venta[]> {
    const queryBuilder = this.ventasRepository.createQueryBuilder('venta')
      .leftJoinAndSelect('venta.empleado', 'empleado')
      .leftJoinAndSelect('venta.producto', 'producto')
      .leftJoinAndSelect('venta.cliente', 'cliente');

    if (filters.estado) {
      queryBuilder.andWhere('venta.estadoVenta = :estado', { estado: filters.estado });
    }

    if (filters.tipo) {
      queryBuilder.andWhere('venta.tipoVenta = :tipo', { tipo: filters.tipo });
    }

    if (filters.minCuotas !== undefined) {
      queryBuilder.andWhere('venta.numeroCuotas >= :minCuotas', { minCuotas: filters.minCuotas });
    }

    if (filters.maxCuotas !== undefined) {
      queryBuilder.andWhere('venta.numeroCuotas <= :maxCuotas', { maxCuotas: filters.maxCuotas });
    }

    if (filters.dias) {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - filters.dias);
      queryBuilder.andWhere('venta.fechaVenta >= :fechaLimite', { fechaLimite });
    }

    if (filters.fechaDesde) {
      queryBuilder.andWhere('venta.fechaVenta >= :fechaDesde', { fechaDesde: filters.fechaDesde });
    }

    if (filters.fechaHasta) {
      queryBuilder.andWhere('venta.fechaVenta <= :fechaHasta', { fechaHasta: filters.fechaHasta });
    }

    if (filters.precioMin !== undefined) {
      queryBuilder.andWhere('venta.precioTotal >= :precioMin', { precioMin: filters.precioMin });
    }

    if (filters.precioMax !== undefined) {
      queryBuilder.andWhere('venta.precioTotal <= :precioMax', { precioMax: filters.precioMax });
    }

    if (filters.numeroFactura) {
      queryBuilder.andWhere('venta.numeroFactura ILIKE :numeroFactura', { 
        numeroFactura: `%${filters.numeroFactura}%` 
      });
    }

    queryBuilder.orderBy('venta.fechaVenta', 'DESC');

    return await queryBuilder.getMany();
  }
//   constructor(
//     @InjectRepository(Venta)
//     private ventasRepository: Repository<Venta>,
//   ) {}
// async create(createVentaDto: CreateVentaDto): Promise<Venta> {
//     try {
//       // Validar que entradaInicial sea mayor a 1000 si se proporciona
//       if (createVentaDto.entradaInicial && createVentaDto.entradaInicial < 1000) {
//         throw new BadRequestException('La entrada inicial debe ser mayor a 1000');
//       }

//       const venta = this.ventasRepository.create(createVentaDto);
//       return await this.ventasRepository.save(venta);
//     } catch (error) {
//       if (error.code === '23505') {
//         throw new BadRequestException('El número de factura ya existe');
//       }
//       throw error;
//     }
//   }

//   async findAll(): Promise<Venta[]> {
//     return await this.ventasRepository.find({
//       order: { fechaVenta: 'DESC' }
//     });
//   }

//   async findOne(id: string): Promise<Venta> {
//     const venta = await this.ventasRepository.findOne({
//       where: { idVenta: id }
//     });

//     if (!venta) {
//       throw new NotFoundException(`Venta con ID ${id} no encontrada`);
//     }

//     return venta;
//   }

//   async update(id: string, updateVentaDto: UpdateVentaDto): Promise<Venta> {
//     // Validar que entradaInicial sea mayor a 1000 si se proporciona
//     if (updateVentaDto.entradaInicial && updateVentaDto.entradaInicial < 1000) {
//       throw new BadRequestException('La entrada inicial debe ser mayor a 1000');
//     }

//     const venta = await this.findOne(id);
    
//     try {
//       const ventaActualizada = Object.assign(venta, updateVentaDto);
//       return await this.ventasRepository.save(ventaActualizada);
//     } catch (error) {
//       if (error.code === '23505') {
//         throw new BadRequestException('El número de factura ya existe');
//       }
//       throw error;
//     }
//   }

//   async remove(id: string): Promise<void> {
//     const venta = await this.findOne(id);
//     await this.ventasRepository.remove(venta);
//   }

//   // Métodos adicionales útiles
//   async findByNumeroFactura(numeroFactura: string): Promise<Venta> {
//     const venta = await this.ventasRepository.findOne({
//       where: { numeroFactura }
//     });

//     if (!venta) {
//       throw new NotFoundException(`Venta con número de factura ${numeroFactura} no encontrada`);
//     }

//     return venta;
//   }

//   async findByEstado(estado: string): Promise<Venta[]> {
//     return await this.ventasRepository.find({
//       where: { estadoVenta: estado },
//       order: { fechaVenta: 'DESC' }
//     });
//   }

//   async findWithFilters(filters: any): Promise<Venta[]> {
//     const queryBuilder = this.ventasRepository.createQueryBuilder('venta');

//     // Filtro por estado
//     if (filters.estado) {
//       queryBuilder.andWhere('venta.estadoVenta = :estado', { estado: filters.estado });
//     }

//     // Filtro por tipo de venta
//     if (filters.tipo) {
//       queryBuilder.andWhere('venta.tipoVenta = :tipo', { tipo: filters.tipo });
//     }

//     // Filtro por número mínimo de cuotas
//     if (filters.minCuotas !== undefined) {
//       queryBuilder.andWhere('venta.numeroCuotas >= :minCuotas', { minCuotas: filters.minCuotas });
//     }

//     // Filtro por número máximo de cuotas
//     if (filters.maxCuotas !== undefined) {
//       queryBuilder.andWhere('venta.numeroCuotas <= :maxCuotas', { maxCuotas: filters.maxCuotas });
//     }

//     // Filtro por últimos N días
//     if (filters.dias) {
//       const fechaLimite = new Date();
//       fechaLimite.setDate(fechaLimite.getDate() - filters.dias);
//       queryBuilder.andWhere('venta.fechaVenta >= :fechaLimite', { fechaLimite });
//     }

//     // Filtro por rango de fechas
//     if (filters.fechaDesde) {
//       queryBuilder.andWhere('venta.fechaVenta >= :fechaDesde', { fechaDesde: filters.fechaDesde });
//     }

//     if (filters.fechaHasta) {
//       queryBuilder.andWhere('venta.fechaVenta <= :fechaHasta', { fechaHasta: filters.fechaHasta });
//     }

//     // Filtro por precio mínimo
//     if (filters.precioMin !== undefined) {
//       queryBuilder.andWhere('venta.precioTotal >= :precioMin', { precioMin: filters.precioMin });
//     }

//     // Filtro por precio máximo
//     if (filters.precioMax !== undefined) {
//       queryBuilder.andWhere('venta.precioTotal <= :precioMax', { precioMax: filters.precioMax });
//     }

//     // Filtro por número de factura (búsqueda parcial)
//     if (filters.numeroFactura) {
//       queryBuilder.andWhere('venta.numeroFactura ILIKE :numeroFactura', { 
//         numeroFactura: `%${filters.numeroFactura}%` 
//       });
//     }

//     // Ordenar por fecha de venta descendente
//     queryBuilder.orderBy('venta.fechaVenta', 'DESC');

//     return await queryBuilder.getMany();
//   }
}
