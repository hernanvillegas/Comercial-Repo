import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Producto } from './producto.entity';

@Entity({ name: 'producto_imagenes_nuevo' })
export class ProductoImage {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: string;

    @ManyToOne(
        () => Producto,
        (producto) => producto.images,
        { onDelete: 'CASCADE' }
    )
    producto: Producto;
}
