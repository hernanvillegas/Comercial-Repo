import { User } from 'src/auth/entities/user.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { CuotaCredito } from 'src/cuota-credito/entities/cuota-credito.entity';
import { DetalleVenta } from 'src/detalle-venta/entities/detalle-venta.entity';
import { MovimientoCaja } from 'src/movimiento-caja/entities/movimiento-caja.entity';
import { Pago } from 'src/pagos/entities/pago.entity';
import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, UpdateDateColumn,
    ManyToOne, JoinColumn, OneToMany
} from 'typeorm';

@Entity('ventas')
export class Venta {

    @PrimaryGeneratedColumn('uuid')
    idVenta: string;

    @Column({ type: 'varchar', unique: true, nullable: false })
    numeroFactura: string;

    @Column({ type: 'varchar', nullable: false })
    tipoVenta: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: false })
    fechaVenta: Date;

    // Subtotal antes de descuento global
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    subtotal: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    descuento: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    precioTotal: number;

    @Column({ type: 'varchar', nullable: false })
    estadoVenta: string;

    @Column({ type: 'int', nullable: true })
    numeroCuotas: number | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    entradaInicial: number | null;

    // ── Relación con empleado ─────────────────────────────────────────────
    @ManyToOne(() => User, (empleado) => empleado.ventas, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn({ name: 'id_empleadoFk' })
    empleados: User;

    @Column({ name: 'id_empleadoFk' })
    idEmpleadoFk: string;

    // ── Relación con cliente ──────────────────────────────────────────────
    @ManyToOne(() => Cliente, (cliente) => cliente.ventas, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn({ name: 'id_clienteFk' })
    cliente: Cliente;

    @Column({ name: 'id_clienteFk' })
    idClienteFk: number;

    // ── NUEVO: líneas de la venta ─────────────────────────────────────────
    @OneToMany(() => DetalleVenta, (detalle) => detalle.venta, {
        cascade: true,
        eager: false
    })
    detalles: DetalleVenta[];

    // ── Cuotas (sin cambios) ──────────────────────────────────────────────
    @OneToMany(() => CuotaCredito, (cuota) => cuota.ventaFk, {
        cascade: true,
        eager: false
    })
    cuotas: CuotaCredito[];

    // ── Movimientos de caja (sin cambios) ─────────────────────────────────
    @OneToMany(() => MovimientoCaja, (movimiento) => movimiento.idventaFk, {
        cascade: true,
        eager: false
    })
    movimientos: MovimientoCaja[];

    // ── NUEVO: pagos registrados para esta venta ──────────────────────────
    @OneToMany(() => Pago, (pago) => pago.venta, {
        cascade: true,
        eager: false
    })
    pagos: Pago[];

    @Column({ type: 'text', nullable: true })
    observaciones: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
