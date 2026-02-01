"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitsService = void 0;
var common_1 = require("@nestjs/common");
var VisitsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var VisitsService = _classThis = /** @class */ (function () {
        function VisitsService_1(prisma, qrTokenService, emailService, whatsappService) {
            this.prisma = prisma;
            this.qrTokenService = qrTokenService;
            this.emailService = emailService;
            this.whatsappService = whatsappService;
        }
        VisitsService_1.prototype.normalizeLocation = function (loc) {
            var s = loc.toLowerCase();
            if (s.includes('barwa'))
                return 'BARWA_TOWERS';
            if (s.includes('marina') && s.includes('50'))
                return 'MARINA_50';
            if (s.includes('element') || s.includes('mariott'))
                return 'ELEMENT_MARIOTT';
            return 'BARWA_TOWERS';
        };
        VisitsService_1.prototype.create = function (dto, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var hostId, host, sessionId, location, visit;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            hostId = BigInt(dto.hostId);
                            return [4 /*yield*/, this.prisma.host.findFirst({
                                    where: { id: hostId, status: 1, deletedAt: null },
                                })];
                        case 1:
                            host = _a.sent();
                            if (!host)
                                throw new common_1.BadRequestException('Invalid host');
                            sessionId = this.qrTokenService.generateSessionId();
                            _a.label = 2;
                        case 2: return [4 /*yield*/, this.prisma.visit.findUnique({ where: { sessionId: sessionId } })];
                        case 3:
                            if (!_a.sent()) return [3 /*break*/, 4];
                            sessionId = this.qrTokenService.generateSessionId();
                            return [3 /*break*/, 2];
                        case 4:
                            location = this.normalizeLocation(dto.location);
                            return [4 /*yield*/, this.prisma.visit.create({
                                    data: {
                                        sessionId: sessionId,
                                        visitorName: dto.visitorName,
                                        visitorCompany: dto.visitorCompany,
                                        visitorPhone: dto.visitorPhone,
                                        visitorEmail: dto.visitorEmail,
                                        hostId: hostId,
                                        purpose: dto.purpose,
                                        location: location,
                                        status: 'CHECKED_IN',
                                        checkInAt: new Date(),
                                    },
                                    include: { host: true },
                                })];
                        case 5:
                            visit = _a.sent();
                            return [4 /*yield*/, this.prisma.checkEvent.create({
                                    data: {
                                        visitId: visit.id,
                                        type: 'CHECK_IN',
                                        userId: userId !== null && userId !== void 0 ? userId : null,
                                    },
                                })];
                        case 6:
                            _a.sent();
                            return [4 /*yield*/, this.qrTokenService.createForVisit(visit.id, sessionId)];
                        case 7:
                            _a.sent();
                            if (host.email) {
                                this.emailService
                                    .sendVisitorArrival(host.email, visit.visitorName, visit.visitorCompany, visit.purpose)
                                    .catch(function () { });
                            }
                            if (host.phone) {
                                this.whatsappService
                                    .sendVisitorArrival(host.phone, visit.visitorName, visit.visitorCompany)
                                    .catch(function () { });
                            }
                            return [2 /*return*/, {
                                    id: visit.id,
                                    sessionId: visit.sessionId,
                                    visitor: {
                                        name: visit.visitorName,
                                        company: visit.visitorCompany,
                                        phone: visit.visitorPhone,
                                        email: visit.visitorEmail,
                                    },
                                    hostId: visit.hostId.toString(),
                                    host: visit.host,
                                    purpose: visit.purpose,
                                    location: visit.location,
                                    status: visit.status,
                                    checkInTimestamp: visit.checkInAt,
                                    checkOutTimestamp: visit.checkOutAt,
                                }];
                    }
                });
            });
        };
        VisitsService_1.prototype.preRegister = function (dto, hostUserId) {
            return __awaiter(this, void 0, void 0, function () {
                var user, host, sessionId, visit;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { id: hostUserId },
                                include: { host: true },
                            })];
                        case 1:
                            user = _b.sent();
                            if (!(user === null || user === void 0 ? void 0 : user.hostId))
                                throw new common_1.ForbiddenException('Host account required');
                            return [4 /*yield*/, this.prisma.host.findFirst({
                                    where: { id: user.hostId, status: 1, deletedAt: null },
                                })];
                        case 2:
                            host = _b.sent();
                            if (!host)
                                throw new common_1.ForbiddenException('Invalid host');
                            sessionId = this.qrTokenService.generateSessionId();
                            _b.label = 3;
                        case 3: return [4 /*yield*/, this.prisma.visit.findUnique({ where: { sessionId: sessionId } })];
                        case 4:
                            if (!_b.sent()) return [3 /*break*/, 5];
                            sessionId = this.qrTokenService.generateSessionId();
                            return [3 /*break*/, 3];
                        case 5: return [4 /*yield*/, this.prisma.visit.create({
                                data: {
                                    sessionId: sessionId,
                                    visitorName: dto.visitorName,
                                    visitorCompany: dto.visitorCompany,
                                    visitorPhone: dto.visitorPhone,
                                    visitorEmail: dto.visitorEmail,
                                    hostId: host.id,
                                    purpose: dto.purpose,
                                    location: (_a = host.location) !== null && _a !== void 0 ? _a : 'BARWA_TOWERS',
                                    status: 'PENDING_APPROVAL',
                                    preRegisteredById: hostUserId.toString(),
                                    expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
                                },
                                include: { host: true },
                            })];
                        case 6:
                            visit = _b.sent();
                            return [2 /*return*/, {
                                    id: visit.id,
                                    sessionId: visit.sessionId,
                                    visitor: {
                                        name: visit.visitorName,
                                        company: visit.visitorCompany,
                                        phone: visit.visitorPhone,
                                        email: visit.visitorEmail,
                                    },
                                    hostId: visit.hostId.toString(),
                                    purpose: visit.purpose,
                                    location: visit.location,
                                    status: visit.status,
                                    expectedDate: visit.expectedDate,
                                }];
                    }
                });
            });
        };
        VisitsService_1.prototype.getPending = function (hostUserId) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { id: hostUserId },
                            })];
                        case 1:
                            user = _a.sent();
                            if (!(user === null || user === void 0 ? void 0 : user.hostId))
                                return [2 /*return*/, []];
                            return [2 /*return*/, this.prisma.visit.findMany({
                                    where: {
                                        hostId: user.hostId,
                                        status: 'PENDING_APPROVAL',
                                    },
                                    include: { host: true },
                                    orderBy: { createdAt: 'desc' },
                                })];
                    }
                });
            });
        };
        VisitsService_1.prototype.approve = function (visitId, hostUserId) {
            return __awaiter(this, void 0, void 0, function () {
                var visit, user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.visit.findUnique({
                                where: { id: visitId },
                                include: { host: true },
                            })];
                        case 1:
                            visit = _a.sent();
                            if (!visit)
                                throw new common_1.NotFoundException('Visit not found');
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { id: hostUserId },
                                })];
                        case 2:
                            user = _a.sent();
                            if (!(user === null || user === void 0 ? void 0 : user.hostId) || user.hostId !== visit.hostId) {
                                throw new common_1.ForbiddenException('Not your visit');
                            }
                            if (visit.status !== 'PENDING_APPROVAL') {
                                throw new common_1.BadRequestException('Visit is not pending approval');
                            }
                            return [4 /*yield*/, this.prisma.visit.update({
                                    where: { id: visitId },
                                    data: { status: 'APPROVED', approvedAt: new Date() },
                                })];
                        case 3:
                            _a.sent();
                            if (visit.visitorEmail) {
                                this.emailService
                                    .send({
                                    to: visit.visitorEmail,
                                    subject: 'Visit Approved',
                                    html: "Your visit to ".concat(visit.host.company, " has been approved. Session ID: ").concat(visit.sessionId),
                                })
                                    .catch(function () { });
                            }
                            return [2 /*return*/, this.findBySessionId(visit.sessionId)];
                    }
                });
            });
        };
        VisitsService_1.prototype.reject = function (visitId, hostUserId, reason) {
            return __awaiter(this, void 0, void 0, function () {
                var visit, user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.visit.findUnique({
                                where: { id: visitId },
                            })];
                        case 1:
                            visit = _a.sent();
                            if (!visit)
                                throw new common_1.NotFoundException('Visit not found');
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { id: hostUserId },
                                })];
                        case 2:
                            user = _a.sent();
                            if (!(user === null || user === void 0 ? void 0 : user.hostId) || user.hostId !== visit.hostId) {
                                throw new common_1.ForbiddenException('Not your visit');
                            }
                            if (visit.status !== 'PENDING_APPROVAL') {
                                throw new common_1.BadRequestException('Visit is not pending approval');
                            }
                            return [4 /*yield*/, this.prisma.visit.update({
                                    where: { id: visitId },
                                    data: {
                                        status: 'REJECTED',
                                        rejectedAt: new Date(),
                                        rejectionReason: reason !== null && reason !== void 0 ? reason : undefined,
                                    },
                                })];
                        case 3:
                            _a.sent();
                            return [2 /*return*/, { message: 'Visit rejected' }];
                    }
                });
            });
        };
        VisitsService_1.prototype.findBySessionId = function (sessionId) {
            return __awaiter(this, void 0, void 0, function () {
                var visit;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.visit.findUnique({
                                where: { sessionId: sessionId },
                                include: { host: true },
                            })];
                        case 1:
                            visit = _a.sent();
                            if (!visit)
                                throw new common_1.NotFoundException('Visit not found');
                            return [2 /*return*/, {
                                    id: visit.id,
                                    sessionId: visit.sessionId,
                                    visitor: {
                                        name: visit.visitorName,
                                        company: visit.visitorCompany,
                                        phone: visit.visitorPhone,
                                        email: visit.visitorEmail,
                                    },
                                    hostId: visit.hostId.toString(),
                                    host: visit.host,
                                    purpose: visit.purpose,
                                    location: visit.location,
                                    status: visit.status,
                                    checkInTimestamp: visit.checkInAt,
                                    checkOutTimestamp: visit.checkOutAt,
                                }];
                    }
                });
            });
        };
        VisitsService_1.prototype.checkout = function (sessionId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var visit, now;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.visit.findUnique({
                                where: { sessionId: sessionId },
                            })];
                        case 1:
                            visit = _a.sent();
                            if (!visit)
                                throw new common_1.NotFoundException('Visit not found');
                            if (visit.status === 'CHECKED_OUT') {
                                throw new common_1.BadRequestException('Visitor already checked out');
                            }
                            if (visit.status !== 'CHECKED_IN') {
                                throw new common_1.BadRequestException('Visit must be checked in to check out');
                            }
                            now = new Date();
                            return [4 /*yield*/, this.prisma.visit.update({
                                    where: { id: visit.id },
                                    data: { status: 'CHECKED_OUT', checkOutAt: now },
                                })];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.prisma.checkEvent.create({
                                    data: {
                                        visitId: visit.id,
                                        type: 'CHECK_OUT',
                                        userId: userId !== null && userId !== void 0 ? userId : null,
                                    },
                                })];
                        case 3:
                            _a.sent();
                            return [2 /*return*/, this.findBySessionId(sessionId)];
                    }
                });
            });
        };
        VisitsService_1.prototype.getActive = function (location) {
            return __awaiter(this, void 0, void 0, function () {
                var where, visits;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            where = { status: 'CHECKED_IN' };
                            if (location) {
                                where.location = this.normalizeLocation(location);
                            }
                            return [4 /*yield*/, this.prisma.visit.findMany({
                                    where: where,
                                    include: { host: true },
                                    orderBy: { checkInAt: 'desc' },
                                })];
                        case 1:
                            visits = _a.sent();
                            return [2 /*return*/, visits.map(function (v) { return ({
                                    id: v.id,
                                    sessionId: v.sessionId,
                                    visitorName: v.visitorName,
                                    visitorCompany: v.visitorCompany,
                                    host: v.host,
                                    checkInAt: v.checkInAt,
                                }); })];
                    }
                });
            });
        };
        VisitsService_1.prototype.getHistory = function (filters) {
            return __awaiter(this, void 0, void 0, function () {
                var where;
                return __generator(this, function (_a) {
                    where = {};
                    if (filters === null || filters === void 0 ? void 0 : filters.location)
                        where.location = this.normalizeLocation(filters.location);
                    if ((filters === null || filters === void 0 ? void 0 : filters.from) || (filters === null || filters === void 0 ? void 0 : filters.to)) {
                        where.checkInAt = {};
                        if (filters.from)
                            where.checkInAt.gte = new Date(filters.from);
                        if (filters.to)
                            where.checkInAt.lte = new Date(filters.to);
                    }
                    return [2 /*return*/, this.prisma.visit.findMany({
                            where: where,
                            include: { host: true },
                            orderBy: { createdAt: 'desc' },
                            take: 500,
                        })];
                });
            });
        };
        return VisitsService_1;
    }());
    __setFunctionName(_classThis, "VisitsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        VisitsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return VisitsService = _classThis;
}();
exports.VisitsService = VisitsService;
