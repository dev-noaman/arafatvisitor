import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  Logger,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  email?: string;
}

@WebSocketGateway({
  namespace: '/dashboard',
  cors: {
    origin: [
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      'https://arafatvisitor.cloud',
    ],
    credentials: true,
  },
})
export class DashboardGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DashboardGateway.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(socket: AuthenticatedSocket) {
    try {
      // Extract and verify JWT from handshake auth
      const token = socket.handshake.auth?.token;
      if (!token) {
        this.logger.warn('Connection attempt without token');
        socket.disconnect();
        return;
      }

      try {
        const payload = this.jwtService.verify(token, {
          secret:
            this.configService.get<string>('JWT_SECRET') ||
            'fallback-secret-min-32-chars',
        });

        socket.userId = payload.sub;
        socket.email = payload.email;
        this.logger.log(
          `Dashboard client connected: ${socket.email} (${socket.id})`,
        );
      } catch (error) {
        this.logger.warn(`Invalid token in connection attempt: ${error}`);
        socket.disconnect();
        return;
      }
    } catch (error) {
      this.logger.error('Error in handleConnection:', error);
      socket.disconnect();
    }
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    this.logger.log(
      `Dashboard client disconnected: ${socket.email} (${socket.id})`,
    );
  }

  // Public methods for emitting events from other services
  emitVisitorCheckin(data: {
    visitId: string;
    visitorName: string;
    hostName: string;
    checkInAt: string;
  }) {
    this.server.emit('visitor:checkin', data);
  }

  emitVisitorApproved(data: {
    visitId: string;
    visitorName: string;
    hostName: string;
  }) {
    this.server.emit('visitor:approved', data);
  }

  emitVisitorRejected(data: {
    visitId: string;
    visitorName: string;
    reason?: string;
  }) {
    this.server.emit('visitor:rejected', data);
  }

  emitVisitorCheckout(data: {
    visitId: string;
    sessionId: string;
    visitorName: string;
  }) {
    this.server.emit('visitor:checkout', data);
  }

  emitDeliveryReceived(data: {
    deliveryId: string;
    courier: string;
    recipient: string;
  }) {
    this.server.emit('delivery:received', data);
  }

  emitDeliveryPickedup(data: { deliveryId: string; recipient: string }) {
    this.server.emit('delivery:pickedup', data);
  }

  emitDashboardRefresh() {
    this.server.emit('dashboard:refresh', {});
  }
}
