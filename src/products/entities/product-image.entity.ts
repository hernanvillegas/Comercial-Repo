import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity({name:'producto_imagenes '}) //nombre de la tabla
export class ProductImage{

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url:string;


    @ManyToOne(
        ()=>Product,
        (product)=>product.images,

        //para eliminar el producto en cascada
        {onDelete: 'CASCADE'}
    )
    product:Product
}

