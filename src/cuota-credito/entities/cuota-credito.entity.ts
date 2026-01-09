import { MovimientoCaja } from "src/movimiento-caja/entities/movimiento-caja.entity";
import { Venta } from "src/ventas/entities/venta.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity('cuotas_credito')
export class CuotaCredito {
  @PrimaryGeneratedColumn('uuid')
  idCuota: string;

  @Column({ type: 'int', nullable: false })
  numeroDeCuota: number;

  @Column({ type: 'int', nullable: false })
  faltanCuotas: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  montoCuota: number;

  @Column({ type: 'timestamp', nullable: false })
  fechaVencimiento: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  montoAcordado: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  montoPagado: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  montoRestante: number;

  @Column({ type: 'varchar', length: 20, nullable: false, default: 'pendiente' })
  estado: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  mora: number;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // RELACIONES


  @Column({ name: 'id_ventaFk' })
  idVentaFk: string;

  // Relación: modelo(cuota)=>marca(ventas)
  @ManyToOne(() => Venta, (venta) => venta.cuotas, {
    onDelete: 'CASCADE',// Si se elimina el autor, se eliminan sus libros
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'id_ventaFk' })
  ventaFk: Venta;

  @OneToMany(() => MovimientoCaja, (movimiento) => movimiento.idCuotaFk,
    {
      cascade: true, // Permite crear libros al crear un autor
      eager: false // No carga automáticamente los libros (usar relations en queries)
    }

  )
  movimientos: MovimientoCaja[];
}
