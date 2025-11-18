import { Marca } from "src/marca/entities/marca.entity";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity('modelo')
export class Modelo {

    @PrimaryGeneratedColumn()
    id_modelo:number; //nombre de campo

    @Column({
            type: 'int',
            nullable: false,
            unique:true
    })
    numero_modelo:number;//nombre de campo

    @Column({
            type: 'text',
            nullable: false,
            unique:true
    })
    nombre_modelo:string;//nombre de campo

    @Column({
            type: 'text',
            nullable: true,
    })
    cilindrada:string;//nombre de campo

//     @Column({
//         type: 'date',
//         nullable: true,
//     })
//     anio_modelo:Date;//nombre de campo
@Column({
        name: 'fecha_registro',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP'
    })
    anio_modelo:Date;//nullable en true acepta nulos

    @Column({
            type: 'text',
            nullable: true,
    })
    tipo_combustible:string;//nombre de campo

    @Column({
            type: 'text',
            nullable: true,
    })
    capacidad_carga: string;//nombre de campo

    @Column({
            type: 'int',
            nullable: true,
    })
    numero_puertas:number;//nombre de campo

    @Column({
            type: 'int',
            nullable: true,
    })
    numero_plazas:number;//nombre de campo

    @Column({
            type: 'int',
            nullable: true,
    })
    numero_ruedas:number;//nombre de campo

    @Column({
            type: 'text',
            nullable: true,
    })
    regimen:string;//nombre de campo

    @Column({
            type: 'text',
            nullable: true,
    })
    sub_tipo:string;//nombre de campo

    @Column({
            type: 'text',
            nullable: true,
    })
    transmision: string;//nombre de campo


    @Column({
            type: 'text',
            nullable: true, //CAMBIAR A FALSE ---- SE NECESITA ESTE CAMPO OBLIGATORIO
    })
    numero_factura: string; // esto esta por verse//nombre de campo//nombre de campo//nombre de campo//nombre de campo



    // Columna de clave foránea
  @Column({ name: 'id_marca' ,
        nullable: true,
  })
  idMarca: number;

  // Relación: Muchos modelos pertenecen a una marca
  @ManyToOne(() => Marca, (marca) => marca.modelos, {
    onDelete: 'CASCADE',// Si se elimina el autor, se eliminan sus libros
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'id_marca' })
  marcas: Marca;

  ///////////////////////////////////////////// campos generados automaticamennte
  @BeforeInsert()
      verificarInsercion_cilindrada() {
          if (!this.cilindrada) {
              this.cilindrada = "150 cc";
          }
          this.cilindrada = this.cilindrada
      }

       @BeforeInsert()
      verificarInsercion_tipo_combustible() {
          if (!this.tipo_combustible) {
              this.tipo_combustible = "gasolina" ;
          }
          this.tipo_combustible = this.tipo_combustible
      }

      @BeforeInsert()
      verificarInsercion_capacidad_carga() {
          if (!this.capacidad_carga) {
              this.capacidad_carga = "2 toneladas" ;
          }
          this.capacidad_carga = this.capacidad_carga
      }

      @BeforeInsert()
      verificarInsercion_numero_puertas() {
          if (!this.numero_puertas) {
              this.numero_puertas = 0 ;
          }
          this.numero_puertas = this.numero_puertas
      }

      @BeforeInsert()
      verificarInsercion_numero_plazas() {
          if (!this.numero_plazas) {
              this.numero_plazas = 2 ;
          }
          this.numero_plazas = this.numero_plazas
      }

      @BeforeInsert()
      verificarInsercion_numero_ruedas() {
          if (!this.numero_ruedas) {
              this.numero_ruedas = 2 ;
          }
          this.numero_ruedas = this.numero_ruedas
      }

      @BeforeInsert()
      verificarInsercion_regimen() {
          if (!this.regimen) {
              this.regimen = 'IM-4' ;
          }
          this.regimen = this.regimen
      }

      @BeforeInsert()
      verificarInsercion_sub_tipo() {
          if (!this.sub_tipo) {
              this.sub_tipo = '18A' ;
          }
          this.sub_tipo = this.sub_tipo
      }

      @BeforeInsert()
      verificarInsercion_transmision() {
          if (!this.transmision) {
              this.transmision = 'MT' ;
          }
          this.transmision = this.transmision
      }

      
      

}






        
        

        

        

