import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { initialData } from './data/seed-data';

import { User }               from 'src/auth/entities/user.entity';
import { Marca }              from 'src/marca/entities/marca.entity';
import { Modelo }             from 'src/modelo/entities/modelo.entity';
import { Proveedor }          from 'src/proveedor/entities/proveedor.entity';
import { CategoriaProducto }  from 'src/categoria-producto/entities/categoria-producto.entity';
import { Producto }           from 'src/producto/entities/producto.entity';
import { ProductImage }       from 'src/products/entities/product-image.entity';
import { ProductoImage }      from 'src/producto/entities/producto-image.entity';
import { DetalleMoto }        from 'src/detalle-moto/entities/detalle-moto.entity';
import { Cliente }            from 'src/cliente/entities/cliente.entity';
import { Garante }            from 'src/garante/entities/garante.entity';
import { Pack }               from 'src/pack/entities/pack.entity';
import { PackDetalle }        from 'src/pack/entities/pack-detalle.entity';

@Injectable()
export class SeedService {

    private readonly logger = new Logger('SeedService');

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(Marca)
        private readonly marcaRepository: Repository<Marca>,

        @InjectRepository(Modelo)
        private readonly modeloRepository: Repository<Modelo>,

        @InjectRepository(Proveedor)
        private readonly proveedorRepository: Repository<Proveedor>,

        @InjectRepository(CategoriaProducto)
        private readonly categoriaRepository: Repository<CategoriaProducto>,

        @InjectRepository(Producto)
        private readonly productoRepository: Repository<Producto>,

        @InjectRepository(ProductImage)
        private readonly productImageRepository: Repository<ProductImage>,

        @InjectRepository(ProductoImage)
        private readonly productoImageRepository: Repository<ProductoImage>,

        @InjectRepository(DetalleMoto)
        private readonly detalleMotoRepository: Repository<DetalleMoto>,

        @InjectRepository(Cliente)
        private readonly clienteRepository: Repository<Cliente>,

        @InjectRepository(Garante)
        private readonly garanteRepository: Repository<Garante>,

        @InjectRepository(Pack)
        private readonly packRepository: Repository<Pack>,

        @InjectRepository(PackDetalle)
        private readonly packDetalleRepository: Repository<PackDetalle>,

        private readonly dataSource: DataSource,
    ) {}

    async runSeed() {
        await this.limpiarTablas();

        // El orden importa por las FK
        const users      = await this.insertarUsuarios();
        const marcas     = await this.insertarMarcas();
        const modelos    = await this.insertarModelos(marcas);
        const proveedores = await this.insertarProveedores();
        const categorias = await this.insertarCategorias();
        const productos  = await this.insertarProductos(categorias, proveedores, users[0]);
        await this.insertarDetallesMoto(productos, modelos);
        const clientes   = await this.insertarClientes();
        await this.insertarGarantes(clientes);
        await this.insertarPacks(productos);

        this.logger.log('✅ SEED ejecutado correctamente');
        return {
            mensaje: 'SEED ejecutado correctamente',
            usuarios: {
                superUser: { email: 'superuser@comercial.com', password: 'SuperUser123' },
                admin:     { email: 'admin@comercial.com',     password: 'Admin1234'   },
                user:      { email: 'user@comercial.com',      password: 'User12345'   },
            }
        };
    }

    // ── Limpia todas las tablas en orden inverso a las FK ─────────────────
    private async limpiarTablas() {
        this.logger.log('Limpiando tablas...');

        // Orden: primero los hijos, después los padres
        await this.packDetalleRepository.createQueryBuilder().delete().where({}).execute();
        await this.packRepository.createQueryBuilder().delete().where({}).execute();
        await this.detalleMotoRepository.createQueryBuilder().delete().where({}).execute();
        await this.productImageRepository.createQueryBuilder().delete().where({}).execute();
        await this.productoImageRepository.createQueryBuilder().delete().where({}).execute();
        await this.productoRepository.createQueryBuilder().delete().where({}).execute();
        await this.categoriaRepository.createQueryBuilder().delete().where({}).execute();
        await this.modeloRepository.createQueryBuilder().delete().where({}).execute();
        await this.marcaRepository.createQueryBuilder().delete().where({}).execute();
        await this.proveedorRepository.createQueryBuilder().delete().where({}).execute();

        // Garante tiene relación ManyToMany con cliente
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.query(`DELETE FROM "cliente-garante"`);
            await queryRunner.commitTransaction();
        } catch (e) {
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }

        await this.garanteRepository.createQueryBuilder().delete().where({}).execute();
        await this.clienteRepository.createQueryBuilder().delete().where({}).execute();
        await this.userRepository.createQueryBuilder().delete().where({}).execute();

        this.logger.log('Tablas limpias ✓');
    }

    // ── Usuarios ──────────────────────────────────────────────────────────
    private async insertarUsuarios(): Promise<User[]> {
        const usuarios: User[] = [];

        for (const u of initialData.users) {
            const user = this.userRepository.create(u);
            usuarios.push(await this.userRepository.save(user));
        }

        this.logger.log(`${usuarios.length} usuarios insertados ✓`);
        return usuarios;
    }

    // ── Marcas ────────────────────────────────────────────────────────────
    private async insertarMarcas(): Promise<Marca[]> {
        const marcas: Marca[] = [];

        for (const m of initialData.marcas) {
            const marca = this.marcaRepository.create(m);
            marcas.push(await this.marcaRepository.save(marca));
        }

        this.logger.log(`${marcas.length} marcas insertadas ✓`);
        return marcas;
    }

    // ── Modelos ───────────────────────────────────────────────────────────
    private async insertarModelos(marcas: Marca[]): Promise<Modelo[]> {
        const modelos: Modelo[] = [];

        for (const m of initialData.modelos) {
            const { marcaIndex, ...modeloData } = m;
            const modelo = this.modeloRepository.create({
                ...modeloData,
                idMarca: marcas[marcaIndex].id_marca,
            });
            modelos.push(await this.modeloRepository.save(modelo) as Modelo);
        }

        this.logger.log(`${modelos.length} modelos insertados ✓`);
        return modelos;
    }

    // ── Proveedores ───────────────────────────────────────────────────────
    private async insertarProveedores(): Promise<Proveedor[]> {
        const proveedores: Proveedor[] = [];

        for (const p of initialData.proveedores) {
            const proveedor = this.proveedorRepository.create(p);
            proveedores.push(await this.proveedorRepository.save(proveedor));
        }

        this.logger.log(`${proveedores.length} proveedores insertados ✓`);
        return proveedores;
    }

    // ── Categorías ────────────────────────────────────────────────────────
    private async insertarCategorias(): Promise<CategoriaProducto[]> {
        const categorias: CategoriaProducto[] = [];

        for (const c of initialData.categorias) {
            const cat = this.categoriaRepository.create(c);
            categorias.push(await this.categoriaRepository.save(cat));
        }

        this.logger.log(`${categorias.length} categorías insertadas ✓`);
        return categorias;
    }

    // ── Productos ─────────────────────────────────────────────────────────
    private async insertarProductos(
        categorias: CategoriaProducto[],
        proveedores: Proveedor[],
        user: User,
    ): Promise<Producto[]> {
        const productos: Producto[] = [];

        for (const p of initialData.productos) {
            const { categoriaIndex, proveedorIndex, images, ...productoData } = p;

            const producto = this.productoRepository.create({
                ...productoData,
                idCategoria:  categorias[categoriaIndex].id_categoria,
                idProveedor:  proveedores[proveedorIndex].id_proveedor,
                user,
                images: images.map(url => this.productoImageRepository.create({ url })),
            });

            productos.push(await this.productoRepository.save(producto));
        }

        this.logger.log(`${productos.length} productos insertados ✓`);
        return productos;
    }

    // ── Detalles de moto ──────────────────────────────────────────────────
    private async insertarDetallesMoto(
        productos: Producto[],
        modelos: Modelo[],
    ): Promise<void> {
        for (const d of initialData.detallesMoto) {
            const { productoIndex, modeloIndex, ...detalleData } = d;

            const detalle = this.detalleMotoRepository.create({
                ...detalleData,
                idProductoFk: productos[productoIndex].id,
                idModelo:     modelos[modeloIndex].id_modelo,
            });

            await this.detalleMotoRepository.save(detalle);
        }

        this.logger.log(`${initialData.detallesMoto.length} detalles de moto insertados ✓`);
    }

    // ── Clientes ──────────────────────────────────────────────────────────
    private async insertarClientes(): Promise<Cliente[]> {
        const clientes: Cliente[] = [];

        for (const c of initialData.clientes) {
            const cliente = this.clienteRepository.create(c);
            clientes.push(await this.clienteRepository.save(cliente));
        }

        this.logger.log(`${clientes.length} clientes insertados ✓`);
        return clientes;
    }

    // ── Garantes (con relación ManyToMany a cliente) ───────────────────────
    private async insertarGarantes(clientes: Cliente[]): Promise<void> {
        for (const g of initialData.garantes) {
            const { clienteIndex, ...garanteData } = g;

            const garante = this.garanteRepository.create({
                ...garanteData,
                clientes: [clientes[clienteIndex]],
            });

            await this.garanteRepository.save(garante);
        }

        this.logger.log(`${initialData.garantes.length} garantes insertados ✓`);
    }

    // ── Packs ─────────────────────────────────────────────────────────────
    private async insertarPacks(productos: Producto[]): Promise<void> {
        for (const p of initialData.packs) {
            const { items, ...packData } = p;

            const pack = this.packRepository.create({
                ...packData,
                items: items.map(item =>
                    this.packDetalleRepository.create({
                        idProductoFk:              productos[item.productoIndex].id,
                        cantidad:                  item.cantidad,
                        precio_unitario_referencia: item.precio_referencia,
                    })
                ),
            });

            await this.packRepository.save(pack);
        }

        this.logger.log(`${initialData.packs.length} packs insertados ✓`);
    }
}
