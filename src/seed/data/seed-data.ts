import * as bcrypt from 'bcrypt';

// ================================================================
//  INTERFACES
// ================================================================

interface SeedUser {
    nombre_user:      string;
    apellido_user:    string;
    ci_user:          number;
    sucursal:         string;
    fecha_nacimiento: string;
    celular:          number;
    direccion:        string;
    fecha_ingreso:    string;
    ingreso_mensual:  number;
    email:            string;
    password:         string;
    fullName:         string;
    roles:            string[];
    isActive:         boolean;
}

interface SeedMarca {
    nombre_marca: string;
    pais_origen:  string;
    activo:       boolean;
}

interface SeedModelo {
    numero_modelo:    number;
    nombre_modelo:    string;
    cilindrada:       string;
    tipo_combustible: string;
    numero_ruedas:    number;
    transmision:      string;
    // marca se asigna por índice en seed.service
    marcaIndex:       number;
}

interface SeedProveedor {
    cod_proveedor:       string;
    nombre_proveedor:    string;
    tipo_proveedor:      string;
    cel_proveedor:       string;
    email_proveedor:     string;
    direccion_proveedor: string;
    razon_social:        string;
    activo:              boolean;
}

interface SeedCategoriaProducto {
    nombre_categoria: string;
    tipo:             string;
    descripcion:      string;
}

interface SeedProducto {
    nombre_producto:  string;
    codigo_producto:  string;
    tipo_producto:    string;
    precio_compra:    number;
    precio_venta:     number;
    stock:            number;
    stock_minimo:     number;
    disponible:       boolean;
    gender:           string;
    descripcion:      string;
    slug:             string;
    etiquetas:        string[];
    images:           string[];
    // se asignan por índice en seed.service
    categoriaIndex:   number;
    proveedorIndex:   number;
}

interface SeedDetalleMoto {
    numero_chasis:      string;
    numero_motor:       string;
    poliza_importacion: number;
    color_moto:         string;
    traccion:           string;
    tipo_moto:          string;
    estado_moto:        string;
    fecha_ingreso:      string;
    // se asignan por índice
    productoIndex:      number;
    modeloIndex:        number;
}

interface SeedCliente {
    nombre_cliente:   string;
    apellido_cliente: string;
    ci_cliente:       number;
    fecha_nacimiento: string;
    celular:          number;
    email:            string;
    ciudad:           string;
    provincia:        string;
    direccion:        string;
    ocupacion:        string;
    ingreso_mensual:  number;
    verificado:       boolean;
}

interface SeedGarante {
    nombre_garante:   string;
    apellido_garante: string;
    ci_garante:       number;
    fecha_nacimiento: string;
    relacion:         string;
    celular:          number;
    direccion:        string;
    verificado:       boolean;
    // cliente al que se asocia (por índice)
    clienteIndex:     number;
}

interface SeedPack {
    nombre_pack:    string;
    descripcion:    string;
    precio_pack:    number;
    descuento_pack: number;
    activo:         boolean;
    // productos incluidos (por índice y cantidad)
    items: { productoIndex: number; cantidad: number; precio_referencia: number }[];
}

interface SeedData {
    users:               SeedUser[];
    marcas:              SeedMarca[];
    modelos:             SeedModelo[];
    proveedores:         SeedProveedor[];
    categorias:          SeedCategoriaProducto[];
    productos:           SeedProducto[];
    detallesMoto:        SeedDetalleMoto[];
    clientes:            SeedCliente[];
    garantes:            SeedGarante[];
    packs:               SeedPack[];
}

// ================================================================
//  DATOS
// ================================================================

export const initialData: SeedData = {

    // ── 3 usuarios, uno por cada rol ─────────────────────────────────────
    users: [
        {
            nombre_user:      'Carlos',
            apellido_user:    'Mamani',
            ci_user:          12345678,
            sucursal:         'Central',
            fecha_nacimiento: '1985-03-15',
            celular:          71234567,
            direccion:        'Av. 6 de Agosto 123, La Paz',
            fecha_ingreso:    '2022-01-10',
            ingreso_mensual:  5000,
            email:            'superuser@comercial.com',
            password:         bcrypt.hashSync('SuperUser123', 10),
            fullName:         'Carlos Mamani',
            roles:            ['super-user'],
            isActive:         true,
        },
        {
            nombre_user:      'Ana',
            apellido_user:    'Quispe',
            ci_user:          87654321,
            sucursal:         'Central',
            fecha_nacimiento: '1990-07-22',
            celular:          76543210,
            direccion:        'Calle Comercio 456, La Paz',
            fecha_ingreso:    '2023-03-01',
            ingreso_mensual:  3500,
            email:            'admin@comercial.com',
            password:         bcrypt.hashSync('Admin1234', 10),
            fullName:         'Ana Quispe',
            roles:            ['admin'],
            isActive:         true,
        },
        {
            nombre_user:      'Luis',
            apellido_user:    'Choque',
            ci_user:          11223344,
            sucursal:         'Sucursal Norte',
            fecha_nacimiento: '1995-11-30',
            celular:          79876543,
            direccion:        'Av. Montes 789, El Alto',
            fecha_ingreso:    '2024-01-15',
            ingreso_mensual:  2500,
            email:            'user@comercial.com',
            password:         bcrypt.hashSync('User12345', 10),
            fullName:         'Luis Choque',
            roles:            ['user'],
            isActive:         true,
        },
    ],

    // ── 2 marcas ──────────────────────────────────────────────────────────
    marcas: [
        {
            nombre_marca: 'Honda',
            pais_origen:  'Japón',
            activo:       true,
        },
        {
            nombre_marca: 'Yamaha',
            pais_origen:  'Japón',
            activo:       true,
        },
    ],

    // ── 2 modelos (uno por marca) ─────────────────────────────────────────
    modelos: [
        {
            numero_modelo:    2024,
            nombre_modelo:    'Honda Wave 110',
            cilindrada:       '110cc',
            tipo_combustible: 'gasolina',
            numero_ruedas:    2,
            transmision:      'automatica',
            marcaIndex:       0, // Honda
        },
        {
            numero_modelo:    2024,
            nombre_modelo:    'Yamaha YBR 125',
            cilindrada:       '125cc',
            tipo_combustible: 'gasolina',
            numero_ruedas:    2,
            transmision:      'manual',
            marcaIndex:       1, // Yamaha
        },
    ],

    // ── 2 proveedores ─────────────────────────────────────────────────────
    proveedores: [
        {
            cod_proveedor:       'PROV-001',
            nombre_proveedor:    'Importadora Bolivia Sur',
            tipo_proveedor:      'importador',
            cel_proveedor:       '22345678',
            email_proveedor:     'ventas@boliviasur.com',
            direccion_proveedor: 'Zona Industrial, La Paz',
            razon_social:        'Bolivia Sur S.R.L.',
            activo:              true,
        },
        {
            cod_proveedor:       'PROV-002',
            nombre_proveedor:    'Repuestos y Accesorios Norte',
            tipo_proveedor:      'distribuidor',
            cel_proveedor:       '23456789',
            email_proveedor:     'contacto@repuestesnorte.com',
            direccion_proveedor: 'Av. Buenos Aires 321, El Alto',
            razon_social:        'Repuestos Norte S.A.',
            activo:              true,
        },
    ],

    // ── 4 categorías (2 motos, 1 accesorio, 1 repuesto) ──────────────────
    categorias: [
        {
            nombre_categoria: 'Motos de trabajo',
            tipo:             'moto',
            descripcion:      'Motos para uso laboral y carga ligera',
        },
        {
            nombre_categoria: 'Motos deportivas',
            tipo:             'moto',
            descripcion:      'Motos de alto rendimiento',
        },
        {
            nombre_categoria: 'Cascos',
            tipo:             'accesorio',
            descripcion:      'Cascos de protección homologados',
        },
        {
            nombre_categoria: 'Motor y transmisión',
            tipo:             'repuesto',
            descripcion:      'Repuestos de motor y caja',
        },
    ],

    // ── 4 productos (2 motos, 1 accesorio, 1 repuesto) ───────────────────
    productos: [
        {
            nombre_producto:  'Honda Wave 110 2024',
            codigo_producto:  'HON-WAVE-001',
            tipo_producto:    'moto',
            precio_compra:    8500,
            precio_venta:     11000,
            stock:            5,
            stock_minimo:     1,
            disponible:       true,
            gender:           'unisex',
            descripcion:      'Moto de trabajo ideal para ciudad, bajo consumo de combustible',
            slug:             'honda_wave_110_2024',
            etiquetas:        ['honda', 'wave', 'trabajo', 'ciudad'],
            images:           [],
            categoriaIndex:   0, // Motos de trabajo
            proveedorIndex:   0, // Bolivia Sur
        },
        {
            nombre_producto:  'Yamaha YBR 125 2024',
            codigo_producto:  'YAM-YBR-001',
            tipo_producto:    'moto',
            precio_compra:    10500,
            precio_venta:     13500,
            stock:            3,
            stock_minimo:     1,
            disponible:       true,
            gender:           'hombre',
            descripcion:      'Moto deportiva de 125cc, ideal para viajes y ciudad',
            slug:             'yamaha_ybr_125_2024',
            etiquetas:        ['yamaha', 'ybr', 'deportiva'],
            images:           [],
            categoriaIndex:   1, // Motos deportivas
            proveedorIndex:   0, // Bolivia Sur
        },
        {
            nombre_producto:  'Casco Full Face Negro',
            codigo_producto:  'ACC-CASCO-001',
            tipo_producto:    'accesorio',
            precio_compra:    180,
            precio_venta:     280,
            stock:            20,
            stock_minimo:     5,
            disponible:       true,
            gender:           'unisex',
            descripcion:      'Casco certificado DOT, talla M, color negro mate',
            slug:             'casco_full_face_negro',
            etiquetas:        ['casco', 'seguridad', 'proteccion'],
            images:           [],
            categoriaIndex:   2, // Cascos
            proveedorIndex:   1, // Repuestos Norte
        },
        {
            nombre_producto:  'Kit de Transmisión Honda Wave',
            codigo_producto:  'REP-KIT-TRANS-001',
            tipo_producto:    'repuesto',
            precio_compra:    120,
            precio_venta:     195,
            stock:            15,
            stock_minimo:     3,
            disponible:       true,
            gender:           'unisex',
            descripcion:      'Kit completo de transmisión para Honda Wave 100/110',
            slug:             'kit_transmision_honda_wave',
            etiquetas:        ['repuesto', 'transmision', 'honda', 'wave'],
            images:           [],
            categoriaIndex:   3, // Motor y transmisión
            proveedorIndex:   1, // Repuestos Norte
        },
    ],

    // ── 2 detalles de moto (para los 2 productos tipo moto) ──────────────
    detallesMoto: [
        {
            numero_chasis:      'LHJPC2630P0012345',
            numero_motor:       'PC20E-1234567',
            poliza_importacion: 20240001,
            color_moto:         'ROJO',
            traccion:           '2x2',
            tipo_moto:          'nueva',
            estado_moto:        'disponible',
            fecha_ingreso:      '2024-03-01',
            productoIndex:      0, // Honda Wave
            modeloIndex:        0, // Honda Wave 110
        },
        {
            numero_chasis:      'LHJYB1250P0067890',
            numero_motor:       'E3S4E-7654321',
            poliza_importacion: 20240002,
            color_moto:         'NEGRO',
            traccion:           '2x2',
            tipo_moto:          'nueva',
            estado_moto:        'disponible',
            fecha_ingreso:      '2024-03-15',
            productoIndex:      1, // Yamaha YBR
            modeloIndex:        1, // Yamaha YBR 125
        },
    ],

    // ── 2 clientes ────────────────────────────────────────────────────────
    clientes: [
        {
            nombre_cliente:   'Roberto',
            apellido_cliente: 'Flores',
            ci_cliente:       55667788,
            fecha_nacimiento: '1988-05-12',
            celular:          77889900,
            email:            'roberto.flores@gmail.com',
            ciudad:           'La Paz',
            provincia:        'Murillo',
            direccion:        'Av. Arce 567, Miraflores',
            ocupacion:        'Comerciante',
            ingreso_mensual:  4500,
            verificado:       true,
        },
        {
            nombre_cliente:   'María',
            apellido_cliente: 'Condori',
            ci_cliente:       44332211,
            fecha_nacimiento: '1992-09-25',
            celular:          72334455,
            email:            'maria.condori@hotmail.com',
            ciudad:           'El Alto',
            provincia:        'Murillo',
            direccion:        'Calle 12 de Octubre 890, Villa Adela',
            ocupacion:        'Empleada',
            ingreso_mensual:  3200,
            verificado:       true,
        },
    ],

    // ── 2 garantes (uno por cliente) ──────────────────────────────────────
    garantes: [
        {
            nombre_garante:   'Pedro',
            apellido_garante: 'Flores',
            ci_garante:       66778899,
            fecha_nacimiento: '1960-02-18',
            relacion:         'padre',
            celular:          71122334,
            direccion:        'Av. Arce 567, Miraflores, La Paz',
            verificado:       true,
            clienteIndex:     0, // garante de Roberto
        },
        {
            nombre_garante:   'Rosa',
            apellido_garante: 'Ticona',
            ci_garante:       33445566,
            fecha_nacimiento: '1965-11-08',
            relacion:         'madre',
            celular:          73344556,
            direccion:        'Calle 12 de Octubre 890, El Alto',
            verificado:       true,
            clienteIndex:     1, // garante de María
        },
    ],

    // ── 2 packs ───────────────────────────────────────────────────────────
    packs: [
        {
            nombre_pack:    'Moto + Casco Seguridad',
            descripcion:    'Honda Wave 110 con casco full face incluido, precio especial',
            precio_pack:    11200,  // ahorra 80 vs comprar por separado (11000 + 280)
            descuento_pack: 80,
            activo:         true,
            items: [
                { productoIndex: 0, cantidad: 1, precio_referencia: 11000 }, // Honda Wave
                { productoIndex: 2, cantidad: 1, precio_referencia: 280 },   // Casco
            ],
        },
        {
            nombre_pack:    'Kit Mantenimiento Wave',
            descripcion:    'Kit de transmisión + casco, ideal para renovar tu moto',
            precio_pack:    450,    // ahorra 25 vs comprar por separado (195 + 280)
            descuento_pack: 25,
            activo:         true,
            items: [
                { productoIndex: 3, cantidad: 1, precio_referencia: 195 }, // Kit transmisión
                { productoIndex: 2, cantidad: 1, precio_referencia: 280 }, // Casco
            ],
        },
    ],
};
