import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class WhatsAppService {
  private endpoint: string;
  private clientId: number;
  private whatsappClient: number;
  private apiKey: string;

  constructor(private configService: ConfigService) {
    this.endpoint = this.configService.get("WHATSAPP_ENDPOINT") || "";
    this.clientId = Number(this.configService.get("WHATSAPP_CLIENT_ID")) || 0;
    this.whatsappClient =
      Number(this.configService.get("WHATSAPP_CLIENT")) || 0;
    this.apiKey = this.configService.get("WHATSAPP_API_KEY") || "";

    console.log(
      "[WhatsAppService] Initializing with endpoint:",
      this.endpoint,
      "clientId:",
      this.clientId,
      "configured:",
      this.isConfigured(),
    );
  }

  isConfigured(): boolean {
    return !!(
      this.endpoint &&
      this.clientId &&
      this.whatsappClient &&
      this.apiKey
    );
  }

  private normalizePhone(phone: string): {
    countryCode: string;
    phoneNumber: string;
  } {
    // Normalize phone: remove non-digits, remove leading 0 or +
    const normalizedPhone = phone.replace(/\D/g, "").replace(/^0/, "");

    // Extract country code (assume first 2-3 digits if phone is long enough)
    // Default to Qatar (974) if no country code detected
    let countryCode = "974";
    let phoneNumber = normalizedPhone;

    if (normalizedPhone.startsWith("974")) {
      countryCode = "974";
      phoneNumber = normalizedPhone.slice(3);
    } else if (normalizedPhone.length > 10) {
      // Assume first 2-3 digits are country code
      countryCode = normalizedPhone.slice(0, normalizedPhone.length - 8);
      phoneNumber = normalizedPhone.slice(-8);
    }

    return { countryCode, phoneNumber };
  }

  async send(phone: string, message: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn("[WhatsAppService] Cannot send message - not configured");
      return false;
    }

    const { countryCode, phoneNumber } = this.normalizePhone(phone);
    const url = `${this.endpoint.replace(/\/$/, "")}/send_msg/`;
    console.log(
      "[WhatsAppService] Sending text to:",
      phoneNumber,
      "country:",
      countryCode,
    );

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: this.clientId,
          api_key: this.apiKey,
          whatsapp_client: this.whatsappClient,
          msg_type: 0,
          msg: message,
          phone: phoneNumber,
          country_code: countryCode,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("[WhatsAppService] API error:", res.status, text);
        return false;
      }

      const data = await res.json();
      console.log("[WhatsAppService] API response:", data);
      return data.status === 1;
    } catch (e) {
      console.error(
        "[WhatsAppService] Send error:",
        e instanceof Error ? e.message : e,
      );
      return false;
    }
  }

  async sendImage(
    phone: string,
    imageBase64: string,
    caption?: string,
  ): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn("[WhatsAppService] Cannot send image - not configured");
      return false;
    }

    const { countryCode, phoneNumber } = this.normalizePhone(phone);
    const url = `${this.endpoint.replace(/\/$/, "")}/send_msg/`;
    console.log(
      "[WhatsAppService] Sending image to:",
      phoneNumber,
      "country:",
      countryCode,
    );

    try {
      // Convert base64 to Buffer and create Blob
      const imageBuffer = Buffer.from(imageBase64, "base64");
      const imageBlob = new Blob([imageBuffer], { type: "image/png" });

      // Create FormData using native Node.js FormData (available in Node 18+)
      const formData = new FormData();

      formData.append("client_id", this.clientId.toString());
      formData.append("api_key", this.apiKey);
      formData.append("whatsapp_client", this.whatsappClient.toString());
      formData.append("msg_type", "1"); // Image type
      formData.append("msg", caption || "");
      formData.append("phone", phoneNumber);
      formData.append("country_code", countryCode);
      formData.append("file", imageBlob, "qrcode.png");

      console.log("[WhatsAppService] Sending image via native FormData...");

      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const responseText = await res.text();
      console.log(
        "[WhatsAppService] Response status:",
        res.status,
        "body:",
        responseText,
      );

      if (!res.ok) {
        console.error(
          "[WhatsAppService] Image API error:",
          res.status,
          responseText,
        );
        return false;
      }

      try {
        const data = JSON.parse(responseText);
        console.log("[WhatsAppService] Image API response parsed:", data);
        return data.status === 1;
      } catch {
        console.error("[WhatsAppService] Failed to parse response as JSON");
        return false;
      }
    } catch (e) {
      console.error(
        "[WhatsAppService] Send image error:",
        e instanceof Error ? `${e.message}\n${e.stack}` : e,
      );
      return false;
    }
  }

  async sendVisitorArrival(
    phone: string,
    visitorName: string,
    visitorCompany: string,
  ): Promise<boolean> {
    const message = `Visitor arrived: ${visitorName} from ${visitorCompany}. Please meet at reception.`;
    return this.send(phone, message);
  }

  async sendVisitorCheckin(
    phone: string,
    visitorName: string,
    visitorCompany: string,
    purpose: string,
    location: string,
    checkInTime: string,
    badgeId: string,
  ): Promise<boolean> {
    const message =
      `*VISITOR ARRIVAL NOTICE*\n\n` +
      `*${visitorName}* has checked in and is waiting for you at reception.\n\n` +
      `*Visitor:* ${visitorName}\n` +
      `*Company:* ${visitorCompany || "N/A"}\n` +
      `*Purpose:* ${purpose || "Visit"}\n` +
      `*Location:* ${location}\n` +
      `*Check-in:* ${checkInTime}\n` +
      `*Badge:* #${badgeId}\n\n` +
      `Please proceed to reception to meet your visitor.\n\n` +
      `───────────────────\n` +
      `_Powered by Arafat Visitor Management System_`;
    return this.send(phone, message);
  }
}
