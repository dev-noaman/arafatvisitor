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
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { HostsService } from "./hosts.service";
import { CsvImportService } from "./csv-import.service";
import { CreateHostDto } from "./dto/create-host.dto";
import { UpdateHostDto } from "./dto/update-host.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { Public } from "../common/decorators/public.decorator";
import { Role } from "@prisma/client";
import { SkipThrottle } from "@nestjs/throttler";

class ImportDto {
  csvContent?: string;
  xlsxContent?: string;
}

@SkipThrottle({ default: true, 'login-account': true, 'login-ip': true })
@Controller("hosts")
export class HostsController {
  constructor(
    private readonly hostsService: HostsService,
    private readonly csvImportService: CsvImportService,
  ) {}

  @Get()
  @Public()
  findAll(@Query("location") location?: string) {
    return this.hostsService.findAll(location);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findOne(@Param("id", ParseIntPipe) id: string) {
    return this.hostsService.findOne(BigInt(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateHostDto) {
    return this.hostsService.create(dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param("id", ParseIntPipe) id: string, @Body() dto: UpdateHostDto) {
    return this.hostsService.update(BigInt(id), dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param("id", ParseIntPipe) id: string) {
    return this.hostsService.remove(BigInt(id));
  }

  @Post("import")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async import(@Body() body: ImportDto, @Query("validate") validate?: string) {
    const isValidate = validate === "true";

    if (!body.csvContent && !body.xlsxContent) {
      throw new HttpException(
        "Please provide either csvContent or xlsxContent",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (body.xlsxContent) {
      if (isValidate) {
        return this.csvImportService.validateFromXlsxBase64(body.xlsxContent);
      }
      return this.csvImportService.importFromXlsxBase64(body.xlsxContent);
    }

    // Handle CSV content
    const buffer = Buffer.from(body.csvContent!, "utf-8");
    if (isValidate) {
      return this.csvImportService.validateFromCsvBuffer(buffer);
    }
    return this.csvImportService.importFromBuffer(buffer);
  }
}
