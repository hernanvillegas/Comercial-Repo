import {
    Column, CreateDateColumn, Entity,
    JoinColumn, ManyToOne, PrimaryGeneratedColumn
} from 'typeorm';
import { Producto } from 'src/producto/entities/producto.entity';
import { Venta } from 'src/ventas/entities/venta.entity';
import { User } from 'src/auth/entities/user.entity';

@Entity('movimiento_inventario')
export class MovimientoInventario {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Positivo = entrada, negativo = salida
    @Column({ type: 'int', nullable: false })
    cantidad: number;

    // compra, venta, ajuste, devolucion, baja
    @Column({ type: 'text', nullable: false })
    tipo_movimiento: string;

    @Column({ type: 'text', nullable: true })
    observaciones: string;

    @CreateDateColumn()
    fechaMovimiento: Date;

    // ── FK producto ───────────────────────────────────────────────────────
    @Column({ name: 'id_productoFk' })
    idProductoFk: string;

    @ManyToOne(() => Producto, (producto) => producto.movimientosInventario, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        eager: true
    })
    @JoinColumn({ name: 'id_productoFk' })
    producto: Producto;

    // ── FK venta (opcional, cuando el movimiento viene de una venta) ──────
    @Column({ name: 'id_ventaFk', nullable: true })
    idVentaFk: string;

    @ManyToOne(() => Venta, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        nullable: true
    })
    @JoinColumn({ name: 'id_ventaFk' })
    venta: Venta;

    // ── FK empleado ───────────────────────────────────────────────────────
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
