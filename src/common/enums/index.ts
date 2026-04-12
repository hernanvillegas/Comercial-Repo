export enum TipoVenta {
    CREDITO  = 'credito',
    CONTADO  = 'contado',
}

export enum EstadoVenta {
    COMPLETADA  = 'completada',
    EN_CREDITO  = 'en_credito',
    ANULADA     = 'anulada',
}

export enum TipoProducto {
    MOTO      = 'moto',
    ACCESORIO = 'accesorio',
    REPUESTO  = 'repuesto',
    SERVICIO  = 'servicio',
    OTRO      = 'otro',
}

export enum EstadoCuota {
    PENDIENTE = 'pendiente',
    PAGADA    = 'pagada',
    VENCIDA   = 'vencida',
    PARCIAL   = 'parcial',
}

export enum EstadoMoto {
    DISPONIBLE      = 'disponible',
    VENDIDO         = 'vendido',
    RESERVADO       = 'reservado',
    MANTENIMIENTO   = 'mantenimiento',
}