import { User } from 'src/auth/entities/user.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { CuotaCredito } from 'src/cuota-credito/entities/cuota-credito.entity';
import { MovimientoCaja } from 'src/movimiento-caja/entities/movimiento-caja.entity';
import { Product } from 'src/products/entities';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';


@Entity('ventas')
export class Venta {
    @PrimaryGeneratedColumn('uuid')
    idVenta: string;

    @Column({ type: 'varchar',  unique: true, nullable: false })
    numeroFactura: string;

    @Column({ type: 'varchar',  nullable: false })
    tipoVenta: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: false })
    fechaVenta: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    precioVenta: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    descuento: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    precioTotal: number;

    @Column({ type: 'varchar', nullable: false })
    estadoVenta: string;

    @Column({ type: 'int', nullable: true })
    numeroCuotas: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    entradaInicial: number;
    // RELACIONES CON LA TABLA DE EMPLEADOS (USER)

    @ManyToOne(() => User, (empleado) => empleado.ventas, {
        onDelete: 'CASCADE',// Si se elimina el autor, se eliminan sus libros
        onUpdate: 'CASCADE'
    })
    @JoinColumn({ name: 'id_empleadoFk' })
    empleados: User;

    @Column({ name: 'id_empleadoFk' })
    idEmpleadoFk: string;
    //////////////////////////////////////////////////////////////////////////////

    @ManyToOne(() => Product, (producto) => producto.ventas, {
        onDelete: 'CASCADE',// Si se elimina el autor, se eliminan sus libros
        onUpdate: 'CASCADE'
    })
    @JoinColumn({ name: 'id_productFk' })
    producto: Product;

    @Column({ name: 'id_productFk' })
    idProductoFk: string;

    //////////////////////////////////////////////////////////////////////////

    @ManyToOne(() => Cliente, (cliente) => cliente.ventas, {
        onDelete: 'CASCADE',// Si se elimina el autor, se eliminan sus libros
        onUpdate: 'CASCADE'
    }

    )
    @JoinColumn({ name: 'id_clienteFk' })
    cliente: Cliente;

    @Column({ name: 'id_clienteFk' })
    idClienteFk: number;

    /////////////////////////////////////////////////////////////////////////


    @OneToMany(() => CuotaCredito, (cuota) => cuota.ventaFk,
        {
            cascade: true, // Permite crear libros al crear un autor
            eager: false // No carga automáticamente los libros (usar relations en queries)
        }

    )
    cuotas: CuotaCredito[];

    ///////////////////////////////////////


    @OneToMany(() => MovimientoCaja, (movimiento) => movimiento.idVentaFk,
        {
            cascade: true, // Permite crear libros al crear un autor
            eager: false // No carga automáticamente los libros (usar relations en queries)
        }

    )
    movimientos: MovimientoCaja[];

    ///////////////////////////////////////////////

    @Column({
        type: 'text',
        unique: false,
        nullable: true
    })
    observaciones: string;

    @CreateDateColumn()
    createdAt: Date; // fecha creacion de la venta

    @UpdateDateColumn()
    updatedAt: Date; // fecha de ultima modificacion de la venta

}

