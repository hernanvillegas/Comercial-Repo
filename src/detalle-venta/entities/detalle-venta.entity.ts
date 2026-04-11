import {
    Column, CreateDateColumn, Entity,
    JoinColumn, ManyToOne, PrimaryGeneratedColumn
} from 'typeorm';
import { Venta } from 'src/ventas/entities/venta.entity';
import { Producto } from 'src/producto/entities/producto.entity';
import { Pack } from 'src/pack/entities/pack.entity';

@Entity('detalle_venta')
export class DetalleVenta {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'int',
        default: 1
    })
    cantidad: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: false
    })
    precio_unitario: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0
    })
    descuento: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: false
    })
    subtotal: number;

    // Snapshot del nombre al momento de vender (para auditoría)
    @Column({
        type: 'text',
        nullable: false
    })
    nombre_producto_snapshot: string;

    @CreateDateColumn()
    createdAt: Date;

    // ── FK venta ──────────────────────────────────────────────────────────
    @Column({ name: 'id_ventaFk' })
    idVentaFk: string;

    @ManyToOne(() => Venta, (venta) => venta.detalles, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn({ name: 'id_ventaFk' })
    venta: Venta;

    // ── FK producto (opcional, puede ser pack) ────────────────────────────
    @Column({ name: 'id_productoFk', nullable: true })
    idProductoFk: string | null;

    @ManyToOne(() => Producto, (producto) => producto.detallesVenta, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        eager: true,
        nullable: true
    })
    @JoinColumn({ name: 'id_productoFk' })
    producto: Producto;

    // ── FK pack (opcional, puede ser producto suelto) ─────────────────────
    @Column({ name: 'id_packFk', nullable: true })
    idPackFk: string | null;

    @ManyToOne(() => Pack, (pack) => pack.detallesVenta, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        eager: true,
        nullable: true
    })
    @JoinColumn({ name: 'id_packFk' })
    pack: Pack;
}
