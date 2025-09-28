import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';



export const GetUser = createParamDecorator(
    ( data: string, ctx: ExecutionContext ) => {

        const req = ctx.switchToHttp().getRequest();
        const user = req.user;

        if ( !user )
            throw new InternalServerErrorException('Usuario no encontrado (solicitud)');
        
        return ( !data ) 
            ? user  // si no existe la data
            : user[data]; // si existe la data
        
    }
);