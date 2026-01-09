import { Garante } from "src/garante/entities/garante.entity";
import { HistorialCliente } from "src/historial_cliente/entities/historial_cliente.entity";
import { Venta } from "src/ventas/entities/venta.entity";
import { BeforeUpdate, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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


    /////////////////////////////////// ultima modificacion
    @OneToMany(() => Venta, (venta) => venta.cliente,
        {
            cascade: true, // Permite crear libros al crear un autor
            eager: false // No carga automáticamente los libros (usar relations en queries)
        })
    ventas: Venta[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    ///////////////////////////////////////

    // LLAVE FORANEA PARA LA TABLA HISTORIAL CLIENTE

    @OneToMany(() => HistorialCliente, (cliente) => cliente.historiales,
        {
            cascade: true, // Permite crear libros al crear un autor
            eager: false // No carga automáticamente los libros (usar relations en queries)
        }
    )
    historiales: HistorialCliente[];

    //  RELACION CLIENTE GARANTE (est)


    @ManyToMany(() => Garante, (garante) => garante.clientes)
    @JoinTable({
        name: 'cliente-garante',
        joinColumn: {
            name: 'cliente_fk',
        },
        inverseJoinColumn: {
            name: 'garante_fk',
        },
    }) // Solo se coloca en UNO de los lados de la relación
    garantes: Garante[];

    //     @ManyToMany(() => Curso, (curso) => curso.estudiantes)
    //   @JoinTable() // Solo se coloca en UNO de los lados de la relación
    //   cursos: Curso[];




    @BeforeUpdate()
    vacualizacion_f_registro() {
        if (this.fecha_registro) {
            this.fecha_registro = this.fecha_registro;
        }

    }


}



