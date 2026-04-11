import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CuotaCreditoService } from './cuota-credito.service';

@Injectable()
export class CuotasCreditoCron {

    private readonly logger = new Logger(CuotasCreditoCron.name);

    constructor(private readonly cuotasCreditoService: CuotaCreditoService) {}

    // Se ejecuta todos los días a la 1:00 AM
    // Deshabilitado automáticamente en desarrollo (NODE_ENV=development)
    @Cron(CronExpression.EVERY_DAY_AT_1AM, {
        disabled: process.env.NODE_ENV === 'development',
    })
    async actualizarMorasDiarias() {
        this.logger.log('Iniciando actualización diaria de moras...');

        try {
            const actualizadas = await this.cuotasCreditoService.actualizarMorasMasivas();
            this.logger.log(`✅ Moras actualizadas: ${actualizadas} cuotas procesadas`);
        } catch (error) {
            this.logger.error('❌ Error al actualizar moras:', error);
        }
    }
}
