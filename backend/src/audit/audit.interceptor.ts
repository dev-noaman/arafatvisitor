import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Request } from "express";
import { AuditService } from "./audit.service";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;
    const user = (request as Request & { user?: { id: number } }).user;
    const userId = user?.id;
    const ip = request.ip || request.socket?.remoteAddress;
    const userAgent = request.get("user-agent") || undefined;

    return next.handle().pipe(
      tap({
        next: () => {
          if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
            const url = request.url;
            let entity = "Unknown";
            const action = `${method.toLowerCase()}`;
            if (url.includes("/visits")) entity = "Visit";
            else if (url.includes("/hosts")) entity = "Host";
            else if (url.includes("/deliveries")) entity = "Delivery";
            else if (url.includes("/users")) entity = "User";
            this.auditService
              .log({
                userId,
                action: `${entity}.${action}`,
                entity,
                ip,
                userAgent,
              })
              .catch(() => {});
          }
        },
      }),
    );
  }
}
