import { Controller, Post, Body, Res, Req } from "@nestjs/common";
import { Response, Request } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { Public } from "../common/decorators/public.decorator";
import { Throttle } from "@nestjs/throttler";

@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({
    "login-account": { limit: 5, ttl: 900000 },
    "login-ip": { limit: 20, ttl: 900000 },
  })
  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);

    // Set httpOnly cookies for access and refresh tokens
    if (result.cookies?.accessToken) {
      res.cookie(
        result.cookies.accessToken.name,
        result.cookies.accessToken.value,
        result.cookies.accessToken.options,
      );
    }

    if (result.cookies?.refreshToken) {
      res.cookie(
        result.cookies.refreshToken.name,
        result.cookies.refreshToken.value,
        result.cookies.refreshToken.options,
      );
    }

    // Return response without sensitive cookie data
    return {
      token: result.token,
      user: result.user,
    };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post("refresh")
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return {
        statusCode: 401,
        message: "Refresh token not found",
      };
    }

    const result = await this.authService.refreshAccessToken(refreshToken);

    // Set new access token cookie
    if (result.cookies?.accessToken) {
      res.cookie(
        result.cookies.accessToken.name,
        result.cookies.accessToken.value,
        result.cookies.accessToken.options,
      );
    }

    return { token: result.token };
  }

  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userId = (req as any).user?.sub;
    if (userId) {
      await this.authService.revokeRefreshToken(userId);
    }

    // Clear cookies
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/api/auth" });

    return { message: "Logged out successfully" };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post("forgot-password")
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post("reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
