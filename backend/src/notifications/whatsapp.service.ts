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
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: this.clientId,
          api_key: this.apiKey,
          whatsapp_client: this.whatsappClient,
          msg_type: 1, // Image type
          media: imageBase64, // Base64 image data
          msg: caption || "",
          phone: phoneNumber,
          country_code: countryCode,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("[WhatsAppService] Image API error:", res.status, text);
        return false;
      }

      const data = await res.json();
      console.log("[WhatsAppService] Image API response:", data);
      return data.status === 1;
    } catch (e) {
      console.error(
        "[WhatsAppService] Send image error:",
        e instanceof Error ? e.message : e,
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
}
