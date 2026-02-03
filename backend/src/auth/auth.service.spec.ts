/**
 * AuthService Unit Tests
 *
 * This test file demonstrates comprehensive unit testing for the AuthService.
 * It uses mocked dependencies (Prisma, JwtService, ConfigService, EmailService)
 * to test service methods in isolation without external dependencies.
 *
 * Test Patterns Demonstrated:
 * - Mocking service dependencies using jest-mock-extended
 * - Testing successful paths
 * - Testing error paths (UnauthorizedException, BadRequestException)
 * - Testing edge cases (user not found, invalid credentials)
 * - Verifying method calls on mocks
 * - Testing asynchronous operations
 *
 * Usage as Template:
 * This file serves as a template for testing other services in the application.
 * Follow the same patterns: mock dependencies, test happy and sad paths,
 * verify mock interactions, and use descriptive test names.
 */

import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException, BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../notifications/email.service";
import { mockDeep, MockProxy, DeepMockProxy } from "jest-mock-extended";

// Mock bcrypt to avoid real hashing in tests
jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe("AuthService", () => {
  let service: AuthService;
  let prismaMock: DeepMockProxy<PrismaService>;
  let jwtServiceMock: MockProxy<JwtService>;
  let configServiceMock: MockProxy<ConfigService>;
  let emailServiceMock: MockProxy<EmailService>;
  let bcryptCompareMock: jest.Mock;
  let bcryptHashMock: jest.Mock;

  // Test data fixtures
  const mockUser = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    password: "hashedPassword123",
    role: "HOST" as const,
    hostId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockHost = {
    id: 1,
    userId: 1,
    department: "Engineering",
    building: "Main",
    floor: 3,
    desk: "A1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Get bcrypt mock functions
    bcryptCompareMock = bcrypt.compare as jest.Mock;
    bcryptHashMock = bcrypt.hash as jest.Mock;

    // Create test module with mocked dependencies
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: JwtService,
          useValue: mockDeep<JwtService>(),
        },
        {
          provide: ConfigService,
          useValue: mockDeep<ConfigService>(),
        },
        {
          provide: EmailService,
          useValue: mockDeep<EmailService>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaMock = module.get(PrismaService) as DeepMockProxy<PrismaService>;
    jwtServiceMock = module.get(JwtService);
    configServiceMock = module.get(ConfigService);
    emailServiceMock = module.get(EmailService);

    // Setup default config values
    configServiceMock.get.mockImplementation((key: string) => {
      const config: Record<string, string> = {
        JWT_EXPIRES_IN: "24h",
        ADMIN_URL: "http://localhost:3000/admin",
      };
      return config[key];
    });
  });

  describe("login", () => {
    it("should successfully login with valid credentials", async () => {
      // Arrange
      const loginDto = { email: "test@example.com", password: "password123" };

      // Mock Prisma to return user with host
      prismaMock.user.findUnique.mockResolvedValue({
        ...mockUser,
        host: mockHost,
      } as any);

      // Mock bcrypt to return true for password match
      bcryptCompareMock.mockResolvedValue(true);

      // Mock JWT service to return a token
      jwtServiceMock.sign.mockReturnValue("jwt-token-123");

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
        include: { host: true },
      });
      expect(bcryptCompareMock).toHaveBeenCalledWith(
        "password123",
        "hashedPassword123",
      );
      expect(jwtServiceMock.sign).toHaveBeenCalledWith(
        { sub: 1, email: "test@example.com", role: "HOST" },
        { expiresIn: "24h" },
      );
      expect(result).toEqual({
        token: "jwt-token-123",
        user: {
          id: 1,
          email: "test@example.com",
          name: "Test User",
          role: "HOST",
          hostId: 1,
        },
      });
    });

    it("should throw UnauthorizedException when user not found", async () => {
      // Arrange
      const loginDto = {
        email: "nonexistent@example.com",
        password: "password123",
      };
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        "Invalid credentials",
      );
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: "nonexistent@example.com" },
        include: { host: true },
      });
      expect(bcryptCompareMock).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedException when password does not match", async () => {
      // Arrange
      const loginDto = { email: "test@example.com", password: "wrongpassword" };
      prismaMock.user.findUnique.mockResolvedValue({
        ...mockUser,
        host: mockHost,
      } as any);
      bcryptCompareMock.mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        "Invalid credentials",
      );
      expect(bcryptCompareMock).toHaveBeenCalledWith(
        "wrongpassword",
        "hashedPassword123",
      );
      expect(jwtServiceMock.sign).not.toHaveBeenCalled();
    });

    it("should convert email to lowercase before querying", async () => {
      // Arrange
      const loginDto = { email: "Test@Example.COM", password: "password123" };
      prismaMock.user.findUnique.mockResolvedValue({
        ...mockUser,
        host: mockHost,
      } as any);
      bcryptCompareMock.mockResolvedValue(true);
      jwtServiceMock.sign.mockReturnValue("jwt-token");

      // Act
      await service.login(loginDto);

      // Assert
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" }, // Lowercased
        include: { host: true },
      });
    });

    it("should handle user without host association", async () => {
      // Arrange
      const loginDto = { email: "admin@example.com", password: "password123" };
      const adminUser = {
        ...mockUser,
        id: 2,
        role: "ADMIN" as const,
        hostId: null,
      };

      prismaMock.user.findUnique.mockResolvedValue({
        ...adminUser,
        host: null,
      } as any);
      bcryptCompareMock.mockResolvedValue(true);
      jwtServiceMock.sign.mockReturnValue("jwt-token");

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result.user.hostId).toBeNull();
      expect(result.user.role).toBe("ADMIN");
    });
  });

  describe("forgotPassword", () => {
    it("should send reset email when user exists", async () => {
      // Arrange
      const forgotPasswordDto = { email: "test@example.com" };
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      jwtServiceMock.sign.mockReturnValue("reset-token-123");
      emailServiceMock.sendPasswordReset.mockResolvedValue(true);

      // Act
      const result = await service.forgotPassword(forgotPasswordDto);

      // Assert
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(jwtServiceMock.sign).toHaveBeenCalledWith(
        { sub: 1, purpose: "reset" },
        { expiresIn: "1h" },
      );
      expect(emailServiceMock.sendPasswordReset).toHaveBeenCalledWith(
        "test@example.com",
        "http://localhost:3000/admin/reset-password?token=reset-token-123",
      );
      expect(result).toEqual({
        message: "If an account exists, a reset link has been sent.",
      });
    });

    it("should return same message when user does not exist (security)", async () => {
      // Arrange
      const forgotPasswordDto = { email: "nonexistent@example.com" };
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.forgotPassword(forgotPasswordDto);

      // Assert
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: "nonexistent@example.com" },
      });
      expect(jwtServiceMock.sign).not.toHaveBeenCalled();
      expect(emailServiceMock.sendPasswordReset).not.toHaveBeenCalled();
      expect(result).toEqual({
        message: "If an account exists, a reset link has been sent.",
      });
    });

    it("should handle email service errors gracefully", async () => {
      // Arrange
      const forgotPasswordDto = { email: "test@example.com" };
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      jwtServiceMock.sign.mockReturnValue("reset-token");
      emailServiceMock.sendPasswordReset.mockRejectedValue(
        new Error("SMTP error"),
      );

      // Act - should not throw, should catch error silently
      const result = await service.forgotPassword(forgotPasswordDto);

      // Assert
      expect(emailServiceMock.sendPasswordReset).toHaveBeenCalled();
      expect(result).toEqual({
        message: "If an account exists, a reset link has been sent.",
      });
    });

    it("should use custom ADMIN_URL from config", async () => {
      // Arrange
      const forgotPasswordDto = { email: "test@example.com" };
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      jwtServiceMock.sign.mockReturnValue("reset-token");
      emailServiceMock.sendPasswordReset.mockResolvedValue(true);
      configServiceMock.get.mockImplementation((key: string) => {
        const config: Record<string, string> = {
          ADMIN_URL: "https://admin.example.com",
        };
        return config[key];
      });

      // Act
      await service.forgotPassword(forgotPasswordDto);

      // Assert
      expect(emailServiceMock.sendPasswordReset).toHaveBeenCalledWith(
        "test@example.com",
        "https://admin.example.com/reset-password?token=reset-token",
      );
    });

    it("should convert email to lowercase before querying", async () => {
      // Arrange
      const forgotPasswordDto = { email: "Test@Example.COM" };
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      jwtServiceMock.sign.mockReturnValue("reset-token");
      emailServiceMock.sendPasswordReset.mockResolvedValue(true);

      // Act
      await service.forgotPassword(forgotPasswordDto);

      // Assert
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });
  });

  describe("resetPassword", () => {
    it("should successfully reset password with valid token", async () => {
      // Arrange
      const resetPasswordDto = {
        token: "valid-reset-token",
        newPassword: "newPassword123",
      };

      jwtServiceMock.verify.mockReturnValue({
        sub: 1,
        purpose: "reset",
      });
      bcryptHashMock.mockResolvedValue("new-hashed-password");
      prismaMock.user.update.mockResolvedValue(mockUser as any);

      // Act
      const result = await service.resetPassword(resetPasswordDto);

      // Assert
      expect(jwtServiceMock.verify).toHaveBeenCalledWith("valid-reset-token");
      expect(bcryptHashMock).toHaveBeenCalledWith("newPassword123", 12);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: "new-hashed-password" },
      });
      expect(result).toEqual({ message: "Password reset successfully" });
    });

    it("should throw BadRequestException when token purpose is not reset", async () => {
      // Arrange
      const resetPasswordDto = {
        token: "invalid-purpose-token",
        newPassword: "newPassword123",
      };

      jwtServiceMock.verify.mockReturnValue({
        sub: 1,
        purpose: "other",
      });

      // Act & Assert
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        "Invalid or expired reset token",
      );
      expect(bcryptHashMock).not.toHaveBeenCalled();
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException when token is expired", async () => {
      // Arrange
      const resetPasswordDto = {
        token: "expired-token",
        newPassword: "newPassword123",
      };

      jwtServiceMock.verify.mockImplementation(() => {
        throw new Error("Token expired");
      });

      // Act & Assert
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        "Invalid or expired reset token",
      );
    });

    it("should throw BadRequestException when token is invalid", async () => {
      // Arrange
      const resetPasswordDto = {
        token: "invalid-token",
        newPassword: "newPassword123",
      };

      jwtServiceMock.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      // Act & Assert
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        "Invalid or expired reset token",
      );
    });

    it("should hash password with correct number of rounds", async () => {
      // Arrange
      const resetPasswordDto = {
        token: "valid-token",
        newPassword: "newPassword123",
      };

      jwtServiceMock.verify.mockReturnValue({
        sub: 1,
        purpose: "reset",
      });
      bcryptHashMock.mockResolvedValue("hashed-password");
      prismaMock.user.update.mockResolvedValue(mockUser as any);

      // Act
      await service.resetPassword(resetPasswordDto);

      // Assert
      expect(bcryptHashMock).toHaveBeenCalledWith("newPassword123", 12);
    });
  });

  describe("hashPassword", () => {
    it("should hash password with bcrypt", async () => {
      // Arrange
      const password = "plainPassword123";
      bcryptHashMock.mockResolvedValue("hashed-password-123");

      // Act
      const result = await service.hashPassword(password);

      // Assert
      expect(bcryptHashMock).toHaveBeenCalledWith("plainPassword123", 12);
      expect(result).toBe("hashed-password-123");
    });

    it("should use correct number of bcrypt rounds (12)", async () => {
      // Arrange
      const password = "password";
      bcryptHashMock.mockResolvedValue("hashed");

      // Act
      await service.hashPassword(password);

      // Assert
      expect(bcryptHashMock).toHaveBeenCalledWith(password, 12);
    });
  });
});
