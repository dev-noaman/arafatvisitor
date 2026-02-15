import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { EmailService } from "../notifications/email.service";

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly ACCESS_TOKEN_EXPIRES = 15 * 60; // 15 minutes in seconds
  private readonly REFRESH_TOKEN_EXPIRES = 7 * 24 * 60 * 60; // 7 days in seconds

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { host: true },
    });
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Generate access token (15 min expiry)
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES,
    });

    // Generate and store refresh token (7 day expiry)
    const refreshTokenString = await this.generateRefreshToken(user.id);

    // Return both tokens (for backwards compatibility during migration)
    return {
      token: accessToken,
      refreshToken: refreshTokenString,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hostId: user.hostId,
      },
      // Cookie metadata for client
      cookies: {
        accessToken: {
          name: "access_token",
          value: accessToken,
          options: {
            httpOnly: true,
            secure: this.configService.get("NODE_ENV") === "production",
            sameSite: "strict" as const,
            path: "/",
            maxAge: this.ACCESS_TOKEN_EXPIRES * 1000,
          },
        },
        refreshToken: {
          name: "refresh_token",
          value: refreshTokenString,
          options: {
            httpOnly: true,
            secure: this.configService.get("NODE_ENV") === "production",
            sameSite: "strict" as const,
            path: "/api/auth",
            maxAge: this.REFRESH_TOKEN_EXPIRES * 1000,
          },
        },
      },
    };
  }

  private async generateRefreshToken(userId: number): Promise<string> {
    // Create a refresh token and store it in database
    const refreshTokenString = randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(refreshTokenString, 10);
    const expiresAt = new Date(Date.now() + this.REFRESH_TOKEN_EXPIRES * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: hashedToken,
        expiresAt,
      },
    });

    return refreshTokenString;
  }

  async refreshAccessToken(refreshTokenString: string) {
    try {
      const refreshToken = await this.prisma.refreshToken.findFirst({
        where: {
          expiresAt: { gt: new Date() },
          revokedAt: null,
        },
      });

      if (!refreshToken) {
        throw new UnauthorizedException("Invalid or expired refresh token");
      }

      // Verify the token matches
      const isValid = await bcrypt.compare(
        refreshTokenString,
        refreshToken.token,
      );
      if (!isValid) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      // Get user
      const user = await this.prisma.user.findUnique({
        where: { id: refreshToken.userId },
      });

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      // Generate new access token
      const payload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: this.ACCESS_TOKEN_EXPIRES,
      });

      return {
        token: accessToken,
        cookies: {
          accessToken: {
            name: "access_token",
            value: accessToken,
            options: {
              httpOnly: true,
              secure: this.configService.get("NODE_ENV") === "production",
              sameSite: "strict" as const,
              path: "/",
              maxAge: this.ACCESS_TOKEN_EXPIRES * 1000,
            },
          },
        },
      };
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  async revokeRefreshToken(userId: number) {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) {
      return { message: "If an account exists, a reset link has been sent." };
    }
    // Include password hash tail so token is invalidated after password change (one-time use)
    const resetToken = this.jwtService.sign(
      { sub: user.id, purpose: "reset", ph: user.password.slice(-10) },
      { expiresIn: "1h" },
    );
    const adminUrl =
      this.configService.get("ADMIN_URL") ||
      "https://arafatvisitor.cloud/admin";
    const resetUrl = `${adminUrl}/reset-password?token=${resetToken}`;
    await this.emailService
      .sendPasswordReset(user.email, resetUrl)
      .catch(() => {});
    return { message: "If an account exists, a reset link has been sent." };
  }

  async resetPassword(dto: ResetPasswordDto) {
    let payload: { sub: number; purpose: string; ph?: string };
    try {
      payload = this.jwtService.verify(dto.token);
    } catch {
      throw new BadRequestException("Invalid or expired reset token");
    }

    if (payload.purpose !== "reset") {
      throw new BadRequestException("Invalid token");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    // One-time use: if password hash tail doesn't match, token was already used
    if (payload.ph && user.password.slice(-10) !== payload.ph) {
      throw new BadRequestException(
        "This reset link has already been used. Please request a new one.",
      );
    }

    const hash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { password: hash },
    });
    // Revoke all refresh tokens for this user (security best practice)
    await this.revokeRefreshToken(payload.sub);
    return { message: "Password reset successfully" };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }
}
