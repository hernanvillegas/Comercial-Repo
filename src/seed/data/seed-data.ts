import * as bcrypt from 'bcrypt';


interface SeedProduct {
titulo_moto: string;
codigo_moto: string;
poliza_importacion: number;
numero_chasis: string;
 numero_motor: string;
color_moto: ValidColor;
cantidad_moto: number;
// tipo_moto: 'nueva'|'seminueva'|'usada';
tipo_moto: string;
precio_compra: number;
precio_venta: number;
// estado_moto: 'vendida'|'disponible'|'reservada'|'mantenimiento';
estado_moto: string;
fecha_ingreso: Date;
 fecha_venta: Date;
genero_moto: string;
// genero_moto: 'hombre'|'mujer'|'unisex'|'niños';
traccion: string; 
descripcion: string;
slug: string;
etiquetas:string[];
images:string[];



}

type ValidColor = 'negro'|'rojo'|'azul'|'cafe'|'blanco';

interface SeedUser{

    email: string;
    fullName: string;
    password: string;
    roles: string[];
}


interface SeedData {
    user: SeedUser[],
    products: SeedProduct[];
}


export const initialData: SeedData = {

    user:[
        {
            email: 'test1@gmail.com',
            fullName:'Test one',
            password: bcrypt.hashSync('abc123',10),
            roles:['admin'],
        },
        {
            email: 'test2@gmail.com',
            fullName:'Test two',
            // password: 'abc123',
            password: bcrypt.hashSync('abc123',10),
            roles:['admin','super-admin']
        }
    ],
    products: [
        {
        images: [
                '1740176-00-A_0_2000.jpg',
                '1740176-00-A_1.jpg',
                ],
        titulo_moto: 'moto pistera',
        codigo_moto: '1111',
        poliza_importacion: 1111,
        numero_chasis: '99999rty',
        numero_motor: 'ff56788b',
        color_moto: 'azul',
        cantidad_moto: 8,
        tipo_moto: 'seminueva',
        precio_compra: 17.8,
        precio_venta: 20.78,
        estado_moto: 'mantenimiento',
        fecha_ingreso: new Date ('2025/07/26'),
        fecha_venta: new Date ('2025/07/26'),
        genero_moto: 'niños',
        traccion: '2x2',
        descripcion: 'es una moto muy veloz',
        slug: 'moto_pistera',
        etiquetas: ['moto'],
        

        },
        {
        images: [
                '1740176-00-A_0_2000.jpg',
                '1740176-00-A_1.jpg',
                ],
        titulo_moto: 'moto semi pistera',
        codigo_moto: '2222',
        poliza_importacion: 2222,
        numero_chasis: '222222',
        numero_motor: 'f2222',
        color_moto: 'azul',
        cantidad_moto: 8,
        tipo_moto: 'seminueva',
        precio_compra: 17.8,
        precio_venta: 20.78,
        estado_moto: 'mantenimiento',
        fecha_ingreso: new Date ('2025/07/26'),
        fecha_venta: new Date ('2025/07/26'),
        genero_moto: 'niños',
        traccion: '2x2',
        descripcion: 'es una moto muy veloz',
        slug: 'moto_semi_pistera',
        etiquetas: ['moto'],
        

        },
        {
        images: [
                '1740176-00-A_0_2000.jpg',
                '1740176-00-A_1.jpg',
                ],
        titulo_moto: 'moto muy pistera',
        codigo_moto: '333',
        poliza_importacion: 333,
        numero_chasis: '333',
        numero_motor: '33333333',
        color_moto: 'azul',
        cantidad_moto: 8,
        tipo_moto: 'seminueva',
        precio_compra: 17.8,
        precio_venta: 20.78,
        estado_moto: 'mantenimiento',
        fecha_ingreso: new Date ('2025/07/26'),
        fecha_venta: new Date ('2025/07/26'),
        genero_moto: 'niños',
        traccion: '2x2',
        descripcion: 'es una moto muy veloz',
        slug: 'moto_muy_pistera',
        etiquetas: ['moto'],
        

        },
       
        
        
        
    ]
}