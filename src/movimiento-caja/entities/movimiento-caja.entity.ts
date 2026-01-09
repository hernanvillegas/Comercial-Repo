import { CuotaCredito } from "src/cuota-credito/entities/cuota-credito.entity";
import { Venta } from "src/ventas/entities/venta.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity('movimientos_caja')
export class MovimientoCaja {
     @PrimaryGeneratedColumn('uuid')
  idMovimiento: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: false })
  fechaPago: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  montoPago: number;

  @Column({ type: 'varchar',  nullable: false })
  tipoMovimiento: string;

  @Column({ type: 'text', nullable: false })
  conceptoPago: string;

  @Column({ type: 'varchar', nullable: false })
  metodoPago: string;

  @Column({ type: 'varchar', nullable: false })
  numeroRecibo: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

   //relaciones

  @ManyToOne(() => Venta, (venta) => venta.movimientos, { 
    onDelete: 'CASCADE',// Si se elimina el autor, se eliminan sus libros
      onUpdate: 'CASCADE'
   })
  @JoinColumn({ name: 'id_ventaFk' })
  idventaFk: Venta[];

  @Column({ name:'id_ventaFk' })
  idVentaFk: string;

///////////////////////////////////////

  @ManyToOne(() => CuotaCredito, (cuota) => cuota.movimientos,{
    onDelete: 'CASCADE',// Si se elimina el autor, se eliminan sus libros
      onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'id_cuotaFk' })
  idcuotaFk: CuotaCredito[];

  @Column({ name:'id_cuotaFk' })
  idCuotaFk: string;

}
