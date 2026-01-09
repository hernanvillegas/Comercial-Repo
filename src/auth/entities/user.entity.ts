import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Product } from '../../products/entities';
import { Venta } from 'src/ventas/entities/venta.entity';


@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'text',
        name: 'nombre_user',
        nullable: true,  // cambiar
        unique: false
    })
    nombre_user: string;

    @Column({
        type: 'text',
        name: 'apellido_user',
        nullable: true, // cambiar
        unique: false
    })
    apellido_user: string;


    @Column({
        type: 'int',
        name: 'ci_user',
        nullable: true,//cambiar
        unique: true
    })
    ci_user: number;

    @Column({
        type: 'text',
        name: 'sucursal',
        nullable: true,// cambiar
        unique: false
    })
    sucursal: string;

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
        nullable: true, //cambiar
        unique: true
    })
    celular: number;

    @Column({
        type: 'text',
        name: 'direccion',
        nullable: true, // cambiar
        unique: false
    })
    direccion: string;

    @Column({
        name: 'fecha_ingreso',
        type: 'timestamp',
        // type: 'date',
        default: () => 'CURRENT_TIMESTAMP'
    })
    fecha_ingreso: Date;


    @Column({
        type: 'decimal',
        name: 'ingreso_mensual',
        nullable: true,//cambiar
        unique: false
    })
    ingreso_mensual: number;

    /////////////////////////////////////////////////

    @Column('text', {
        unique: true
    })
    email: string;

    @Column('text', {
        select: false
    })
    password: string;

    @Column('text')
    fullName: string;

    @Column('bool', {
        default: true
    })
    isActive: boolean;

    @Column('text', {
        array: true,
        default: ['user']
    })
    roles: string[];
    ///////////////////////////////////// ultimas modificaciones

    @OneToMany(() => Venta, (venta) => venta.empleados,
        {
            cascade: true, // Permite crear libros al crear un autor
            eager: false // No carga automáticamente los libros (usar relations en queries)
        }
    )
    ventas: Venta[];


    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
    ///////////////////////////////////////////////



    @OneToMany(
        () => Product,
        (product) => product.user
    )
    product: Product;


    @BeforeInsert() //para que el email sea minuscula JWT
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate() //para que el usuario se actualice en JWT
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();
    }



}


