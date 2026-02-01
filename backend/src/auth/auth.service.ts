import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from '../notifications/email.service';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
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
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN') || '24h',
    });
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hostId: user.hostId,
      },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) {
      return { message: 'If an account exists, a reset link has been sent.' };
    }
    const resetToken = this.jwtService.sign(
      { sub: user.id, purpose: 'reset' },
      { expiresIn: '1h' },
    );
    const adminUrl = this.configService.get('ADMIN_URL') || 'http://localhost:3000/admin';
    const resetUrl = `${adminUrl}/reset-password?token=${resetToken}`;
    await this.emailService.sendPasswordReset(user.email, resetUrl).catch(() => {});
    return { message: 'If an account exists, a reset link has been sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {
      const payload = this.jwtService.verify<{ sub: number; purpose: string }>(dto.token);
      if (payload.purpose !== 'reset') {
        throw new BadRequestException('Invalid token');
      }
      const hash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { password: hash },
      });
      return { message: 'Password reset successfully' };
    } catch {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }
}
