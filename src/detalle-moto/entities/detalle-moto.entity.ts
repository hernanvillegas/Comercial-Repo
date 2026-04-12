import {
    Column, CreateDateColumn, Entity, JoinColumn,
    ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn
} from 'typeorm';
import { Producto } from 'src/producto/entities/producto.entity';
import { Modelo } from 'src/modelo/entities/modelo.entity';
import { EstadoMoto } from 'src/common/enums';

@Entity('detalle_moto')
export class DetalleMoto {

    @PrimaryGeneratedColumn()
    id_detalle: number;

    // Datos físicos únicos de la moto
    @Column({
        type: 'text',
        unique: true,
        nullable: false
    })
    numero_chasis: string;

    @Column({
        type: 'text',
        unique: true,
        nullable: false
    })
    numero_motor: string;

    @Column({
        type: 'int',
        nullable: false
    })
    poliza_importacion: number;

    @Column({
        type: 'text',
        nullable: false
    })
    color_moto: string;

    @Column({
        type: 'text',
        default: '2x2'
    })
    traccion: string;

    // nueva, seminueva, usada
    @Column({
        type: 'text',
        nullable: false
    })
    tipo_moto: string;

    // disponible, vendido, reservado, baja
    @Column({ 
        type: 'enum', 
        enum: EstadoMoto, 
        default: EstadoMoto.DISPONIBLE })
    estado_moto: EstadoMoto;

    @Column({
        type: 'date',
        nullable: false
    })
    fecha_ingreso: Date;

    @Column({
        type: 'date',
        nullable: true
    })
    fecha_venta: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // ── Relación 1:1 con producto ─────────────────────────────────────────
    @Column({
        name: 'id_productoFk',
        nullable: false
    })
    idProductoFk: string;

    @OneToOne(() => Producto, (producto) => producto.detalleMoto, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn({ name: 'id_productoFk' })
    producto: Producto;

    // ── Relación con modelo ───────────────────────────────────────────────
    @Column({
        name: 'id_modelo',
        nullable: true
    })
    idModelo: number;

    @ManyToOne(() => Modelo, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        eager: true
    })
    @JoinColumn({ name: 'id_modelo' })
    modelo: Modelo;
}
