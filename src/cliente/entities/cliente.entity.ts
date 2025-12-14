import { BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('clientes')
export class Cliente {

    @PrimaryGeneratedColumn()
    id_cliente: number;

    @Column({
        type: 'text',
        name: 'nombre_cliente',
        nullable: false,
        unique: false
    })
    nombre_cliente: string;

    @Column({
        type: 'text',
        name: 'apellido_cliente',
        nullable: false,
        unique: false
    })
    apellido_cliente: string;


    @Column({
        type: 'int',
        name: 'ci_cliente',
        nullable: false,
        unique: true
    })
    ci_cliente: number;

    @Column({
        name: 'fecha_nacimiento',
        // type: 'timestamp',
        type: 'date',
        default: () => 'CURRENT_TIMESTAMP'
    })
    fecha_nacimiento: Date;


    @Column({
        type: 'int',
        name: 'celular',
        nullable: false,
        unique: true
    })
    celular: number;

    @Column({
        type: 'text',
        name: 'email',
        nullable: false,
        unique: true
    })
    email: string;

    @Column({
        type: 'text',
        name: 'ciudad',
        nullable: false,
        unique: false
    })
    ciudad: string;

    @Column({
        type: 'text',
        name: 'provincia',
        nullable: false,
        unique: false
    })
    provincia: string;

    
    @Column({
        type: 'text',
        name: 'direccion',
        nullable: false,
        unique: false
    })
    direccion: string;

    
    @Column({
        type: 'text',
        name: 'ocupacion',
        nullable: false,
        unique: false
    })
    ocupacion: string;

    @Column({
        type: 'decimal',
        name: 'ingreso_mensual',
        nullable: false,
        unique: false
    })
    ingreso_mensual: number;

    
    @Column('bool', {
        default: true
    })
    verificado: boolean; 

    @Column({
        name: 'fecha_registro',
        type: 'timestamp',
        // type: 'date',
        default: () => 'CURRENT_TIMESTAMP'
    })
    fecha_registro: Date;


    @BeforeUpdate()
        vacualizacion_f_registro() {
           if (this.fecha_registro) {
                this.fecha_registro = this.fecha_registro;
            }
                
        }

    
}



