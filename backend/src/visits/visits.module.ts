import { Module } from "@nestjs/common";
import { VisitsService } from "./visits.service";
import { VisitsController } from "./visits.controller";
import { QrTokenService } from "./qr-token.service";

@Module({
  controllers: [VisitsController],
  providers: [VisitsService, QrTokenService],
  exports: [VisitsService, QrTokenService],
})
export class VisitsModule {}
