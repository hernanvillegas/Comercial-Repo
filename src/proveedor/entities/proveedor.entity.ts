import { Product } from "src/products/entities";
import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity('proveedor')
export class Proveedor {

    @PrimaryGeneratedColumn()
        id_proveedor:number;
    
        @Column({
                type: 'text',
                nullable: false,
                unique:true
        })
        cod_proveedor:string;//nullable en true acepta nulos
        
        @Column({
                type: 'text',
                nullable: false,
                unique:true
        })
        nombre_proveedor:string;//nullable en true acepta nulos
    
    
        @Column({
                type: 'text',
                nullable: true,
                unique:false
            })
        tipo_proveedor :string; //nullable en true acepta nulos
    
        @Column({
                type: 'text',
                nullable: false,
                unique:true
            })
        cel_proveedor :string; //nullable en true acepta nulos
       
        @Column({
                type: 'text',
                nullable: false,
                unique:true
            })
        email_proveedor :string; //nullable en true acepta nulos
        
        @Column({
                type: 'text',
                nullable: false,
                unique:false
            })
        direccion_proveedor :string; //nullable en true acepta nulos

        @Column({
                type: 'text',
                nullable: true,
                unique:false
            })
        razon_social :string; //nullable en true acepta nulos
    
     
        @Column('bool', {
            default: true
        })
        activo: boolean;//nullable en true acepta nulos
    
        @Column({
            name: 'fecha_registro',
            type: 'timestamp',
            default: () => 'CURRENT_TIMESTAMP'
        })
        fecha_registro_prov:Date;//nullable en true acepta nulos


        // RELACIONES CON PRODUCTOS

        @OneToMany(()=>Product, (proveedor)=>proveedor.productos,
                {
                    cascade: true, // Permite crear libros al crear un autor
                    eager: false // No carga automáticamente los libros (usar relations en queries)
                }
           
            )
            productos: Product[];
       
    
    
    
    
        // para fecha de ingreso del proveedor
            @BeforeInsert()
            verificarInsercion_fecha_ingreso_prov() {
                if (!this.fecha_registro_prov) {
                    this.fecha_registro_prov = new Date();
                }
                this.fecha_registro_prov = this.fecha_registro_prov;
            }
}
