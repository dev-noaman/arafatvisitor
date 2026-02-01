"use strict";
/**
 * VisitsService Unit Tests
 *
 * This test file demonstrates comprehensive unit testing for the VisitsService.
 * It uses mocked dependencies (Prisma, QrTokenService, EmailService, WhatsAppService)
 * to test service methods in isolation without external dependencies.
 *
 * Test Patterns Demonstrated:
 * - Mocking service dependencies using jest-mock-extended
 * - Testing successful paths for all service methods
 * - Testing error paths (NotFoundException, BadRequestException, ForbiddenException)
 * - Testing edge cases (invalid host, duplicate session IDs)
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
var visits_service_1 = require("./visits.service");
var prisma_service_1 = require("../prisma/prisma.service");
var qr_token_service_1 = require("./qr-token.service");
var email_service_1 = require("../notifications/email.service");
var whatsapp_service_1 = require("../notifications/whatsapp.service");
var jest_mock_extended_1 = require("jest-mock-extended");
describe('VisitsService', function () {
    var service;
    var prismaMock;
    var qrTokenServiceMock;
    var emailServiceMock;
    var whatsappServiceMock;
    // Test data fixtures
    var mockHost = {
        id: BigInt(1),
        userId: 1,
        department: 'Engineering',
        building: 'Main',
        floor: 3,
        desk: 'A1',
        email: 'host@example.com',
        phone: '+1234567890',
        location: 'BARWA_TOWERS',
        status: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    var mockUser = {
        id: 1,
        email: 'host@example.com',
        name: 'Host User',
        password: 'hashedPassword',
        role: 'HOST',
        hostId: BigInt(1),
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    var mockVisit = {
        id: 'visit-1',
        sessionId: 'session-123',
        visitorName: 'John Doe',
        visitorCompany: 'Acme Corp',
        visitorPhone: '+9876543210',
        visitorEmail: 'john@example.com',
        hostId: BigInt(1),
        purpose: 'Meeting',
        location: 'BARWA_TOWERS',
        status: 'CHECKED_IN',
        checkInAt: new Date(),
        checkOutAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        host: mockHost,
    };
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var module;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jest.clearAllMocks();
                    return [4 /*yield*/, testing_1.Test.createTestingModule({
                            providers: [
                                visits_service_1.VisitsService,
                                {
                                    provide: prisma_service_1.PrismaService,
                                    useValue: (0, jest_mock_extended_1.mockDeep)(),
                                },
                                {
                                    provide: qr_token_service_1.QrTokenService,
                                    useValue: (0, jest_mock_extended_1.mockDeep)(),
                                },
                                {
                                    provide: email_service_1.EmailService,
                                    useValue: (0, jest_mock_extended_1.mockDeep)(),
                                },
                                {
                                    provide: whatsapp_service_1.WhatsAppService,
                                    useValue: (0, jest_mock_extended_1.mockDeep)(),
                                },
                            ],
                        }).compile()];
                case 1:
                    module = _a.sent();
                    service = module.get(visits_service_1.VisitsService);
                    prismaMock = module.get(prisma_service_1.PrismaService);
                    qrTokenServiceMock = module.get(qr_token_service_1.QrTokenService);
                    emailServiceMock = module.get(email_service_1.EmailService);
                    whatsappServiceMock = module.get(whatsapp_service_1.WhatsAppService);
                    return [2 /*return*/];
            }
        });
    }); });
    describe('create (walk-in visitor)', function () {
        it('should successfully create a visit for walk-in visitor', function () { return __awaiter(void 0, void 0, void 0, function () {
            var createDto, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        createDto = {
                            hostId: '1',
                            visitorName: 'John Doe',
                            visitorCompany: 'Acme Corp',
                            visitorPhone: '+9876543210',
                            visitorEmail: 'john@example.com',
                            purpose: 'Meeting',
                            location: 'BARWA_TOWERS',
                        };
                        prismaMock.host.findFirst.mockResolvedValue(mockHost);
                        prismaMock.visit.findUnique.mockResolvedValue(null);
                        prismaMock.visit.create.mockResolvedValue(mockVisit);
                        prismaMock.checkEvent.create.mockResolvedValue({});
                        qrTokenServiceMock.generateSessionId.mockReturnValue('session-123');
                        qrTokenServiceMock.createForVisit.mockResolvedValue({
                            token: 'qr-token-123',
                            expiresAt: new Date(),
                        });
                        emailServiceMock.sendVisitorArrival.mockResolvedValue(true);
                        whatsappServiceMock.sendVisitorArrival.mockResolvedValue(true);
                        return [4 /*yield*/, service.create(createDto)];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(prismaMock.host.findFirst).toHaveBeenCalledWith({
                            where: { id: BigInt(1), status: 1, deletedAt: null },
                        });
                        expect(prismaMock.visit.create).toHaveBeenCalledWith({
                            data: expect.objectContaining({
                                sessionId: 'session-123',
                                visitorName: 'John Doe',
                                visitorCompany: 'Acme Corp',
                                visitorPhone: '+9876543210',
                                visitorEmail: 'john@example.com',
                                hostId: BigInt(1),
                                purpose: 'Meeting',
                                location: 'BARWA_TOWERS',
                                status: 'CHECKED_IN',
                            }),
                            include: { host: true },
                        });
                        expect(prismaMock.checkEvent.create).toHaveBeenCalledWith({
                            data: expect.objectContaining({
                                type: 'CHECK_IN',
                            }),
                        });
                        expect(emailServiceMock.sendVisitorArrival).toHaveBeenCalledWith('host@example.com', 'John Doe', 'Acme Corp', 'Meeting');
                        expect(whatsappServiceMock.sendVisitorArrival).toHaveBeenCalledWith('+1234567890', 'John Doe', 'Acme Corp');
                        expect(result).toHaveProperty('sessionId', 'session-123');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw BadRequestException when host is invalid', function () { return __awaiter(void 0, void 0, void 0, function () {
            var createDto;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        createDto = {
                            hostId: '999',
                            visitorName: 'John Doe',
                            visitorCompany: 'Acme Corp',
                            visitorPhone: '+9876543210',
                            visitorEmail: 'john@example.com',
                            purpose: 'Meeting',
                            location: 'BARWA_TOWERS',
                        };
                        prismaMock.host.findFirst.mockResolvedValue(null);
                        // Act & Assert
                        return [4 /*yield*/, expect(service.create(createDto)).rejects.toThrow(common_1.BadRequestException)];
                    case 1:
                        // Act & Assert
                        _a.sent();
                        return [4 /*yield*/, expect(service.create(createDto)).rejects.toThrow('Invalid host')];
                    case 2:
                        _a.sent();
                        expect(prismaMock.visit.create).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should normalize location to BARWA_TOWERS by default', function () { return __awaiter(void 0, void 0, void 0, function () {
            var createDto;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        createDto = {
                            hostId: '1',
                            visitorName: 'John Doe',
                            visitorCompany: 'Acme Corp',
                            visitorPhone: '+9876543210',
                            visitorEmail: 'john@example.com',
                            purpose: 'Meeting',
                            location: 'unknown location',
                        };
                        prismaMock.host.findFirst.mockResolvedValue(mockHost);
                        prismaMock.visit.findUnique.mockResolvedValue(null);
                        prismaMock.visit.create.mockResolvedValue(mockVisit);
                        prismaMock.checkEvent.create.mockResolvedValue({});
                        qrTokenServiceMock.generateSessionId.mockReturnValue('session-123');
                        qrTokenServiceMock.createForVisit.mockResolvedValue({
                            token: 'qr-token-123',
                            expiresAt: new Date(),
                        });
                        emailServiceMock.sendVisitorArrival.mockResolvedValue(true);
                        whatsappServiceMock.sendVisitorArrival.mockResolvedValue(true);
                        // Act
                        return [4 /*yield*/, service.create(createDto)];
                    case 1:
                        // Act
                        _a.sent();
                        // Assert
                        expect(prismaMock.visit.create).toHaveBeenCalledWith(expect.objectContaining({
                            data: expect.objectContaining({
                                location: 'BARWA_TOWERS',
                            }),
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle missing host email and phone gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var hostNoContact, createDto, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hostNoContact = __assign(__assign({}, mockHost), { email: null, phone: null });
                        createDto = {
                            hostId: '1',
                            visitorName: 'John Doe',
                            visitorCompany: 'Acme Corp',
                            visitorPhone: '+9876543210',
                            visitorEmail: 'john@example.com',
                            purpose: 'Meeting',
                            location: 'BARWA_TOWERS',
                        };
                        prismaMock.host.findFirst.mockResolvedValue(hostNoContact);
                        prismaMock.visit.findUnique.mockResolvedValue(null);
                        prismaMock.visit.create.mockResolvedValue(mockVisit);
                        prismaMock.checkEvent.create.mockResolvedValue({});
                        qrTokenServiceMock.generateSessionId.mockReturnValue('session-123');
                        qrTokenServiceMock.createForVisit.mockResolvedValue({
                            token: 'qr-token-123',
                            expiresAt: new Date(),
                        });
                        return [4 /*yield*/, service.create(createDto)];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(emailServiceMock.sendVisitorArrival).not.toHaveBeenCalled();
                        expect(whatsappServiceMock.sendVisitorArrival).not.toHaveBeenCalled();
                        expect(result).toHaveProperty('sessionId', 'session-123');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('preRegister', function () {
        it('should successfully pre-register a visit', function () { return __awaiter(void 0, void 0, void 0, function () {
            var preRegisterDto, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        preRegisterDto = {
                            visitorName: 'Jane Smith',
                            visitorCompany: 'Tech Corp',
                            visitorPhone: '+9876543211',
                            visitorEmail: 'jane@example.com',
                            purpose: 'Interview',
                            expectedDate: '2026-02-01T10:00:00Z',
                        };
                        prismaMock.user.findUnique.mockResolvedValue(mockUser);
                        prismaMock.host.findFirst.mockResolvedValue(mockHost);
                        prismaMock.visit.findUnique.mockResolvedValue(null);
                        prismaMock.visit.create.mockResolvedValue(__assign(__assign({}, mockVisit), { id: 'visit-2', sessionId: 'session-456', status: 'PENDING_APPROVAL' }));
                        qrTokenServiceMock.generateSessionId.mockReturnValue('session-456');
                        return [4 /*yield*/, service.preRegister(preRegisterDto, 1)];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
                            where: { id: 1 },
                            include: { host: true },
                        });
                        expect(prismaMock.visit.create).toHaveBeenCalledWith({
                            data: expect.objectContaining({
                                sessionId: 'session-456',
                                visitorName: 'Jane Smith',
                                visitorCompany: 'Tech Corp',
                                visitorPhone: '+9876543211',
                                visitorEmail: 'jane@example.com',
                                purpose: 'Interview',
                                status: 'PENDING_APPROVAL',
                                preRegisteredById: '1',
                            }),
                            include: { host: true },
                        });
                        expect(result).toHaveProperty('status', 'PENDING_APPROVAL');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw ForbiddenException when user is not a host', function () { return __awaiter(void 0, void 0, void 0, function () {
            var preRegisterDto, nonHostUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        preRegisterDto = {
                            visitorName: 'Jane Smith',
                            visitorCompany: 'Tech Corp',
                            visitorPhone: '+9876543211',
                            visitorEmail: 'jane@example.com',
                            purpose: 'Interview',
                        };
                        nonHostUser = __assign(__assign({}, mockUser), { hostId: null });
                        prismaMock.user.findUnique.mockResolvedValue(nonHostUser);
                        // Act & Assert
                        return [4 /*yield*/, expect(service.preRegister(preRegisterDto, 1)).rejects.toThrow(common_1.ForbiddenException)];
                    case 1:
                        // Act & Assert
                        _a.sent();
                        return [4 /*yield*/, expect(service.preRegister(preRegisterDto, 1)).rejects.toThrow('Host account required')];
                    case 2:
                        _a.sent();
                        expect(prismaMock.visit.create).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should use host location when available', function () { return __awaiter(void 0, void 0, void 0, function () {
            var preRegisterDto, hostWithLocation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        preRegisterDto = {
                            visitorName: 'Jane Smith',
                            visitorCompany: 'Tech Corp',
                            visitorPhone: '+9876543211',
                            visitorEmail: 'jane@example.com',
                            purpose: 'Interview',
                        };
                        hostWithLocation = __assign(__assign({}, mockHost), { location: 'MARINA_50' });
                        prismaMock.user.findUnique.mockResolvedValue(mockUser);
                        prismaMock.host.findFirst.mockResolvedValue(hostWithLocation);
                        prismaMock.visit.findUnique.mockResolvedValue(null);
                        prismaMock.visit.create.mockResolvedValue(mockVisit);
                        qrTokenServiceMock.generateSessionId.mockReturnValue('session-456');
                        // Act
                        return [4 /*yield*/, service.preRegister(preRegisterDto, 1)];
                    case 1:
                        // Act
                        _a.sent();
                        // Assert
                        expect(prismaMock.visit.create).toHaveBeenCalledWith(expect.objectContaining({
                            data: expect.objectContaining({
                                location: 'MARINA_50',
                            }),
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getPending', function () {
        it('should return pending visits for a host', function () { return __awaiter(void 0, void 0, void 0, function () {
            var pendingVisits, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pendingVisits = [
                            __assign(__assign({}, mockVisit), { id: 'visit-1', status: 'PENDING_APPROVAL' }),
                            __assign(__assign({}, mockVisit), { id: 'visit-2', status: 'PENDING_APPROVAL' }),
                        ];
                        prismaMock.user.findUnique.mockResolvedValue(mockUser);
                        prismaMock.visit.findMany.mockResolvedValue(pendingVisits);
                        return [4 /*yield*/, service.getPending(1)];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
                        expect(prismaMock.visit.findMany).toHaveBeenCalledWith({
                            where: {
                                hostId: BigInt(1),
                                status: 'PENDING_APPROVAL',
                            },
                            include: { host: true },
                            orderBy: { createdAt: 'desc' },
                        });
                        expect(result).toHaveLength(2);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return empty array for non-host user', function () { return __awaiter(void 0, void 0, void 0, function () {
            var nonHostUser, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nonHostUser = __assign(__assign({}, mockUser), { hostId: null });
                        prismaMock.user.findUnique.mockResolvedValue(nonHostUser);
                        return [4 /*yield*/, service.getPending(1)];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(prismaMock.visit.findMany).not.toHaveBeenCalled();
                        expect(result).toEqual([]);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('approve', function () {
        it('should successfully approve a pending visit', function () { return __awaiter(void 0, void 0, void 0, function () {
            var pendingVisit, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pendingVisit = __assign(__assign({}, mockVisit), { status: 'PENDING_APPROVAL' });
                        prismaMock.visit.findUnique.mockResolvedValue(pendingVisit);
                        prismaMock.user.findUnique.mockResolvedValue(mockUser);
                        prismaMock.visit.update.mockResolvedValue(__assign(__assign({}, pendingVisit), { status: 'APPROVED' }));
                        emailServiceMock.send.mockResolvedValue(true);
                        return [4 /*yield*/, service.approve('visit-1', 1)];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(prismaMock.visit.update).toHaveBeenCalledWith({
                            where: { id: 'visit-1' },
                            data: expect.objectContaining({
                                status: 'APPROVED',
                            }),
                        });
                        expect(emailServiceMock.send).toHaveBeenCalledWith({
                            to: 'john@example.com',
                            subject: 'Visit Approved',
                            html: expect.stringContaining('has been approved'),
                        });
                        expect(result).toHaveProperty('status');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw NotFoundException when visit not found', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Arrange
                        prismaMock.visit.findUnique.mockResolvedValue(null);
                        // Act & Assert
                        return [4 /*yield*/, expect(service.approve('visit-999', 1)).rejects.toThrow(common_1.NotFoundException)];
                    case 1:
                        // Act & Assert
                        _a.sent();
                        return [4 /*yield*/, expect(service.approve('visit-999', 1)).rejects.toThrow('Visit not found')];
                    case 2:
                        _a.sent();
                        expect(prismaMock.visit.update).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw ForbiddenException when not host of visit', function () { return __awaiter(void 0, void 0, void 0, function () {
            var otherHost;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        otherHost = __assign(__assign({}, mockUser), { id: 2, hostId: BigInt(2) });
                        prismaMock.visit.findUnique.mockResolvedValue(mockVisit);
                        prismaMock.user.findUnique.mockResolvedValue(otherHost);
                        // Act & Assert
                        return [4 /*yield*/, expect(service.approve('visit-1', 2)).rejects.toThrow(common_1.ForbiddenException)];
                    case 1:
                        // Act & Assert
                        _a.sent();
                        return [4 /*yield*/, expect(service.approve('visit-1', 2)).rejects.toThrow('Not your visit')];
                    case 2:
                        _a.sent();
                        expect(prismaMock.visit.update).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw BadRequestException when visit is not pending', function () { return __awaiter(void 0, void 0, void 0, function () {
            var approvedVisit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        approvedVisit = __assign(__assign({}, mockVisit), { status: 'APPROVED' });
                        prismaMock.visit.findUnique.mockResolvedValue(approvedVisit);
                        prismaMock.user.findUnique.mockResolvedValue(mockUser);
                        // Act & Assert
                        return [4 /*yield*/, expect(service.approve('visit-1', 1)).rejects.toThrow(common_1.BadRequestException)];
                    case 1:
                        // Act & Assert
                        _a.sent();
                        return [4 /*yield*/, expect(service.approve('visit-1', 1)).rejects.toThrow('Visit is not pending approval')];
                    case 2:
                        _a.sent();
                        expect(prismaMock.visit.update).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('reject', function () {
        it('should successfully reject a pending visit', function () { return __awaiter(void 0, void 0, void 0, function () {
            var pendingVisit, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pendingVisit = __assign(__assign({}, mockVisit), { status: 'PENDING_APPROVAL' });
                        prismaMock.visit.findUnique.mockResolvedValue(pendingVisit);
                        prismaMock.user.findUnique.mockResolvedValue(mockUser);
                        prismaMock.visit.update.mockResolvedValue(__assign(__assign({}, pendingVisit), { status: 'REJECTED' }));
                        return [4 /*yield*/, service.reject('visit-1', 1, 'Reason')];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(prismaMock.visit.update).toHaveBeenCalledWith({
                            where: { id: 'visit-1' },
                            data: expect.objectContaining({
                                status: 'REJECTED',
                                rejectionReason: 'Reason',
                            }),
                        });
                        expect(result).toEqual({ message: 'Visit rejected' });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should reject without reason', function () { return __awaiter(void 0, void 0, void 0, function () {
            var pendingVisit, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pendingVisit = __assign(__assign({}, mockVisit), { status: 'PENDING_APPROVAL' });
                        prismaMock.visit.findUnique.mockResolvedValue(pendingVisit);
                        prismaMock.user.findUnique.mockResolvedValue(mockUser);
                        prismaMock.visit.update.mockResolvedValue(__assign(__assign({}, pendingVisit), { status: 'REJECTED' }));
                        return [4 /*yield*/, service.reject('visit-1', 1)];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(prismaMock.visit.update).toHaveBeenCalledWith(expect.objectContaining({
                            data: expect.objectContaining({
                                rejectionReason: undefined,
                            }),
                        }));
                        expect(result).toEqual({ message: 'Visit rejected' });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('findBySessionId', function () {
        it('should find visit by session ID', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Arrange
                        prismaMock.visit.findUnique.mockResolvedValue(mockVisit);
                        return [4 /*yield*/, service.findBySessionId('session-123')];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(prismaMock.visit.findUnique).toHaveBeenCalledWith({
                            where: { sessionId: 'session-123' },
                            include: { host: true },
                        });
                        expect(result).toHaveProperty('sessionId', 'session-123');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw NotFoundException when visit not found', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Arrange
                        prismaMock.visit.findUnique.mockResolvedValue(null);
                        // Act & Assert
                        return [4 /*yield*/, expect(service.findBySessionId('nonexistent')).rejects.toThrow(common_1.NotFoundException)];
                    case 1:
                        // Act & Assert
                        _a.sent();
                        return [4 /*yield*/, expect(service.findBySessionId('nonexistent')).rejects.toThrow('Visit not found')];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('checkout', function () {
        it('should successfully check out a visitor', function () { return __awaiter(void 0, void 0, void 0, function () {
            var checkedInVisit, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        checkedInVisit = __assign(__assign({}, mockVisit), { status: 'CHECKED_IN' });
                        prismaMock.visit.findUnique.mockResolvedValue(checkedInVisit);
                        prismaMock.visit.update.mockResolvedValue(__assign(__assign({}, checkedInVisit), { status: 'CHECKED_OUT', checkOutAt: new Date() }));
                        prismaMock.checkEvent.create.mockResolvedValue({});
                        return [4 /*yield*/, service.checkout('session-123', 1)];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(prismaMock.visit.update).toHaveBeenCalledWith({
                            where: { id: 'visit-1' },
                            data: expect.objectContaining({
                                status: 'CHECKED_OUT',
                            }),
                        });
                        expect(prismaMock.checkEvent.create).toHaveBeenCalledWith({
                            data: expect.objectContaining({
                                type: 'CHECK_OUT',
                                userId: 1,
                            }),
                        });
                        expect(result).toHaveProperty('status');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw BadRequestException when visitor already checked out', function () { return __awaiter(void 0, void 0, void 0, function () {
            var checkedOutVisit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        checkedOutVisit = __assign(__assign({}, mockVisit), { status: 'CHECKED_OUT' });
                        prismaMock.visit.findUnique.mockResolvedValue(checkedOutVisit);
                        // Act & Assert
                        return [4 /*yield*/, expect(service.checkout('session-123', 1)).rejects.toThrow(common_1.BadRequestException)];
                    case 1:
                        // Act & Assert
                        _a.sent();
                        return [4 /*yield*/, expect(service.checkout('session-123', 1)).rejects.toThrow('Visitor already checked out')];
                    case 2:
                        _a.sent();
                        expect(prismaMock.visit.update).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw BadRequestException when visit is not checked in', function () { return __awaiter(void 0, void 0, void 0, function () {
            var pendingVisit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pendingVisit = __assign(__assign({}, mockVisit), { status: 'PENDING_APPROVAL' });
                        prismaMock.visit.findUnique.mockResolvedValue(pendingVisit);
                        // Act & Assert
                        return [4 /*yield*/, expect(service.checkout('session-123', 1)).rejects.toThrow(common_1.BadRequestException)];
                    case 1:
                        // Act & Assert
                        _a.sent();
                        return [4 /*yield*/, expect(service.checkout('session-123', 1)).rejects.toThrow('Visit must be checked in to check out')];
                    case 2:
                        _a.sent();
                        expect(prismaMock.visit.update).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw NotFoundException when visit not found', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Arrange
                        prismaMock.visit.findUnique.mockResolvedValue(null);
                        // Act & Assert
                        return [4 /*yield*/, expect(service.checkout('nonexistent', 1)).rejects.toThrow(common_1.NotFoundException)];
                    case 1:
                        // Act & Assert
                        _a.sent();
                        return [4 /*yield*/, expect(service.checkout('nonexistent', 1)).rejects.toThrow('Visit not found')];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getActive', function () {
        it('should return active visits without location filter', function () { return __awaiter(void 0, void 0, void 0, function () {
            var activeVisits, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        activeVisits = [
                            __assign(__assign({}, mockVisit), { id: 'visit-1' }),
                            __assign(__assign({}, mockVisit), { id: 'visit-2' }),
                        ];
                        prismaMock.visit.findMany.mockResolvedValue(activeVisits);
                        return [4 /*yield*/, service.getActive()];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(prismaMock.visit.findMany).toHaveBeenCalledWith({
                            where: { status: 'CHECKED_IN' },
                            include: { host: true },
                            orderBy: { checkInAt: 'desc' },
                        });
                        expect(result).toHaveLength(2);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return active visits with location filter', function () { return __awaiter(void 0, void 0, void 0, function () {
            var activeVisits, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        activeVisits = [__assign(__assign({}, mockVisit), { id: 'visit-1' })];
                        prismaMock.visit.findMany.mockResolvedValue(activeVisits);
                        return [4 /*yield*/, service.getActive('BARWA_TOWERS')];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(prismaMock.visit.findMany).toHaveBeenCalledWith({
                            where: { status: 'CHECKED_IN', location: 'BARWA_TOWERS' },
                            include: { host: true },
                            orderBy: { checkInAt: 'desc' },
                        });
                        expect(result).toHaveLength(1);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should normalize location filter', function () { return __awaiter(void 0, void 0, void 0, function () {
            var activeVisits;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        activeVisits = [__assign(__assign({}, mockVisit), { id: 'visit-1' })];
                        prismaMock.visit.findMany.mockResolvedValue(activeVisits);
                        // Act
                        return [4 /*yield*/, service.getActive('barwa towers')];
                    case 1:
                        // Act
                        _a.sent();
                        // Assert
                        expect(prismaMock.visit.findMany).toHaveBeenCalledWith(expect.objectContaining({
                            where: expect.objectContaining({
                                location: 'BARWA_TOWERS',
                            }),
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getHistory', function () {
        it('should return visit history without filters', function () { return __awaiter(void 0, void 0, void 0, function () {
            var historyVisits, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        historyVisits = [
                            __assign(__assign({}, mockVisit), { id: 'visit-1' }),
                            __assign(__assign({}, mockVisit), { id: 'visit-2' }),
                        ];
                        prismaMock.visit.findMany.mockResolvedValue(historyVisits);
                        return [4 /*yield*/, service.getHistory()];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(prismaMock.visit.findMany).toHaveBeenCalledWith({
                            where: {},
                            include: { host: true },
                            orderBy: { createdAt: 'desc' },
                            take: 500,
                        });
                        expect(result).toHaveLength(2);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return visit history with location filter', function () { return __awaiter(void 0, void 0, void 0, function () {
            var historyVisits, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        historyVisits = [__assign(__assign({}, mockVisit), { id: 'visit-1' })];
                        prismaMock.visit.findMany.mockResolvedValue(historyVisits);
                        return [4 /*yield*/, service.getHistory({ location: 'BARWA_TOWERS' })];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(prismaMock.visit.findMany).toHaveBeenCalledWith(expect.objectContaining({
                            where: expect.objectContaining({
                                location: 'BARWA_TOWERS',
                            }),
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return visit history with date range filter', function () { return __awaiter(void 0, void 0, void 0, function () {
            var historyVisits, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        historyVisits = [__assign(__assign({}, mockVisit), { id: 'visit-1' })];
                        prismaMock.visit.findMany.mockResolvedValue(historyVisits);
                        return [4 /*yield*/, service.getHistory({
                                from: '2026-01-01',
                                to: '2026-01-31',
                            })];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(prismaMock.visit.findMany).toHaveBeenCalledWith(expect.objectContaining({
                            where: expect.objectContaining({
                                checkInAt: expect.objectContaining({
                                    gte: expect.any(Date),
                                    lte: expect.any(Date),
                                }),
                            }),
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
