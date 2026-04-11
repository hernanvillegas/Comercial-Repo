import {
    Column, Entity, JoinColumn,
    ManyToOne, PrimaryGeneratedColumn
} from 'typeorm';
import { Pack } from './pack.entity';
import { Producto } from 'src/producto/entities/producto.entity';

@Entity('pack_detalle')
export class PackDetalle {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'int',
        default: 1
    })
    cantidad: number;

    // Precio original del producto (para mostrar el ahorro)
    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: false
    })
    precio_unitario_referencia: number;

    // ── FK pack ───────────────────────────────────────────────────────────
    @Column({ name: 'id_packFk' })
    idPackFk: string;

    @ManyToOne(() => Pack, (pack) => pack.items, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn({ name: 'id_packFk' })
    pack: Pack;

    // ── FK producto ───────────────────────────────────────────────────────
    @Column({ name: 'id_productoFk' })
    idProductoFk: string;

    @ManyToOne(() => Producto, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        eager: true
    })
    @JoinColumn({ name: 'id_productoFk' })
    producto: Producto;
}
