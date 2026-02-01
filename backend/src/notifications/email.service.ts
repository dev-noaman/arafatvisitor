import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter | null = null;

  constructor(private configService: ConfigService) {
    const host = this.configService.get('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get('SMTP_USER');
    const pass = this.configService.get('SMTP_PASS');
    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure: port === 465,
        auth: { user, pass },
      });
    }
  }

  async send(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<boolean> {
    if (!this.transporter) return false;
    const from = this.configService.get('SMTP_FROM') || 'noreply@vms.local';
    try {
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    } catch {
      return false;
    }
  }

  async sendVisitorArrival(to: string, visitorName: string, visitorCompany: string, purpose: string): Promise<boolean> {
    const html = `
      <h2>Visitor Arrival</h2>
      <p><strong>Visitor:</strong> ${visitorName}</p>
      <p><strong>Company:</strong> ${visitorCompany}</p>
      <p><strong>Purpose:</strong> ${purpose}</p>
      <p>Please meet your visitor at reception.</p>
    `;
    return this.send({
      to,
      subject: `Visitor arrived: ${visitorName}`,
      html,
    });
  }

  async sendPasswordReset(to: string, resetUrl: string): Promise<boolean> {
    const html = `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 1 hour.</p>
    `;
    return this.send({
      to,
      subject: 'Password Reset - Arafat VMS',
      html,
    });
  }
}
