import { Global, Module } from "@nestjs/common";
import { EmailService } from "./email.service";
import { WhatsAppService } from "./whatsapp.service";
// BadgeGeneratorService temporarily disabled - canvas native deps not available on server

@Global()
@Module({
  providers: [EmailService, WhatsAppService],
  exports: [EmailService, WhatsAppService],
})
export class NotificationsModule {}
