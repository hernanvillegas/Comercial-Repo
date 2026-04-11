import { CuotaCredito } from 'src/cuota-credito/entities/cuota-credito.entity';
import { Pago } from 'src/pagos/entities/pago.entity';
import { User } from 'src/auth/entities/user.entity';
import { Venta } from 'src/ventas/entities/venta.entity';
import {
    Column, CreateDateColumn, Entity,
    JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn
} from 'typeorm';

@Entity('movimientos_caja')
export class MovimientoCaja {

    @PrimaryGeneratedColumn('uuid')
    idMovimiento: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: false })
    fechaPago: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    montoPago: number;

    // ingreso, egreso
    @Column({ type: 'varchar', nullable: false })
    tipoMovimiento: string;

    // NUEVO: venta_contado, cobro_cuota, entrada_inicial,
    //        gasto_operativo, gasto_proveedor, devolucion, ajuste, otro
    @Column({ type: 'varchar', nullable: false })
    categoria: string;

    @Column({ type: 'text', nullable: false })
    conceptoPago: string;

    @Column({ type: 'varchar', nullable: false })
    metodoPago: string;

    @Column({ type: 'varchar', nullable: true })
    numeroRecibo: string;

    @Column({ type: 'text', nullable: true })
    sucursal: string;

    @Column({ type: 'text', nullable: true })
    observaciones: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // ── FK venta (igual que antes) ────────────────────────────────────────
    @ManyToOne(() => Venta, (venta) => venta.movimientos, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn({ name: 'id_ventaFk' })
    idventaFk: Venta[];

    @Column({ name: 'id_ventaFk', nullable: true })
    idVentaFk: string;

    // ── FK cuota (igual que antes) ────────────────────────────────────────
    @ManyToOne(() => CuotaCredito, (cuota) => cuota.movimientos, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn({ name: 'id_cuotaFk' })
    idcuotaFk: CuotaCredito[];

    @Column({ name: 'id_cuotaFk', nullable: true })
    idCuotaFk: string;

    // ── NUEVO: FK pago que originó este movimiento ────────────────────────
    @Column({ name: 'id_pagoFk', nullable: true })
    idPagoFk: string;

    @ManyToOne(() => Pago, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        nullable: true
    })
    @JoinColumn({ name: 'id_pagoFk' })
    pago: Pago;

    // ── NUEVO: FK empleado responsable ────────────────────────────────────
    @Column({ name: 'id_empleadoFk', nullable: true })
    idEmpleadoFk: string;

    @ManyToOne(() => User, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        nullable: true,
        eager: true
    })
    @JoinColumn({ name: 'id_empleadoFk' })
    empleado: User;
}
