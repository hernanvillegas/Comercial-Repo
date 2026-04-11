import {
    Column, CreateDateColumn, Entity,
    JoinColumn, ManyToOne, PrimaryGeneratedColumn
} from 'typeorm';
import { Carrito } from './carrito.entity';
import { Producto } from 'src/producto/entities/producto.entity';
import { Pack } from 'src/pack/entities/pack.entity';

@Entity('carrito_detalle')
export class CarritoDetalle {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int', default: 1 })
    cantidad: number;

    // Precio fijo al momento de agregar al carrito
    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: false
    })
    precio_unitario_snapshot: number;

    @CreateDateColumn()
    createdAt: Date;

    // ── FK carrito ────────────────────────────────────────────────────────
    @Column({ name: 'id_carritoFk' })
    idCarritoFk: string;

    @ManyToOne(() => Carrito, (carrito) => carrito.items, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn({ name: 'id_carritoFk' })
    carrito: Carrito;

    // ── FK producto (opcional, puede ser pack) ────────────────────────────
    @Column({ name: 'id_productoFk', nullable: true })
    idProductoFk: string;

    @ManyToOne(() => Producto, (producto) => producto.itemsCarrito, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        eager: true,
        nullable: true
    })
    @JoinColumn({ name: 'id_productoFk' })
    producto: Producto;

    // ── FK pack (opcional) ────────────────────────────────────────────────
    @Column({ name: 'id_packFk', nullable: true })
    idPackFk: string;

    @ManyToOne(() => Pack, (pack) => pack.itemsCarrito, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        eager: true,
        nullable: true
    })
    @JoinColumn({ name: 'id_packFk' })
    pack: Pack;
}
