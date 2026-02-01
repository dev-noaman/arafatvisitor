import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { WhatsAppService } from './whatsapp.service';

@Global()
@Module({
  providers: [EmailService, WhatsAppService],
  exports: [EmailService, WhatsAppService],
})
export class NotificationsModule {}
