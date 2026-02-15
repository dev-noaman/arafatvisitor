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

      // Convert attachments to nodemailer format with inline disposition for CID images
      const nodemailerAttachments = options.attachments?.map((att) => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType,
        cid: att.cid, // For inline images: <img src="cid:xxx">
        contentDisposition: att.cid ? "inline" as const : "attachment" as const,
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
        e instanceof Error ? `${e.message}\nStack: ${e.stack}` : e,
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1E3A8A, #3B82F6); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">VISITOR ARRIVAL</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Arafat Group</p>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>You have a visitor waiting at reception.</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Visitor:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${visitorName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Company:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${visitorCompany || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0;"><strong>Purpose:</strong></td>
              <td style="padding: 10px 0;">${purpose || "Visit"}</td>
            </tr>
          </table>
          <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">Please proceed to reception to meet your visitor.</p>
        </div>
        <div style="padding: 15px; text-align: center; background: #1E3A8A; color: rgba(255,255,255,0.7); font-size: 12px;">
          Powered by Arafat Visitor Management System
        </div>
      </div>
    `;
    return this.send({
      to,
      subject: `Visitor arrived: ${visitorName}`,
      html,
    });
  }

  async sendVisitorCheckin(
    to: string,
    hostName: string,
    visitorName: string,
    visitorCompany: string,
    purpose: string,
    location: string,
    checkInTime: string,
    badgeId: string,
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1E3A8A, #3B82F6); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">VISITOR CHECK-IN</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Arafat Group</p>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1E3A8A; margin-top: 0;">Hello ${hostName}!</h2>
          <p>Your visitor has checked in and is waiting at reception.</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Visitor:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${visitorName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Company:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${visitorCompany || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Purpose:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${purpose || "Visit"}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Location:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${location}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Check-in:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${checkInTime}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0;"><strong>Badge ID:</strong></td>
              <td style="padding: 10px 0;">#${badgeId}</td>
            </tr>
          </table>
          <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">Please proceed to reception to meet your visitor.</p>
        </div>
        <div style="padding: 15px; text-align: center; background: #1E3A8A; color: rgba(255,255,255,0.7); font-size: 12px;">
          Powered by Arafat Visitor Management System
        </div>
      </div>
    `;
    return this.send({
      to,
      subject: `Visitor Checked In: ${visitorName} is waiting at reception`,
      html,
    });
  }

  async sendHostWelcome(to: string, hostName: string, resetUrl: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1E3A8A, #3B82F6); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">WELCOME TO ARAFAT VMS</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Arafat Visitor Management System</p>
        </div>
        <div style="padding: 40px 30px; background: #f9fafb;">
          <h2 style="color: #1E3A8A; margin-top: 0;">Hello ${hostName},</h2>
          <p style="color: #374151; line-height: 1.6;">A host account has been created for you on the Arafat Visitor Management System. You can now log in to view and manage visitors for your company.</p>
          <p style="color: #374151; line-height: 1.6;">To get started, please set your password by clicking the button below:</p>
          <div style="text-align: center; padding: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #1E3A8A, #3B82F6); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">Set Password</a>
          </div>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">Or copy and paste this link into your browser:</p>
          <p style="color: #3B82F6; font-size: 13px; word-break: break-all; background: #e5e7eb; padding: 12px; border-radius: 6px;">${resetUrl}</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 13px; margin: 0;">This link expires in <strong>72 hours</strong>.</p>
            <p style="color: #9ca3af; font-size: 13px; margin: 8px 0 0 0;">Once you set your password, you can log in at the admin panel to view your visitors, approve or reject visit requests, and more.</p>
          </div>
        </div>
        <div style="padding: 20px; text-align: center; background: #1E3A8A; color: rgba(255,255,255,0.8); font-size: 13px;">
          Powered by Arafat Visitor Management System
        </div>
      </div>
    `;
    return this.send({
      to,
      subject: "Welcome to Arafat VMS — Set Your Password",
      html,
    });
  }

  async sendPasswordReset(to: string, resetUrl: string): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, Helvetica, sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
  <!-- Header -->
  <tr>
    <td style="background-color: #1E3A8A; padding: 35px 40px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 1px;">PASSWORD RESET</h1>
      <p style="color: #93c5fd; margin: 8px 0 0 0; font-size: 14px;">Arafat Visitor Management System</p>
    </td>
  </tr>
  <!-- Body -->
  <tr>
    <td style="padding: 40px;">
      <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">Hello,</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 12px 0;">We received a request to reset your password for your Arafat VMS account.</p>
      <p style="color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 30px 0;">Click the button below to set a new password:</p>
      <!-- Button -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding: 0 0 30px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color: #1E3A8A; border-radius: 8px;">
                  <a href="${resetUrl}" target="_blank" style="display: inline-block; color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; padding: 16px 48px; border: 1px solid #1E3A8A; border-radius: 8px;">Reset Password</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <!-- Link -->
      <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0 0 10px 0;">Or copy and paste this link into your browser:</p>
      <p style="margin: 0 0 30px 0; padding: 14px 16px; background-color: #f1f5f9; border-radius: 8px; border: 1px solid #e2e8f0;">
        <a href="${resetUrl}" style="color: #2563eb; font-size: 13px; word-break: break-all; text-decoration: none;">${resetUrl}</a>
      </p>
      <!-- Divider -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0;">This link expires in <strong>1 hour</strong>.</p>
          <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 8px 0 0 0;">If you didn't request this password reset, you can safely ignore this email.</p>
        </td></tr>
      </table>
    </td>
  </tr>
  <!-- Footer -->
  <tr>
    <td style="background-color: #1e293b; padding: 20px 40px; text-align: center;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">Powered by Arafat Visitor Management System</p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>
    `;
    return this.send({
      to,
      subject: "Password Reset - Arafat VMS",
      html,
    });
  }
}
