import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";


export class PaginationDto{

    @IsOptional()
    @IsPositive()
    //transformar a numero de string
    @Type(()=>Number)  // enableImplicitConversions:true
    limit?: number;


    @IsOptional()
    //@IsPositive()
    @Min(0)
    @Type(()=>Number)  // enableImplicitConversions:true
    offset?:number;
}