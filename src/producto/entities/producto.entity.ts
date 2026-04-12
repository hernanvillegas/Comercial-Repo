import {
    BeforeInsert, BeforeUpdate, Column, CreateDateColumn,
    Entity, JoinColumn, ManyToOne, OneToMany,
    PrimaryGeneratedColumn, UpdateDateColumn
} from 'typeorm';
import { ProductoImage } from './producto-image.entity';
import { User } from 'src/auth/entities/user.entity';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';
import { CategoriaProducto } from 'src/categoria-producto/entities/categoria-producto.entity';
import { DetalleMoto } from 'src/detalle-moto/entities/detalle-moto.entity';
import { DetalleVenta } from 'src/detalle-venta/entities/detalle-venta.entity';
import { MovimientoInventario } from 'src/movimiento-inventario/entities/movimiento-inventario.entity';
import { CarritoDetalle } from 'src/carrito/entities/carrito-detalle.entity';
import { TipoProducto } from 'src/common/enums';

@Entity('producto')
export class Producto {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text', nullable: false })
    nombre_producto: string;

    @Column({ type: 'text', unique: true, nullable: false })
    codigo_producto: string;

    // moto, accesorio, repuesto, servicio, otro
    @Column({ type: 'enum', enum: TipoProducto, nullable: false })
    tipo_producto: TipoProducto;

    @Column('float', { default: 0 })
    precio_compra: number;

    @Column('float', { default: 0 })
    precio_venta: number;

    // NULL para servicios (no tienen inventario físico)
    @Column({ type: 'int', default: 0, nullable: true })
    stock: number;

    @Column({ type: 'int', default: 1, nullable: true })
    stock_minimo: number;

    @Column({ type: 'boolean', default: true })
    disponible: boolean;

    @Column({ type: 'text', nullable: true })
    gender: string;

    @Column({ type: 'text', nullable: false })
    descripcion: string;

    @Column('text', { unique: true })
    slug: string;

    @Column('text', { array: true, default: [] })
    etiquetas: string[];

    // ── Imágenes propias (tabla producto_imagenes_nuevo) ──────────────────
    @OneToMany(
        () => ProductoImage,
        (img) => img.producto,
        { cascade: true, eager: true }
    )
    images?: ProductoImage[];

    // ── Relación con detalle_moto (solo tipo moto) ────────────────────────
    @OneToMany(() => DetalleMoto, (detalle) => detalle.producto, {
        cascade: true, eager: false
    })
    detalleMoto: DetalleMoto[];

    // ── Relación con detalle_venta ────────────────────────────────────────
    @OneToMany(() => DetalleVenta, (detalle) => detalle.producto, {
        cascade: true, eager: false
    })
    detallesVenta: DetalleVenta[];

    // ── Relación con movimiento de inventario ─────────────────────────────
    @OneToMany(() => MovimientoInventario, (mov) => mov.producto, {
        cascade: true, eager: false
    })
    movimientosInventario: MovimientoInventario[];

    // ── Relación con carrito ──────────────────────────────────────────────
    @OneToMany(() => CarritoDetalle, (item) => item.producto, {
        cascade: true, eager: false
    })
    itemsCarrito: CarritoDetalle[];

    // ── FK usuario ────────────────────────────────────────────────────────
    @ManyToOne(() => User, (user) => user.productos, { eager: true })
    user: User;

    // ── FK proveedor ──────────────────────────────────────────────────────
    @Column({ name: 'id_proveedor', nullable: true })
    idProveedor: number;

    @ManyToOne(() => Proveedor, (proveedor) => proveedor.productos, {
        onDelete: 'CASCADE', onUpdate: 'CASCADE'
    })
    @JoinColumn({ name: 'id_proveedor' })
    proveedor: Proveedor;

    

    // ── FK categoría ──────────────────────────────────────────────────────
    @Column({ name: 'id_categoria', nullable: true })
    idCategoria: number;

    @ManyToOne(() => CategoriaProducto, (cat) => cat.productos, {
        onDelete: 'SET NULL', onUpdate: 'CASCADE', eager: true
    })
    @JoinColumn({ name: 'id_categoria' })
    categoria: CategoriaProducto;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // ── Hooks ─────────────────────────────────────────────────────────────
    @BeforeInsert()
    verificarInsercion_Slug() {
        if (!this.slug) this.slug = this.nombre_producto;
        this.slug = this.slug
            .toLocaleLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '');
    }

    @BeforeUpdate()
    verificarActualizacion_Slug() {
        this.slug = this.nombre_producto
            .toLocaleLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '');
    }

    @BeforeInsert()
    verificarInsercion_descripcion() {
        if (!this.descripcion) {
            this.descripcion = `${this.tipo_producto} - ${this.nombre_producto}`.toLocaleLowerCase();
        }
        this.descripcion = this.descripcion.toLocaleLowerCase();
    }
}
