import { Cliente } from "src/cliente/entities/cliente.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";



@Entity('garante')
export class Garante {

        @PrimaryGeneratedColumn()
        id_garante: number;

        @Column({
                type: 'text',
                name: 'nombre_garante',
                nullable: false,
                unique: false
        })
        nombre_garante: string;//nullable en true acepta nulos

        @Column({
                type: 'text',
                name: 'apellido_garante',
                nullable: false,
                unique: false
        })
        apellido_garante: string;//nullable en true acepta nulos


        @Column({
                type: 'int',
                name: 'ci_garante',
                nullable: false,
                unique: true
        })
        ci_garante: number; //nombre de campo

        @Column({
                name: 'fecha_nacimiento',
                type: 'date',
                default: () => 'CURRENT_TIMESTAMP'
        })
        fecha_nacimiento: Date;//nullable en true acepta nulos

        @Column({
                type: 'text',
                name: 'relacion',
                nullable: false,
                unique: false
        })
        relacion: string;//nullable en true acepta nulos

        @Column({
                type: 'int',
                name: 'celular',
                nullable: false,
                unique: false
        })
        celular: number;

        @Column({
                type: 'text',
                name: 'direccion',
                nullable: false,
                unique: false
        })
        direccion: string;//nullable en true acepta nulos


        @Column('bool', {
                default: true
        })
        verificado: boolean; //nullable en true acepta nulos

        @Column({
                name: 'fecha_registro',
                type: 'timestamp',
                default: () => 'CURRENT_TIMESTAMP'
        })
        fecha_registro: Date;//nullable en true acepta nulos


        // relacion con la tabla CLIENTE N:N
        @ManyToMany(() => Cliente, (cliente) => cliente.garantes)
        clientes: Garante[];

        // @ManyToMany(() => Estudiante, (estudiante) => estudiante.cursos)
        // estudiantes: Estudiante[];
}
