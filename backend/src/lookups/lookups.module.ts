import { Module } from "@nestjs/common";
import { LookupsController } from "./lookups.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [LookupsController],
})
export class LookupsModule {}
