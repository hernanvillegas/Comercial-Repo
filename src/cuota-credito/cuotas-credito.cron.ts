import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CuotaCreditoService } from './cuota-credito.service';

@Injectable()
export class CuotasCreditoCron {
  private readonly logger = new Logger(CuotasCreditoCron.name);

  constructor(private cuotasCreditoService: CuotaCreditoService) {}

  // Se ejecuta todos los días a la 1:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async actualizarMorasDiarias() {
    this.logger.log('Iniciando actualización de moras diarias...');
    
    try {
      const actualizadas = await this.cuotasCreditoService.actualizarMorasMasivas();
      this.logger.log(`✅ Se actualizaron ${actualizadas} cuotas vencidas`);
    } catch (error) {
      this.logger.error('❌ Error al actualizar moras:', error);
    }
  }

  // Opcional: Ejecutar cada hora para pruebas
  // @Cron(CronExpression.EVERY_HOUR)
  // async actualizarMorasHora() {
  //   this.logger.log('Actualización horaria de moras...');
  //   const actualizadas = await this.cuotasCreditoService.actualizarMorasMasivas();
  //   this.logger.log(`Actualizadas: ${actualizadas}`);
  // }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
//  Deshabilitar el Cron en Desarrollo
// Si no quieres que se ejecute automáticamente mientras desarrollas:
// // src/cuotas-credito/cuotas-credito.cron.ts
// import { Injectable, Logger } from '@nestjs/common';
// import { Cron, CronExpression } from '@nestjs/schedule';
// import { CuotasCreditoService } from './cuotas-credito.service';

// @Injectable()
// export class CuotasCreditoCron {
//   private readonly logger = new Logger(CuotasCreditoCron.name);

//   constructor(private cuotasCreditoService: CuotasCreditoService) {}

//   @Cron(CronExpression.EVERY_DAY_AT_1AM, {
//     disabled: process.env.NODE_ENV === 'development'  // ← Deshabilitado en desarrollo
//   })
//   async actualizarMorasDiarias() {
//     this.logger.log('Iniciando actualización de moras diarias...');
//     const actualizadas = await this.cuotasCreditoService.actualizarMorasMasivas();
//     this.logger.log(`✅ Se actualizaron ${actualizadas} cuotas vencidas`);
//   }
// }