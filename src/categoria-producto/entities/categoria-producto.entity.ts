import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Producto } from 'src/producto/entities/producto.entity';

@Entity('categoria_producto')
export class CategoriaProducto {

    @PrimaryGeneratedColumn()
    id_categoria: number;

    @Column({
        type: 'text',
        nullable: false
    })
    nombre_categoria: string;

    // moto, accesorio, repuesto, servicio, otro
    @Column({
        type: 'text',
        nullable: false
    })
    tipo: string;

    @Column({
        type: 'text',
        nullable: true
    })
    descripcion: string;

    @Column('bool', {
        default: true
    })
    activo: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Producto, (producto) => producto.categoria, {
        cascade: true,
        eager: false
    })
    productos: Producto[];
}
