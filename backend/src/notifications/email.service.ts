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
        <div style="background: linear-gradient(135deg, #059669, #10B981); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">VISITOR ARRIVAL</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Arafat Visitor Management System</p>
        </div>
        <div style="padding: 40px 30px; background: #f9fafb;">
          <h2 style="color: #1E3A8A; margin-top: 0;">Hello ${hostName},</h2>
          <p style="color: #374151; line-height: 1.6;">Your visitor has arrived and is waiting at reception.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0; background: white; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 16px; color: #6b7280; font-size: 12px; font-weight: bold; text-transform: uppercase; width: 120px;">Visitor</td>
              <td style="padding: 12px 16px; color: #111827; font-weight: 600;">${visitorName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 16px; color: #6b7280; font-size: 12px; font-weight: bold; text-transform: uppercase;">Company</td>
              <td style="padding: 12px 16px; color: #111827;">${visitorCompany || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 16px; color: #6b7280; font-size: 12px; font-weight: bold; text-transform: uppercase;">Purpose</td>
              <td style="padding: 12px 16px; color: #111827;">${purpose || "Visit"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 16px; color: #6b7280; font-size: 12px; font-weight: bold; text-transform: uppercase;">Location</td>
              <td style="padding: 12px 16px; color: #111827;">${location}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 16px; color: #6b7280; font-size: 12px; font-weight: bold; text-transform: uppercase;">Check-in</td>
              <td style="padding: 12px 16px; color: #111827;">${checkInTime}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; color: #6b7280; font-size: 12px; font-weight: bold; text-transform: uppercase;">Badge ID</td>
              <td style="padding: 12px 16px; color: #1E3A8A; font-weight: 600;">#${badgeId}</td>
            </tr>
          </table>
          <p style="color: #374151; line-height: 1.6;">Please proceed to reception to meet your visitor at your earliest convenience.</p>
        </div>
        <div style="padding: 20px; text-align: center; background: #1E3A8A; color: rgba(255,255,255,0.8); font-size: 13px;">
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1E3A8A, #3B82F6); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">PASSWORD RESET</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Arafat Visitor Management System</p>
        </div>
        <div style="padding: 40px 30px; background: #f9fafb;">
          <h2 style="color: #1E3A8A; margin-top: 0;">Hello!</h2>
          <p style="color: #374151; line-height: 1.6;">We received a request to reset your password for your Arafat VMS account.</p>
          <p style="color: #374151; line-height: 1.6;">Click the button below to set a new password:</p>
          <div style="text-align: center; padding: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #1E3A8A, #3B82F6); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset Password</a>
          </div>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">Or copy and paste this link into your browser:</p>
          <p style="color: #3B82F6; font-size: 13px; word-break: break-all; background: #e5e7eb; padding: 12px; border-radius: 6px;">${resetUrl}</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 13px; margin: 0;">⏱ This link expires in <strong>1 hour</strong>.</p>
            <p style="color: #9ca3af; font-size: 13px; margin: 8px 0 0 0;">If you didn't request this password reset, you can safely ignore this email.</p>
          </div>
        </div>
        <div style="padding: 20px; text-align: center; background: #1E3A8A; color: rgba(255,255,255,0.8); font-size: 13px;">
          Powered by Arafat Visitor Management System
        </div>
      </div>
    `;
    return this.send({
      to,
      subject: "Password Reset - Arafat VMS",
      html,
    });
  }
}
