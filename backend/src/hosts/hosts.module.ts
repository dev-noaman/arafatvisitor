import { Module } from "@nestjs/common";
import { HostsService } from "./hosts.service";
import { HostsController } from "./hosts.controller";
import { CsvImportService } from "./csv-import.service";

@Module({
  controllers: [HostsController],
  providers: [HostsService, CsvImportService],
  exports: [HostsService],
})
export class HostsModule {}
