import {
    Column, CreateDateColumn, Entity,
    JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn
} from 'typeorm';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { CarritoDetalle } from './carrito-detalle.entity';

@Entity('carrito')
export class Carrito {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    // activo, abandonado
    @Column({
        type: 'text',
        default: 'activo'
    })
    estado: string;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP'
    })
    ultimaActividad: Date;

    @CreateDateColumn()
    createdAt: Date;

    // ── FK cliente (un carrito activo por cliente) ────────────────────────
    @Column({ name: 'id_clienteFk' })
    idClienteFk: number;

    @OneToOne(() => Cliente, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        eager: true
    })
    @JoinColumn({ name: 'id_clienteFk' })
    cliente: Cliente;

    // ── Items del carrito ─────────────────────────────────────────────────
    @OneToMany(() => CarritoDetalle, (item) => item.carrito, {
        cascade: true,
        eager: true
    })
    items: CarritoDetalle[];
}
