import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Producto } from "src/producto/entities/producto.entity";

@Entity('proveedor')
export class Proveedor {

    @PrimaryGeneratedColumn()
    id_proveedor: number;

    @Column({ type: 'text', nullable: false, unique: true })
    cod_proveedor: string;

    @Column({ type: 'text', nullable: false, unique: true })
    nombre_proveedor: string;

    @Column({ type: 'text', nullable: true, unique: false })
    tipo_proveedor: string;

    @Column({ type: 'text', nullable: false, unique: true })
    cel_proveedor: string;

    @Column({ type: 'text', nullable: false, unique: true })
    email_proveedor: string;

    @Column({ type: 'text', nullable: false, unique: false })
    direccion_proveedor: string;

    @Column({ type: 'text', nullable: true, unique: false })
    razon_social: string;

    @Column('bool', { default: true })
    activo: boolean;

    @Column({ name: 'fecha_registro', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha_registro_prov: Date;

    @OneToMany(() => Producto, (producto) => producto.proveedor)
    productos: Producto[];

    @BeforeInsert()
    verificarInsercion_fecha_ingreso_prov() {
        if (!this.fecha_registro_prov) {
            this.fecha_registro_prov = new Date();
        }
    }
}