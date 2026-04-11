import { Cliente } from "src/cliente/entities/cliente.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('historial')
export class HistorialCliente {

    @PrimaryGeneratedColumn()
    id_historial: number;

    @Column({
        name: 'fecha_compra',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP'
    })
    fecha_compra: Date;

    @Column({
        name: 'fecha_ultima_compra',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP'
    })
    fecha_ultima_compra: Date;

    @Column({
        type: 'int',
        name: 'total_compras',
        nullable: true,
        default: 1
    })
    total_compras: number;

    @Column({
        type: 'text',
        name: 'observaciones',
        nullable: true,
    })
    observaciones: string;

    // A  = excelente (nunca tuvo mora)
    // B  = bueno     (mora menor a 30 días alguna vez)
    // C  = regular   (mora entre 30 y 90 días)
    // D  = malo      (mora mayor a 90 días o más de 2 cuotas vencidas a la vez)
    // N  = nuevo     (solo contado, sin historial crediticio)
    @Column({
        type: 'varchar',
        length: 1,
        name: 'calificacion',
        nullable: true,
        default: 'N'
    })
    calificacion: string;

    @Column({ name: 'id_clienteFk', nullable: false })
    idClienteFk: number;

    @ManyToOne(() => Cliente, (historial) => historial.historiales, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn({ name: 'id_clienteFk' })
    historiales: Cliente;
}