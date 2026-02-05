import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

@Injectable()
export class EmailService {
  private transporter: Transporter | null = null;

  constructor(private configService: ConfigService) {
    const host = this.configService.get("SMTP_HOST");
    const port = this.configService.get("SMTP_PORT");
    const user = this.configService.get("SMTP_USER");
    const pass = this.configService.get("SMTP_PASS");

    console.log(
      "[EmailService] Initializing with host:",
      host,
      "port:",
      port,
      "user:",
      user ? "set" : "not set",
    );

    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure: Number(port) === 465,
        auth: { user, pass },
      });
      console.log("[EmailService] Transporter created successfully");
    } else {
      console.warn("[EmailService] Missing SMTP configuration, email disabled");
    }
  }

  isConfigured(): boolean {
    return this.transporter !== null;
  }

  async send(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: Array<{
      filename: string;
      content: Buffer | string;
      contentType?: string;
      cid?: string; // Content-ID for inline images
    }>;
  }): Promise<boolean> {
    if (!this.transporter) {
      console.warn(
        "[EmailService] Cannot send email - transporter not configured",
      );
      return false;
    }

    const from = this.configService.get("SMTP_FROM") || "noreply@vms.local";

    try {
      console.log(
        "[EmailService] Sending email to:",
        options.to,
        "subject:",
        options.subject,
        "attachments:",
        options.attachments?.length || 0,
      );

      // Convert attachments to nodemailer format
      const nodemailerAttachments = options.attachments?.map((att) => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType,
        cid: att.cid, // For inline images: <img src="cid:xxx">
      }));

      const result = await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: nodemailerAttachments,
      });
      console.log(
        "[EmailService] Email sent successfully, messageId:",
        result.messageId,
      );
      return true;
    } catch (e) {
      console.error(
        "[EmailService] Failed to send email:",
        e instanceof Error ? e.message : e,
      );
      return false;
    }
  }

  async sendVisitorArrival(
    to: string,
    visitorName: string,
    visitorCompany: string,
    purpose: string,
  ): Promise<boolean> {
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
      subject: "Password Reset - Arafat VMS",
      html,
    });
  }
}
