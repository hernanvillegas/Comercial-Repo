import {
    BeforeInsert, BeforeUpdate, Column, CreateDateColumn,
    Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn
} from 'typeorm';
import { Producto } from 'src/producto/entities/producto.entity';
import { Venta } from 'src/ventas/entities/venta.entity';

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text', name: 'nombre_user', nullable: true, unique: false })
    nombre_user: string;

    @Column({ type: 'text', name: 'apellido_user', nullable: true, unique: false })
    apellido_user: string;

    @Column({ type: 'int', name: 'ci_user', nullable: true, unique: true })
    ci_user: number;

    @Column({ type: 'text', name: 'sucursal', nullable: true, unique: false })
    sucursal: string;

    @Column({ name: 'fecha_nacimiento', type: 'date' })
    fecha_nacimiento: Date;

    @Column({ type: 'int', name: 'celular', nullable: true, unique: true })
    celular: number;

    @Column({ type: 'text', name: 'direccion', nullable: true, unique: false })
    direccion: string;

    @Column({ name: 'fecha_ingreso', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha_ingreso: Date;

    @Column({ type: 'decimal', name: 'ingreso_mensual', nullable: true, unique: false })
    ingreso_mensual: number;

    @Column('text', { unique: true })
    email: string;

    @Column('text', { select: false })
    password: string;

    @Column('text')
    fullName: string;

    @Column('bool', { default: true })
    isActive: boolean;

    @Column('text', { array: true, default: ['user'] })
    roles: string[];

    // ── Ventas realizadas (sin cambios) ───────────────────────────────────
    @OneToMany(() => Venta, (venta) => venta.empleados, {
        cascade: true,
        eager: false
    })
    ventas: Venta[];

    
    // ── NUEVO: relación con tabla producto unificada ───────────────────────
    @OneToMany(() => Producto, (producto) => producto.user)
    productos: Producto[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();
    }
}
