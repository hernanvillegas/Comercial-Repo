import { Cliente } from "src/cliente/entities/cliente.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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

    // @Column('bool', {
    //     name:'cumplido',
    //     default: true
    // })
    // cumplido: boolean;

    @Column({
        type: 'text',
        name: 'observaciones',
        nullable: true,
    })
    observaciones: string;

    //LLAVE FORANEA PARA CLIENTES

    // LLAVE FORANEA PARA HISTORIAL

    // Columna de clave foránea
          @Column({ name: 'id_clienteFk' ,
                nullable: false,
          })
          idClienteFk: number;


          @ManyToOne(() => Cliente, (historial) => historial.historiales, {
            onDelete: 'CASCADE',// Si se elimina el autor, se eliminan sus libros
            onUpdate: 'CASCADE'
          })
          @JoinColumn({ name: 'id_clienteFk' })
          historiales: Cliente;

           

    



}
