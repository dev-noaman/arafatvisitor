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
      <div style="font-family: 'Manrope', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
        <!-- Brand Accent Bar -->
        <div style="height: 6px; width: 100%; background: #4760ff;"></div>
        <!-- Email Content -->
        <div style="padding: 32px 32px 40px 32px;">
          <!-- Logo -->
          <div style="text-align: center; margin-bottom: 32px;">
            <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
              <tr>
                <td style="background: rgba(71,96,255,0.1); padding: 8px; border-radius: 12px; vertical-align: middle;">
                  <img src="https://img.icons8.com/material-rounded/24/4760ff/building.png" alt="" width="24" height="24" style="display: block;" />
                </td>
                <td style="padding-left: 12px; vertical-align: middle;">
                  <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">Arafat Visitor</span>
                </td>
              </tr>
            </table>
          </div>
          <!-- Hero Section -->
          <div style="background: rgba(71,96,255,0.05); border-radius: 12px; padding: 40px 0; text-align: center; margin-bottom: 40px;">
            <div style="width: 80px; height: 80px; background: #ffffff; border-radius: 50%; margin: 0 auto 16px auto; line-height: 80px; font-size: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">&#127881;</div>
          </div>
          <!-- Messaging -->
          <div style="text-align: center;">
            <h2 style="font-size: 28px; font-weight: 800; color: #0f172a; line-height: 1.2; margin: 0 0 16px 0;">
              Welcome to Arafat Visitor
            </h2>
            <p style="font-weight: 600; color: #1e293b; font-size: 16px; margin: 0 0 16px 0;">Hello ${hostName},</p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
              Your account has been successfully created. We're excited to have you on board with Arafat Visitor&mdash;your new home for seamless visitor management.
            </p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 40px 0;">
              To get started and access your personalized dashboard, please set up your secure password by clicking the button below.
            </p>
            <!-- CTA Button -->
            <div style="margin-bottom: 32px;">
              <a href="${resetUrl}" style="display: inline-block; background: #4760ff; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 700;">Set Your Password &#8594;</a>
            </div>
            <!-- Divider -->
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 32px 0;" />
            <!-- Fallback Link -->
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 12px 0;">Or copy and paste this link into your browser:</p>
            <div style="background: #f5f6f8; padding: 12px; border-radius: 8px; margin-bottom: 24px;">
              <a href="${resetUrl}" style="color: #4760ff; font-size: 14px; font-weight: 500; text-decoration: underline; word-break: break-all;">${resetUrl}</a>
            </div>
            <!-- Expiry + Support -->
            <p style="color: #94a3b8; font-size: 14px; margin: 0 0 8px 0;">This link expires in <strong>72 hours</strong>.</p>
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">
              If you didn't request this account, please ignore this email.
            </p>
          </div>
        </div>
        <!-- Footer -->
        <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #f1f5f9;">
          <p style="color: #94a3b8; font-size: 12px; font-weight: 500; margin: 0;">
            &copy; ${new Date().getFullYear()} Arafat Visitor &bull; Powered by Arafat Visitor Management System
          </p>
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
      <div style="font-family: 'Manrope', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid rgba(71,96,255,0.1);">
        <!-- Branding Header -->
        <div style="padding: 40px 0 24px 0; text-align: center;">
          <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
            <tr>
              <td style="background: #4760ff; padding: 8px; border-radius: 8px; vertical-align: middle;">
                <img src="https://img.icons8.com/material-rounded/24/ffffff/shield.png" alt="" width="24" height="24" style="display: block;" />
              </td>
              <td style="padding-left: 8px; vertical-align: middle;">
                <span style="font-size: 20px; font-weight: 800; color: #0f1223; letter-spacing: -0.5px;">Arafat Visitor</span>
              </td>
            </tr>
          </table>
        </div>
        <!-- Main Content -->
        <div style="padding: 0 32px 40px 32px; text-align: center;">
          <!-- Hero Image -->
          <div style="width: 100%; height: 192px; background: linear-gradient(135deg, #4760ff, #6b7dff, #4760ff); border-radius: 12px; margin-bottom: 32px;"></div>
          <!-- Heading -->
          <h1 style="color: #101118; font-size: 28px; font-weight: 700; line-height: 1.2; margin: 0 0 16px 0;">Reset Your Password</h1>
          <!-- Description -->
          <p style="color: #5e648d; font-size: 16px; font-weight: 400; line-height: 1.6; max-width: 440px; margin: 0 auto 32px auto;">
            Hi there, we received a request to reset the password for your <span style="font-weight: 600; color: #4760ff;">Arafat Visitor</span> account. Click the button below to proceed and choose a new password.
          </p>
          <!-- CTA Button -->
          <div style="margin-bottom: 32px;">
            <a href="${resetUrl}" style="display: inline-block; min-width: 200px; background: #4760ff; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 700; letter-spacing: 0.3px;">Reset Password</a>
          </div>
          <!-- Fallback Link -->
          <div style="padding-top: 24px; border-top: 1px solid #f0f0f5;">
            <p style="color: #5e648d; font-size: 14px; font-weight: 400; margin: 0 0 12px 0;">
              If the button above doesn't work, copy and paste this link into your browser:
            </p>
            <div style="background: #f5f6f8; padding: 12px; border-radius: 8px;">
              <a href="${resetUrl}" style="color: #4760ff; font-size: 14px; font-weight: 500; text-decoration: underline; word-break: break-all;">${resetUrl}</a>
            </div>
          </div>
        </div>
        <!-- Security Footer -->
        <div style="background: rgba(245,246,248,0.5); padding: 24px 32px; text-align: center;">
          <p style="color: #5e648d; font-size: 12px; font-weight: 400; line-height: 1.5; margin: 0;">
            If you did not request a password reset, please ignore this email. This link will expire in <strong>60 minutes</strong>.
          </p>
          <p style="color: #5e648d; font-size: 12px; margin: 16px 0 0 0;">
            &copy; ${new Date().getFullYear()} Arafat Visitor &bull; Powered by Arafat Visitor Management System
          </p>
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
