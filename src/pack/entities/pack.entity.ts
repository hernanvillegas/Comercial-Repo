import {
    Column, CreateDateColumn, Entity,
    OneToMany, PrimaryGeneratedColumn, UpdateDateColumn
} from 'typeorm';
import { PackDetalle } from './pack-detalle.entity';
import { DetalleVenta } from 'src/detalle-venta/entities/detalle-venta.entity';
import { CarritoDetalle } from 'src/carrito/entities/carrito-detalle.entity';

@Entity('pack')
export class Pack {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'text',
        nullable: false
    })
    nombre_pack: string;

    @Column({
        type: 'text',
        nullable: true
    })
    descripcion: string;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: false
    })
    precio_pack: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0
    })
    descuento_pack: number;

    @Column({
        type: 'date',
        nullable: true
    })
    vigencia_desde: Date;

    @Column({
        type: 'date',
        nullable: true
    })
    vigencia_hasta: Date;

    @Column('bool', {
        default: true
    })
    activo: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // ── Productos que incluye el pack ─────────────────────────────────────
    @OneToMany(() => PackDetalle, (detalle) => detalle.pack, {
        cascade: true,
        eager: true
    })
    items: PackDetalle[];

    // ── Relación con ventas ───────────────────────────────────────────────
    @OneToMany(() => DetalleVenta, (detalle) => detalle.pack, {
        cascade: true,
        eager: false
    })
    detallesVenta: DetalleVenta[];

    // ── Relación con carrito ──────────────────────────────────────────────
    @OneToMany(() => CarritoDetalle, (item) => item.pack, {
        cascade: true,
        eager: false
    })
    itemsCarrito: CarritoDetalle[];
}
