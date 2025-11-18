import { Modelo } from 'src/modelo/entities/modelo.entity';
import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';


@Entity('marca')
export class Marca {

    @PrimaryGeneratedColumn()
    id_marca:number;

    @Column({
            type: 'text',
            nullable: false,
            unique:true
    })
    nombre_marca:string;//nullable en true acepta nulos


    @Column({
            type: 'text',
            nullable: false,
            unique:true
        })
    pais_origen:string; //nullable en true acepta nulos

 
    @Column('bool', {
        default: true
    })
    activo: boolean;//nullable en true acepta nulos

    @Column({
        name: 'fecha_registro',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP'
    })
    fecha_registro:Date;//nullable en true acepta nulos

    

    @OneToMany(()=>Modelo, (modelo)=>modelo.marcas,
        {
            cascade: true, // Permite crear libros al crear un autor
            eager: false // No carga automáticamente los libros (usar relations en queries)
        }
   
    )
    modelos: Modelo[];

  


    // para fecha de ingreso
        @BeforeInsert()
        verificarInsercion_fecha_ingreso() {
            if (!this.fecha_registro) {
                this.fecha_registro = new Date();
            }
            this.fecha_registro = this.fecha_registro;
        }

    




}
