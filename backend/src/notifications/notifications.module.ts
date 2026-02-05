import { Global, Module } from "@nestjs/common";
import { EmailService } from "./email.service";
import { WhatsAppService } from "./whatsapp.service";
import { BadgeGeneratorService } from "./badge-generator.service";

@Global()
@Module({
  providers: [EmailService, WhatsAppService, BadgeGeneratorService],
  exports: [EmailService, WhatsAppService, BadgeGeneratorService],
})
export class NotificationsModule {}
