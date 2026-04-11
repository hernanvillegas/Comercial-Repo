import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PackService } from './pack.service';
import { CreatePackDto } from './dto/create-pack.dto';
import { UpdatePackDto } from './dto/update-pack.dto';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@ApiTags('Pack')
@Controller('pack')
export class PackController {

    constructor(private readonly packService: PackService) {}

    @Post()
    @Auth(ValidRoles.admin)
    create(@Body() createPackDto: CreatePackDto) {
        return this.packService.create(createPackDto);
    }

    @Get()
    findAll() {
        return this.packService.findAll();
    }

    @Get('activos')
    findActivos() {
        return this.packService.findActivos();
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.packService.findOne(id);
    }

    @Patch(':id')
    @Auth(ValidRoles.admin)
    update(@Param('id', ParseUUIDPipe) id: string, @Body() updatePackDto: UpdatePackDto) {
        return this.packService.update(id, updatePackDto);
    }

    @Delete(':id')
    @Auth(ValidRoles.admin)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.packService.remove(id);
    }
}
