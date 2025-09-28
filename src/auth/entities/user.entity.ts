import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities';


@Entity('users')
export class User {
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

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
    



    @OneToMany(
        () => Product,
        ( product ) => product.user
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


