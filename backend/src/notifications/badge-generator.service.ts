import { Injectable } from "@nestjs/common";
import * as QRCode from "qrcode";

interface VisitorBadgeData {
  visitorName: string;
  visitorCompany?: string;
  hostName: string;
  hostCompany: string;
  location: string;
  purpose: string;
  sessionId: string;
  visitDate: Date;
  badgeId?: string;
}

// Canvas types (loaded dynamically)
type Canvas = import("canvas").Canvas;
type CanvasRenderingContext2D = import("canvas").CanvasRenderingContext2D;

@Injectable()
export class BadgeGeneratorService {
  private readonly WIDTH = 1080;
  private readonly HEIGHT = 1920;
  private canvasModule: typeof import("canvas") | null = null;

  private async getCanvasModule(): Promise<typeof import("canvas")> {
    if (!this.canvasModule) {
      try {
        // Dynamic import to avoid crashing server if canvas native deps aren't available
        this.canvasModule = await import("canvas");
        console.log("[BadgeGenerator] Canvas module loaded successfully");
      } catch (e) {
        console.error("[BadgeGenerator] Failed to load canvas module:", e);
        throw new Error("Canvas module not available - native dependencies may be missing");
      }
    }
    return this.canvasModule;
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.getCanvasModule();
      return true;
    } catch {
      return false;
    }
  }

  async generateVisitorBadge(data: VisitorBadgeData): Promise<string> {
    const canvasModule = await this.getCanvasModule();
    const { createCanvas, loadImage } = canvasModule;

    const canvas = createCanvas(this.WIDTH, this.HEIGHT);
    const ctx = canvas.getContext("2d");

    // Background - white
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

    // Header background - gradient blue
    const headerGradient = ctx.createLinearGradient(0, 0, this.WIDTH, 200);
    headerGradient.addColorStop(0, "#1E3A8A"); // blue-900
    headerGradient.addColorStop(1, "#3B82F6"); // blue-500
    ctx.fillStyle = headerGradient;
    ctx.fillRect(0, 0, this.WIDTH, 200);

    // Company name in header
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("ARAFAT GROUP", this.WIDTH / 2, 80);

    // Subtitle
    ctx.font = "32px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillText("Visitor Management System", this.WIDTH / 2, 130);

    // Horizontal line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 160);
    ctx.lineTo(this.WIDTH - 100, 160);
    ctx.stroke();

    // VISITOR PASS label
    ctx.fillStyle = "#1E3A8A";
    ctx.font = "bold 36px Arial";
    ctx.fillText("VISITOR PASS", this.WIDTH / 2, 280);

    // Visitor name
    ctx.fillStyle = "#111827";
    ctx.font = "bold 64px Arial";
    const visitorName = this.truncateText(ctx, data.visitorName.toUpperCase(), this.WIDTH - 100);
    ctx.fillText(visitorName, this.WIDTH / 2, 380);

    // Visitor company (if available)
    if (data.visitorCompany) {
      ctx.fillStyle = "#6B7280";
      ctx.font = "36px Arial";
      ctx.fillText(data.visitorCompany, this.WIDTH / 2, 440);
    }

    // Generate QR code
    const qrSize = 500;
    const qrY = 500;
    try {
      const qrDataUrl = await QRCode.toDataURL(data.sessionId, {
        width: qrSize,
        margin: 2,
        color: {
          dark: "#1E3A8A",
          light: "#FFFFFF",
        },
      });
      const qrImage = await loadImage(qrDataUrl);

      // QR code background box
      ctx.fillStyle = "#F3F4F6";
      ctx.beginPath();
      this.roundRect(ctx, (this.WIDTH - qrSize - 60) / 2, qrY - 30, qrSize + 60, qrSize + 60, 20);
      ctx.fill();

      // Draw QR code
      ctx.drawImage(qrImage, (this.WIDTH - qrSize) / 2, qrY, qrSize, qrSize);
    } catch (e) {
      console.error("[BadgeGenerator] QR generation error:", e);
    }

    // Instruction text
    ctx.fillStyle = "#6B7280";
    ctx.font = "28px Arial";
    ctx.fillText("Scan this QR code at reception for check-in", this.WIDTH / 2, qrY + qrSize + 80);

    // Details section background
    const detailsY = qrY + qrSize + 140;
    ctx.fillStyle = "#F9FAFB";
    ctx.fillRect(60, detailsY, this.WIDTH - 120, 340);

    // Details content
    ctx.textAlign = "left";
    const leftX = 120;
    const rightX = this.WIDTH / 2 + 40;
    let currentY = detailsY + 60;

    // Host info
    this.drawDetailRow(ctx, leftX, currentY, "HOST", data.hostName);
    this.drawDetailRow(ctx, rightX, currentY, "COMPANY", data.hostCompany);
    currentY += 80;

    // Location and Purpose
    this.drawDetailRow(ctx, leftX, currentY, "LOCATION", this.formatLocation(data.location));
    this.drawDetailRow(ctx, rightX, currentY, "PURPOSE", data.purpose);
    currentY += 80;

    // Date
    this.drawDetailRow(ctx, leftX, currentY, "DATE", this.formatDate(data.visitDate));
    this.drawDetailRow(ctx, rightX, currentY, "TIME", this.formatTime(data.visitDate));

    // Footer
    const footerY = this.HEIGHT - 200;

    // Status badge
    ctx.fillStyle = "#10B981"; // green
    ctx.beginPath();
    this.roundRect(ctx, this.WIDTH / 2 - 100, footerY, 200, 50, 25);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("ACTIVE", this.WIDTH / 2, footerY + 35);

    // Badge ID
    const badgeId = data.badgeId || data.sessionId.substring(0, 12).toUpperCase();
    ctx.fillStyle = "#9CA3AF";
    ctx.font = "24px Arial";
    ctx.fillText(`Badge ID: ${badgeId}`, this.WIDTH / 2, footerY + 100);

    // Footer line
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, this.HEIGHT - 60);
    ctx.lineTo(this.WIDTH - 100, this.HEIGHT - 60);
    ctx.stroke();

    // Copyright
    ctx.fillStyle = "#D1D5DB";
    ctx.font = "20px Arial";
    ctx.fillText("Powered by Arafat Visitor Management", this.WIDTH / 2, this.HEIGHT - 30);

    // Return base64 without the data URL prefix
    const dataUrl = canvas.toDataURL("image/png");
    return dataUrl.replace(/^data:image\/png;base64,/, "");
  }

  private drawDetailRow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    label: string,
    value: string,
  ) {
    // Label
    ctx.fillStyle = "#9CA3AF";
    ctx.font = "22px Arial";
    ctx.fillText(label, x, y);

    // Value
    ctx.fillStyle = "#374151";
    ctx.font = "bold 28px Arial";
    const truncatedValue = this.truncateText(ctx, value, 400);
    ctx.fillText(truncatedValue, x, y + 35);
  }

  private truncateText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
  ): string {
    const metrics = ctx.measureText(text);
    if (metrics.width <= maxWidth) return text;

    let truncated = text;
    while (ctx.measureText(truncated + "...").width > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + "...";
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }

  private formatLocation(location: string): string {
    const locations: Record<string, string> = {
      BARWA_TOWERS: "Barwa Towers",
      MARINA_50: "Marina 50",
      ELEMENT_MARIOTT: "Element Marriott",
    };
    return locations[location] || location;
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  private formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}
