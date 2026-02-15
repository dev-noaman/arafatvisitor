import { Injectable, PipeTransform } from "@nestjs/common";
import sanitizeHtml from "sanitize-html";

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any): any {
    if (typeof value === "object" && value !== null) {
      return this.sanitizeObject(value);
    }
    return value;
  }

  private sanitizeObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    if (typeof obj === "object" && obj !== null) {
      const sanitized: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          if (typeof value === "string") {
            sanitized[key] = sanitizeHtml(value, {
              allowedTags: [],
              allowedAttributes: {},
            });
          } else if (typeof value === "object" && value !== null) {
            sanitized[key] = this.sanitizeObject(value);
          } else {
            sanitized[key] = value;
          }
        }
      }
      return sanitized;
    }

    return obj;
  }
}
