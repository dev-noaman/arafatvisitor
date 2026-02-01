import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HostsService } from './hosts.service';
import { CsvImportService } from './csv-import.service';
import { CreateHostDto } from './dto/create-host.dto';
import { UpdateHostDto } from './dto/update-host.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@Controller('hosts')
export class HostsController {
  constructor(
    private readonly hostsService: HostsService,
    private readonly csvImportService: CsvImportService,
  ) {}

  @Get()
  @Public()
  findAll(@Query('location') location?: string) {
    return this.hostsService.findAll(location);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.hostsService.findOne(BigInt(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateHostDto) {
    return this.hostsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id', ParseIntPipe) id: string, @Body() dto: UpdateHostDto) {
    return this.hostsService.update(BigInt(id), dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.hostsService.remove(BigInt(id));
  }

  @Post('import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async import(@UploadedFile() file: Express.Multer.File) {
    if (!file?.buffer) {
      return { imported: 0, skipped: 0, errors: ['No file uploaded'] };
    }
    return this.csvImportService.importFromBuffer(file.buffer);
  }
}
