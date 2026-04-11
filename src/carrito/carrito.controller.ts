import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CarritoService } from './carrito.service';
import { AgregarItemCarritoDto } from './dto/carrito.dto';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@ApiTags('Carrito')
@Controller('carrito')
export class CarritoController {

    constructor(private readonly carritoService: CarritoService) {}

    // Ver carrito activo del cliente
    @Get('cliente/:idCliente')
    @Auth()
    obtenerCarrito(@Param('idCliente', ParseIntPipe) idCliente: number) {
        return this.carritoService.obtenerCarritoCliente(idCliente);
    }

    // Agregar producto o pack al carrito
    @Post('cliente/:idCliente/agregar')
    @Auth()
    agregarItem(
        @Param('idCliente', ParseIntPipe) idCliente: number,
        @Body() agregarItemDto: AgregarItemCarritoDto,
    ) {
        return this.carritoService.agregarItem(idCliente, agregarItemDto);
    }

    // Confirmar carrito y convertirlo en venta
    @Post('cliente/:idCliente/confirmar')
    @Auth()
    confirmarCarrito(
        @Param('idCliente', ParseIntPipe) idCliente: number,
        @Body() datosVenta: {
            numeroFactura: string;
            tipoVenta: string;
            idEmpleadoFk: string;
            descuento?: number;
            numeroCuotas?: number;
            entradaInicial?: number;
            observaciones?: string;
        },
    ) {
        return this.carritoService.confirmarCarrito(idCliente, datosVenta);
    }

    // Eliminar un item del carrito
    @Delete('item/:idItem')
    @Auth()
    eliminarItem(@Param('idItem', ParseUUIDPipe) idItem: string) {
        return this.carritoService.eliminarItem(idItem);
    }

    // Vaciar todo el carrito
    @Delete('cliente/:idCliente/vaciar')
    @Auth()
    vaciarCarrito(@Param('idCliente', ParseIntPipe) idCliente: number) {
        return this.carritoService.vaciarCarrito(idCliente);
    }

    // Carritos abandonados (más de 24h sin actividad)
    @Get('abandonados')
    @Auth(ValidRoles.admin)
    findCarritosAbandonados() {
        return this.carritoService.findCarritosAbandonados();
    }
}
