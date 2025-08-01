import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./";


@Entity({name:'producto_motos '})
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column({
        type: 'text',
        unique: true,
        nullable: false
    })
    titulo_moto: string;

    @Column({
        type: 'text',
        unique: true,
        nullable: false
    })
    codigo_moto: string;

    @Column({
        type: 'int',
        unique: true,
        nullable: false
    })
    poliza_importacion: number;

    @Column({
        type: 'text',
        unique: true,
        nullable: false
    })
    numero_chasis: string;

    @Column({
        type: 'text',
        unique: true,
        nullable: false
    })
    numero_motor: string;

    @Column({
        type: 'text',
        nullable: false
    })
    color_moto: string; //negra, rojo, azul,etc

    @Column({
        type: 'int',
        default: 0
    })
    cantidad_moto: number;

    @Column({
        type: 'text',
    })
    tipo_moto: string; // nueva, seminueva, usada

    @Column('float', {
        default: 0,
    })
    precio_compra: number;

    @Column('float', {
        default: 0,
    })
    precio_venta: number;

    @Column({
        type: 'text',
    })
    estado_moto: string; //vendida, disponible, reservada, en mantenimiento

    @Column({
        type: 'date',
    })
    fecha_ingreso: Date;

    @Column({
        type: 'date',
    })
    fecha_venta: Date;

    @Column({
        type: 'text',
    })
    genero_moto: string; //moto de varon o mujer UNISEX

    @Column({
        type: 'text',
    })
    traccion: string; //2x2, 2x1

    @Column({
        type: 'text',
    })
    descripcion: string;

    // debe ser unico para identificar el url 
    @Column('text', {
        unique: true,
    })
    slug: string;
    
    //  ETIQUETAS PARA UNA BUENA BUSQUEDA
    @Column('text',{
        array:true,
        default:[]
    })
    etiquetas:string[];



    //FALTA RELACION CON PROVEEDORES Y CON MODELOS
    //FALTAN LAS IMAGENES 
    @OneToMany(
        ()=>ProductImage,
        (productImage)=>productImage.product,
        {cascade:true, eager:true}
    )
    images?:ProductImage[];


    // por si no viene un campo para la insercion de base de datos
    @BeforeInsert()
    verificarInsercion_Slug() {
        if (!this.slug) {
            this.slug = this.titulo_moto;
        }
        this.slug = this.slug
            .toLocaleLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }

    @BeforeUpdate()
    verificarActualizacion_Slug() {
       if (!this.slug) {
            this.slug = this.titulo_moto;
        }
            this.slug = this.titulo_moto
            .toLocaleLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }

    // para fecha de ingreso
    @BeforeInsert()
    verificarInsercion_fecha_ingreso() {
        if (!this.fecha_ingreso) {
            this.fecha_ingreso = new Date();
        }
        this.fecha_ingreso = this.fecha_ingreso;
    } 

    // para descripcion

    @BeforeInsert()
    verificarInsercion_descripcion() {
        if (!this.descripcion) {
            this.descripcion = `es una ` + this.titulo_moto + ` que esta ` + this.estado_moto + ` y es de color ` + this.color_moto
                .toLocaleLowerCase()
                .replaceAll('_', ' ')
        }
        this.descripcion = this.descripcion.toLocaleLowerCase()
    }
} 














