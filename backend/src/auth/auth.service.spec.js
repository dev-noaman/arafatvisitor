"use strict";
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@nestjs/testing");
var common_1 = require("@nestjs/common");
var jwt_1 = require("@nestjs/jwt");
var config_1 = require("@nestjs/config");
var bcrypt = require("bcrypt");
var auth_service_1 = require("./auth.service");
var prisma_service_1 = require("../prisma/prisma.service");
var email_service_1 = require("../notifications/email.service");
var jest_mock_extended_1 = require("jest-mock-extended");
// Mock bcrypt to avoid real hashing in tests
jest.mock('bcrypt', function () { return ({
    compare: jest.fn(),
    hash: jest.fn(),
}); });
describe('AuthService', function () {
    var service;
    var prismaMock;
    var jwtServiceMock;
    var configServiceMock;
    var emailServiceMock;
    var bcryptCompareMock;
    var bcryptHashMock;
    // Test data fixtures
    var mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword123',
        role: 'HOST',
        hostId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    var mockHost = {
        id: 1,
        userId: 1,
        department: 'Engineering',
        building: 'Main',
        floor: 3,
        desk: 'A1',
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var module;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Reset all mocks before each test
                    jest.clearAllMocks();
                    // Get bcrypt mock functions
                    bcryptCompareMock = bcrypt.compare;
                    bcryptHashMock = bcrypt.hash;
                    return [4 /*yield*/, testing_1.Test.createTestingModule({
                            providers: [
                                auth_service_1.AuthService,
                                {
                                    provide: prisma_service_1.PrismaService,
                                    useValue: (0, jest_mock_extended_1.mockDeep)(),
                                },
                                {
                                    provide: jwt_1.JwtService,
                                    useValue: (0, jest_mock_extended_1.mockDeep)(),
                                },
                                {
                                    provide: config_1.ConfigService,
                                    useValue: (0, jest_mock_extended_1.mockDeep)(),
                                },
                                {
                                    provide: email_service_1.EmailService,
                                    useValue: (0, jest_mock_extended_1.mockDeep)(),
                                },
                            ],
                        }).compile()];
                case 1:
                    module = _a.sent();
                    service = module.get(auth_service_1.AuthService);
                    prismaMock = module.get(prisma_service_1.PrismaService);
                    jwtServiceMock = module.get(jwt_1.JwtService);
                    configServiceMock = module.get(config_1.ConfigService);
                    emailServiceMock = module.get(email_service_1.EmailService);
                    // Setup default config values
                    configServiceMock.get.mockImplementation(function (key) {
                        var config = {
                            'JWT_EXPIRES_IN': '24h',
                            'ADMIN_URL': 'http://localhost:3000/admin',
                        };
                        return config[key];
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    describe('login', function () {
        it('should successfully login with valid credentials', function () { return __awaiter(void 0, void 0, void 0, function () {
            var loginDto, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        loginDto = { email: 'test@example.com', password: 'password123' };
                        // Mock Prisma to return user with host
                        prismaMock.user.findUnique.mockResolvedValue(__assign(__assign({}, mockUser), { host: mockHost }));
                        // Mock bcrypt to return true for password match
                        bcryptCompareMock.mockResolvedValue(true);
                        // Mock JWT service to return a token
                        jwtServiceMock.sign.mockReturnValue('jwt-token-123');
                        return [4 /*yield*/, service.login(loginDto)];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
                            where: { email: 'test@example.com' },
                            include: { host: true },
                        });
                        expect(bcryptCompareMock).toHaveBeenCalledWith('password123', 'hashedPassword123');
                        expect(jwtServiceMock.sign).toHaveBeenCalledWith({ sub: 1, email: 'test@example.com', role: 'HOST' }, { expiresIn: '24h' });
                        expect(result).toEqual({
                            token: 'jwt-token-123',
                            user: {
                                id: 1,
                                email: 'test@example.com',
                                name: 'Test User',
                                role: 'HOST',
                                hostId: 1,
                            },
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw UnauthorizedException when user not found', function () { return __awaiter(void 0, void 0, void 0, function () {
            var loginDto;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        loginDto = { email: 'nonexistent@example.com', password: 'password123' };
                        prismaMock.user.findUnique.mockResolvedValue(null);
                        // Act & Assert
                        return [4 /*yield*/, expect(service.login(loginDto)).rejects.toThrow(common_1.UnauthorizedException)];
                    case 1:
                        // Act & Assert
                        _a.sent();
                        return [4 /*yield*/, expect(service.login(loginDto)).rejects.toThrow('Invalid credentials')];
                    case 2:
                        _a.sent();
                        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
                            where: { email: 'nonexistent@example.com' },
                            include: { host: true },
                        });
                        expect(bcryptCompareMock).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw UnauthorizedException when password does not match', function () { return __awaiter(void 0, void 0, void 0, function () {
            var loginDto;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        loginDto = { email: 'test@example.com', password: 'wrongpassword' };
                        prismaMock.user.findUnique.mockResolvedValue(__assign(__assign({}, mockUser), { host: mockHost }));
                        bcryptCompareMock.mockResolvedValue(false);
                        // Act & Assert
                        return [4 /*yield*/, expect(service.login(loginDto)).rejects.toThrow(common_1.UnauthorizedException)];
                    case 1:
                        // Act & Assert
                        _a.sent();
                        return [4 /*yield*/, expect(service.login(loginDto)).rejects.toThrow('Invalid credentials')];
                    case 2:
                        _a.sent();
                        expect(bcryptCompareMock).toHaveBeenCalledWith('wrongpassword', 'hashedPassword123');
                        expect(jwtServiceMock.sign).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should convert email to lowercase before querying', function () { return __awaiter(void 0, void 0, void 0, function () {
            var loginDto;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        loginDto = { email: 'Test@Example.COM', password: 'password123' };
                        prismaMock.user.findUnique.mockResolvedValue(__assign(__assign({}, mockUser), { host: mockHost }));
                        bcryptCompareMock.mockResolvedValue(true);
                        jwtServiceMock.sign.mockReturnValue('jwt-token');
                        // Act
                        return [4 /*yield*/, service.login(loginDto)];
                    case 1:
                        // Act
                        _a.sent();
                        // Assert
                        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
                            where: { email: 'test@example.com' }, // Lowercased
                            include: { host: true },
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle user without host association', function () { return __awaiter(void 0, void 0, void 0, function () {
            var loginDto, adminUser, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        loginDto = { email: 'admin@example.com', password: 'password123' };
                        adminUser = __assign(__assign({}, mockUser), { id: 2, role: 'ADMIN', hostId: null });
                        prismaMock.user.findUnique.mockResolvedValue(__assign(__assign({}, adminUser), { host: null }));
                        bcryptCompareMock.mockResolvedValue(true);
                        jwtServiceMock.sign.mockReturnValue('jwt-token');
                        return [4 /*yield*/, service.login(loginDto)];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(result.user.hostId).toBeNull();
                        expect(result.user.role).toBe('ADMIN');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('forgotPassword', function () {
        it('should send reset email when user exists', function () { return __awaiter(void 0, void 0, void 0, function () {
            var forgotPasswordDto, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        forgotPasswordDto = { email: 'test@example.com' };
                        prismaMock.user.findUnique.mockResolvedValue(mockUser);
                        jwtServiceMock.sign.mockReturnValue('reset-token-123');
                        emailServiceMock.sendPasswordReset.mockResolvedValue(true);
                        return [4 /*yield*/, service.forgotPassword(forgotPasswordDto)];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
                            where: { email: 'test@example.com' },
                        });
                        expect(jwtServiceMock.sign).toHaveBeenCalledWith({ sub: 1, purpose: 'reset' }, { expiresIn: '1h' });
                        expect(emailServiceMock.sendPasswordReset).toHaveBeenCalledWith('test@example.com', 'http://localhost:3000/admin/reset-password?token=reset-token-123');
                        expect(result).toEqual({
                            message: 'If an account exists, a reset link has been sent.'
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return same message when user does not exist (security)', function () { return __awaiter(void 0, void 0, void 0, function () {
            var forgotPasswordDto, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        forgotPasswordDto = { email: 'nonexistent@example.com' };
                        prismaMock.user.findUnique.mockResolvedValue(null);
                        return [4 /*yield*/, service.forgotPassword(forgotPasswordDto)];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
                            where: { email: 'nonexistent@example.com' },
                        });
                        expect(jwtServiceMock.sign).not.toHaveBeenCalled();
                        expect(emailServiceMock.sendPasswordReset).not.toHaveBeenCalled();
                        expect(result).toEqual({
                            message: 'If an account exists, a reset link has been sent.'
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle email service errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var forgotPasswordDto, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        forgotPasswordDto = { email: 'test@example.com' };
                        prismaMock.user.findUnique.mockResolvedValue(mockUser);
                        jwtServiceMock.sign.mockReturnValue('reset-token');
                        emailServiceMock.sendPasswordReset.mockRejectedValue(new Error('SMTP error'));
                        return [4 /*yield*/, service.forgotPassword(forgotPasswordDto)];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(emailServiceMock.sendPasswordReset).toHaveBeenCalled();
                        expect(result).toEqual({
                            message: 'If an account exists, a reset link has been sent.'
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should use custom ADMIN_URL from config', function () { return __awaiter(void 0, void 0, void 0, function () {
            var forgotPasswordDto;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        forgotPasswordDto = { email: 'test@example.com' };
                        prismaMock.user.findUnique.mockResolvedValue(mockUser);
                        jwtServiceMock.sign.mockReturnValue('reset-token');
                        emailServiceMock.sendPasswordReset.mockResolvedValue(true);
                        configServiceMock.get.mockImplementation(function (key) {
                            var config = {
                                'ADMIN_URL': 'https://admin.example.com',
                            };
                            return config[key];
                        });
                        // Act
                        return [4 /*yield*/, service.forgotPassword(forgotPasswordDto)];
                    case 1:
                        // Act
                        _a.sent();
                        // Assert
                        expect(emailServiceMock.sendPasswordReset).toHaveBeenCalledWith('test@example.com', 'https://admin.example.com/reset-password?token=reset-token');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should convert email to lowercase before querying', function () { return __awaiter(void 0, void 0, void 0, function () {
            var forgotPasswordDto;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        forgotPasswordDto = { email: 'Test@Example.COM' };
                        prismaMock.user.findUnique.mockResolvedValue(mockUser);
                        jwtServiceMock.sign.mockReturnValue('reset-token');
                        emailServiceMock.sendPasswordReset.mockResolvedValue(true);
                        // Act
                        return [4 /*yield*/, service.forgotPassword(forgotPasswordDto)];
                    case 1:
                        // Act
                        _a.sent();
                        // Assert
                        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
                            where: { email: 'test@example.com' },
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('resetPassword', function () {
        it('should successfully reset password with valid token', function () { return __awaiter(void 0, void 0, void 0, function () {
            var resetPasswordDto, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        resetPasswordDto = {
                            token: 'valid-reset-token',
                            newPassword: 'newPassword123',
                        };
                        jwtServiceMock.verify.mockReturnValue({
                            sub: 1,
                            purpose: 'reset',
                        });
                        bcryptHashMock.mockResolvedValue('new-hashed-password');
                        prismaMock.user.update.mockResolvedValue(mockUser);
                        return [4 /*yield*/, service.resetPassword(resetPasswordDto)];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(jwtServiceMock.verify).toHaveBeenCalledWith('valid-reset-token');
                        expect(bcryptHashMock).toHaveBeenCalledWith('newPassword123', 12);
                        expect(prismaMock.user.update).toHaveBeenCalledWith({
                            where: { id: 1 },
                            data: { password: 'new-hashed-password' },
                        });
                        expect(result).toEqual({ message: 'Password reset successfully' });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw BadRequestException when token purpose is not reset', function () { return __awaiter(void 0, void 0, void 0, function () {
            var resetPasswordDto;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        resetPasswordDto = {
                            token: 'invalid-purpose-token',
                            newPassword: 'newPassword123',
                        };
                        jwtServiceMock.verify.mockReturnValue({
                            sub: 1,
                            purpose: 'other',
                        });
                        // Act & Assert
                        return [4 /*yield*/, expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(common_1.BadRequestException)];
                    case 1:
                        // Act & Assert
                        _a.sent();
                        return [4 /*yield*/, expect(service.resetPassword(resetPasswordDto)).rejects.toThrow('Invalid or expired reset token')];
                    case 2:
                        _a.sent();
                        expect(bcryptHashMock).not.toHaveBeenCalled();
                        expect(prismaMock.user.update).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw BadRequestException when token is expired', function () { return __awaiter(void 0, void 0, void 0, function () {
            var resetPasswordDto;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        resetPasswordDto = {
                            token: 'expired-token',
                            newPassword: 'newPassword123',
                        };
                        jwtServiceMock.verify.mockImplementation(function () {
                            throw new Error('Token expired');
                        });
                        // Act & Assert
                        return [4 /*yield*/, expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(common_1.BadRequestException)];
                    case 1:
                        // Act & Assert
                        _a.sent();
                        return [4 /*yield*/, expect(service.resetPassword(resetPasswordDto)).rejects.toThrow('Invalid or expired reset token')];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw BadRequestException when token is invalid', function () { return __awaiter(void 0, void 0, void 0, function () {
            var resetPasswordDto;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        resetPasswordDto = {
                            token: 'invalid-token',
                            newPassword: 'newPassword123',
                        };
                        jwtServiceMock.verify.mockImplementation(function () {
                            throw new Error('Invalid token');
                        });
                        // Act & Assert
                        return [4 /*yield*/, expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(common_1.BadRequestException)];
                    case 1:
                        // Act & Assert
                        _a.sent();
                        return [4 /*yield*/, expect(service.resetPassword(resetPasswordDto)).rejects.toThrow('Invalid or expired reset token')];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should hash password with correct number of rounds', function () { return __awaiter(void 0, void 0, void 0, function () {
            var resetPasswordDto;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        resetPasswordDto = {
                            token: 'valid-token',
                            newPassword: 'newPassword123',
                        };
                        jwtServiceMock.verify.mockReturnValue({
                            sub: 1,
                            purpose: 'reset',
                        });
                        bcryptHashMock.mockResolvedValue('hashed-password');
                        prismaMock.user.update.mockResolvedValue(mockUser);
                        // Act
                        return [4 /*yield*/, service.resetPassword(resetPasswordDto)];
                    case 1:
                        // Act
                        _a.sent();
                        // Assert
                        expect(bcryptHashMock).toHaveBeenCalledWith('newPassword123', 12);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('hashPassword', function () {
        it('should hash password with bcrypt', function () { return __awaiter(void 0, void 0, void 0, function () {
            var password, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        password = 'plainPassword123';
                        bcryptHashMock.mockResolvedValue('hashed-password-123');
                        return [4 /*yield*/, service.hashPassword(password)];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(bcryptHashMock).toHaveBeenCalledWith('plainPassword123', 12);
                        expect(result).toBe('hashed-password-123');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should use correct number of bcrypt rounds (12)', function () { return __awaiter(void 0, void 0, void 0, function () {
            var password;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        password = 'password';
                        bcryptHashMock.mockResolvedValue('hashed');
                        // Act
                        return [4 /*yield*/, service.hashPassword(password)];
                    case 1:
                        // Act
                        _a.sent();
                        // Assert
                        expect(bcryptHashMock).toHaveBeenCalledWith(password, 12);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
