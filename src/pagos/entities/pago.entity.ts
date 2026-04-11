import {
    Column, CreateDateColumn, Entity,
    JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn
} from 'typeorm';
import { Venta } from 'src/ventas/entities/venta.entity';
import { CuotaCredito } from 'src/cuota-credito/entities/cuota-credito.entity';
import { User } from 'src/auth/entities/user.entity';

@Entity('pagos')
export class Pago {

    @PrimaryGeneratedColumn('uuid')
    idPago: string;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        nullable: false
    })
    fechaPago: Date;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: false
    })
    montoPago: number;

    // entrada_inicial, cuota, pago_contado, pago_parcial, pago_servicio, otro
    @Column({ type: 'varchar', nullable: false })
    tipoPago: string;

    // efectivo, transferencia, tarjeta, qr, cheque, mixto
    @Column({ type: 'varchar', nullable: false })
    metodoPago: string;

    @Column({ type: 'varchar', nullable: false, unique: true })
    numeroRecibo: string;

    @Column({ type: 'text', nullable: true })
    observaciones: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // ── FK venta (opcional según tipo de pago) ────────────────────────────
    @Column({ name: 'id_ventaFk', nullable: true })
    idVentaFk: string;

    @ManyToOne(() => Venta, (venta) => venta.pagos, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        nullable: true
    })
    @JoinColumn({ name: 'id_ventaFk' })
    venta: Venta;

    // ── FK cuota (opcional, solo para créditos) ───────────────────────────
    @Column({ name: 'id_cuotaFk', nullable: true })
    idCuotaFk: string;

    @ManyToOne(() => CuotaCredito, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        nullable: true
    })
    @JoinColumn({ name: 'id_cuotaFk' })
    cuota: CuotaCredito;

    // ── FK empleado que registra el pago ──────────────────────────────────
    @Column({ name: 'id_empleadoFk' })
    idEmpleadoFk: string;

    @ManyToOne(() => User, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        eager: true
    })
    @JoinColumn({ name: 'id_empleadoFk' })
    empleado: User;
}
