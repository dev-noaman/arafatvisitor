"use strict";
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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminApiController = void 0;
var common_1 = require("@nestjs/common");
var public_decorator_1 = require("../common/decorators/public.decorator");
var bcrypt = require("bcrypt");
var QRCode = require("qrcode");
var crypto = require("crypto");
// csv-parse import moved to dynamic import inside method for ESM compatibility
// Note: These endpoints are meant to be accessed through the AdminJS session
// They use @Public() to bypass JWT auth - they rely on AdminJS cookie authentication
var AdminApiController = function () {
    var _classDecorators = [(0, common_1.Controller)('admin/api'), (0, public_decorator_1.Public)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getDashboardKpis_decorators;
    var _getProfile_decorators;
    var _updateProfile_decorators;
    var _importHosts_decorators;
    var _getPendingApprovals_decorators;
    var _getReceivedDeliveries_decorators;
    var _getChartData_decorators;
    var _getCurrentVisitors_decorators;
    var _approveVisit_decorators;
    var _rejectVisit_decorators;
    var _checkoutVisitor_decorators;
    var _getQrCode_decorators;
    var _sendQr_decorators;
    var _changePassword_decorators;
    var _getVisitorsReport_decorators;
    var _exportVisitorsReport_decorators;
    var _getDeliveriesReport_decorators;
    var _exportDeliveriesReport_decorators;
    var _getSettings_decorators;
    var _testWhatsapp_decorators;
    var _testEmail_decorators;
    var _updateSettings_decorators;
    var AdminApiController = _classThis = /** @class */ (function () {
        function AdminApiController_1(prisma, emailService, whatsappService) {
            this.prisma = (__runInitializers(this, _instanceExtraInitializers), prisma);
            this.emailService = emailService;
            this.whatsappService = whatsappService;
        }
        // ============ DASHBOARD KPIs ============
        AdminApiController_1.prototype.getDashboardKpis = function () {
            return __awaiter(this, void 0, void 0, function () {
                var today, _a, totalHosts, visitsToday, deliveriesToday;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.host.count({ where: { status: 1 } }),
                                    this.prisma.visit.count({
                                        where: {
                                            checkInAt: { gte: today },
                                        },
                                    }),
                                    this.prisma.delivery.count({
                                        where: {
                                            receivedAt: { gte: today },
                                        },
                                    }),
                                ])];
                        case 1:
                            _a = _b.sent(), totalHosts = _a[0], visitsToday = _a[1], deliveriesToday = _a[2];
                            return [2 /*return*/, { totalHosts: totalHosts, visitsToday: visitsToday, deliveriesToday: deliveriesToday }];
                    }
                });
            });
        };
        AdminApiController_1.prototype.getProfile = function (email) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!email) {
                                throw new common_1.HttpException('Email is required', common_1.HttpStatus.BAD_REQUEST);
                            }
                            return [4 /*yield*/, this.prisma.user.findUnique({ where: { email: email } })];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
                            }
                            return [2 /*return*/, { name: user.name, email: user.email, role: user.role }];
                    }
                });
            });
        };
        AdminApiController_1.prototype.updateProfile = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, email, name, user, updated;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = body || {}, email = _a.email, name = _a.name;
                            if (!email) {
                                throw new common_1.HttpException('Email is required', common_1.HttpStatus.BAD_REQUEST);
                            }
                            return [4 /*yield*/, this.prisma.user.findUnique({ where: { email: email } })];
                        case 1:
                            user = _b.sent();
                            if (!user) {
                                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
                            }
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { email: email },
                                    data: { name: name !== null && name !== void 0 ? name : user.name },
                                })];
                        case 2:
                            updated = _b.sent();
                            return [2 /*return*/, { name: updated.name, email: updated.email, role: updated.role }];
                    }
                });
            });
        };
        // ============ HOSTS BULK IMPORT ============
        AdminApiController_1.prototype.importHosts = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                var csvContent, records, csvParseModule, parse, e_1, totalProcessed, inserted, skipped, usersCreated, usersSkipped, rejectedRows, emailRegex, mapLocation, mapStatus, cleanPhone, index, row, rowNumber, reasons, externalIdRaw, nameRaw, companyRaw, emailRaw, phoneRaw, locationRaw, statusRaw, name_1, company, email, phone, location_1, status_1, externalId, existingHost, createdHost, userEmail, existingUserByEmail, existingUserByHostId, randomPassword, hashedPassword, e_2, errorMsg, rejected, error_1;
                var _a, _b, _c, _d, _e, _f, _g;
                return __generator(this, function (_h) {
                    switch (_h.label) {
                        case 0:
                            console.log('Bulk import request received, body keys:', body ? Object.keys(body) : 'null');
                            _h.label = 1;
                        case 1:
                            _h.trys.push([1, 20, , 21]);
                            csvContent = (body || {}).csvContent;
                            if (!csvContent || typeof csvContent !== 'string' || !csvContent.trim()) {
                                console.log('csvContent validation failed:', {
                                    hasBody: !!body,
                                    hasCsvContent: !!csvContent,
                                    type: typeof csvContent
                                });
                                throw new common_1.HttpException('csvContent is required', common_1.HttpStatus.BAD_REQUEST);
                            }
                            console.log("CSV content received, length: ".concat(csvContent.length, " chars"));
                            records = void 0;
                            _h.label = 2;
                        case 2:
                            _h.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, Promise.resolve().then(function () { return require('csv-parse/sync'); })];
                        case 3:
                            csvParseModule = _h.sent();
                            parse = csvParseModule.parse;
                            if (typeof parse !== 'function') {
                                console.error('csv-parse module exports:', Object.keys(csvParseModule));
                                throw new Error('csv-parse parse function not found');
                            }
                            records = parse(csvContent, {
                                columns: true,
                                skip_empty_lines: true,
                                trim: true,
                            });
                            console.log("CSV parsed successfully, ".concat(records.length, " records found"));
                            return [3 /*break*/, 5];
                        case 4:
                            e_1 = _h.sent();
                            console.error('CSV parse error:', e_1);
                            throw new common_1.HttpException("Failed to parse CSV: ".concat(e_1 instanceof Error ? e_1.message : 'Unknown error'), common_1.HttpStatus.BAD_REQUEST);
                        case 5:
                            totalProcessed = 0;
                            inserted = 0;
                            skipped = 0;
                            usersCreated = 0;
                            usersSkipped = 0;
                            rejectedRows = [];
                            emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
                            mapLocation = function (value) {
                                if (!value)
                                    return null;
                                var v = value.trim();
                                if (v === 'Arafat - Barwa Towers')
                                    return 'BARWA_TOWERS';
                                if (v === 'Arafat - Element Hotel')
                                    return 'ELEMENT_MARIOTT';
                                if (v === 'Arafat - Marina 50 Tower')
                                    return 'MARINA_50';
                                return null;
                            };
                            mapStatus = function (value) {
                                if (!value)
                                    return undefined;
                                var v = value.trim().toLowerCase();
                                if (v === 'active')
                                    return 1;
                                if (v === 'inactive')
                                    return 0;
                                return undefined;
                            };
                            cleanPhone = function (value) {
                                if (!value)
                                    return '';
                                var v = value.replace(/[\s\-()]/g, '');
                                if (v.startsWith('+')) {
                                    v = v.slice(1);
                                }
                                // Qatar-specific adjustments
                                var isQatar = v.startsWith('974');
                                if (!isQatar && /^\d{6}$/.test(v)) {
                                    // 6 digits without country code - still treat as Qatar and prefix
                                    v = "974".concat(v);
                                }
                                else if (isQatar) {
                                    var rest = v.slice(3);
                                    if (rest.length === 6) {
                                        // already 974 + 6 digits, keep as is
                                        v = "974".concat(rest);
                                    }
                                    // other 974* lengths: keep as-is (logged via rejection rules below if needed)
                                }
                                return v;
                            };
                            index = 0;
                            _h.label = 6;
                        case 6:
                            if (!(index < records.length)) return [3 /*break*/, 19];
                            row = records[index];
                            rowNumber = index + 2;
                            totalProcessed += 1;
                            reasons = [];
                            externalIdRaw = ((_a = row['ID']) !== null && _a !== void 0 ? _a : '').toString().trim();
                            nameRaw = ((_b = row['Name']) !== null && _b !== void 0 ? _b : '').toString().trim();
                            companyRaw = ((_c = row['Company']) !== null && _c !== void 0 ? _c : '').toString().trim();
                            emailRaw = ((_d = row['Email Address']) !== null && _d !== void 0 ? _d : '').toString().trim();
                            phoneRaw = ((_e = row['Phone Number']) !== null && _e !== void 0 ? _e : '').toString().trim();
                            locationRaw = ((_f = row['Location']) !== null && _f !== void 0 ? _f : '').toString().trim();
                            statusRaw = ((_g = row['Status']) !== null && _g !== void 0 ? _g : '').toString().trim();
                            name_1 = nameRaw || '';
                            if (!name_1) {
                                reasons.push('Missing name');
                            }
                            company = companyRaw || null;
                            email = emailRaw ? emailRaw.toLowerCase() : null;
                            if (email && !emailRegex.test(email)) {
                                reasons.push('Invalid email format');
                            }
                            phone = cleanPhone(phoneRaw);
                            if (!phone) {
                                reasons.push('Invalid or missing phone');
                            }
                            else if (/[a-zA-Z]/.test(phone)) {
                                reasons.push('Invalid phone (contains letters)');
                            }
                            location_1 = mapLocation(locationRaw || null);
                            status_1 = mapStatus(statusRaw || null);
                            if (status_1 === undefined) {
                                reasons.push('Invalid status');
                            }
                            if (reasons.length > 0) {
                                rejectedRows.push({ rowNumber: rowNumber, reason: reasons.join('; ') });
                                return [3 /*break*/, 18];
                            }
                            externalId = externalIdRaw || null;
                            if (!externalId) return [3 /*break*/, 8];
                            return [4 /*yield*/, this.prisma.host.findUnique({
                                    where: { externalId: externalId },
                                })];
                        case 7:
                            existingHost = _h.sent();
                            if (existingHost) {
                                // Skip existing hosts - don't update them
                                skipped += 1;
                                return [3 /*break*/, 18];
                            }
                            _h.label = 8;
                        case 8:
                            _h.trys.push([8, 17, , 18]);
                            return [4 /*yield*/, this.prisma.host.create({
                                    data: {
                                        externalId: externalId,
                                        name: name_1,
                                        company: company !== null && company !== void 0 ? company : '',
                                        email: email,
                                        phone: phone,
                                        location: location_1,
                                        status: status_1 !== null && status_1 !== void 0 ? status_1 : 1,
                                    },
                                })];
                        case 9:
                            createdHost = _h.sent();
                            inserted += 1;
                            userEmail = email || "host_".concat(createdHost.id, "@system.local");
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { email: userEmail },
                                })];
                        case 10:
                            existingUserByEmail = _h.sent();
                            if (!existingUserByEmail) return [3 /*break*/, 11];
                            usersSkipped += 1;
                            return [3 /*break*/, 16];
                        case 11: return [4 /*yield*/, this.prisma.user.findFirst({
                                where: { hostId: createdHost.id },
                            })];
                        case 12:
                            existingUserByHostId = _h.sent();
                            if (!existingUserByHostId) return [3 /*break*/, 13];
                            usersSkipped += 1;
                            return [3 /*break*/, 16];
                        case 13:
                            randomPassword = crypto.randomBytes(16).toString('hex');
                            return [4 /*yield*/, bcrypt.hash(randomPassword, 12)];
                        case 14:
                            hashedPassword = _h.sent();
                            // Create User with role=HOST and hostId
                            return [4 /*yield*/, this.prisma.user.create({
                                    data: {
                                        email: userEmail,
                                        password: hashedPassword,
                                        name: name_1,
                                        role: 'HOST',
                                        hostId: createdHost.id,
                                    },
                                })];
                        case 15:
                            // Create User with role=HOST and hostId
                            _h.sent();
                            usersCreated += 1;
                            _h.label = 16;
                        case 16: return [3 /*break*/, 18];
                        case 17:
                            e_2 = _h.sent();
                            errorMsg = e_2 instanceof Error ? e_2.message : 'Unknown database error';
                            console.error("Row ".concat(rowNumber, " database error:"), e_2);
                            rejectedRows.push({
                                rowNumber: rowNumber,
                                reason: "Database error: ".concat(errorMsg),
                            });
                            return [3 /*break*/, 18];
                        case 18:
                            index++;
                            return [3 /*break*/, 6];
                        case 19:
                            rejected = rejectedRows.length;
                            console.log("Bulk import completed: ".concat(totalProcessed, " processed, ").concat(inserted, " inserted, ").concat(skipped, " skipped, ").concat(rejected, " rejected"));
                            return [2 /*return*/, {
                                    totalProcessed: totalProcessed,
                                    inserted: inserted,
                                    skipped: skipped,
                                    rejected: rejected,
                                    rejectedRows: rejectedRows,
                                    usersCreated: usersCreated,
                                    usersSkipped: usersSkipped,
                                }];
                        case 20:
                            error_1 = _h.sent();
                            // Top-level catch for any unexpected errors
                            console.error('Bulk import unexpected error:', error_1);
                            if (error_1 instanceof common_1.HttpException) {
                                throw error_1;
                            }
                            throw new common_1.HttpException("Import failed: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error'), common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                        case 21: return [2 /*return*/];
                    }
                });
            });
        };
        // ============ PENDING APPROVALS ============
        AdminApiController_1.prototype.getPendingApprovals = function () {
            return __awaiter(this, void 0, void 0, function () {
                var pendingVisits;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.visit.findMany({
                                where: { status: 'PENDING_APPROVAL' },
                                include: { host: true },
                                orderBy: { expectedDate: 'asc' },
                                take: 10,
                            })];
                        case 1:
                            pendingVisits = _a.sent();
                            return [2 /*return*/, pendingVisits.map(function (v) {
                                    var _a, _b, _c;
                                    return ({
                                        id: v.id,
                                        visitorName: v.visitorName,
                                        visitorPhone: v.visitorPhone,
                                        hostName: ((_a = v.host) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown',
                                        hostCompany: ((_b = v.host) === null || _b === void 0 ? void 0 : _b.company) || 'Unknown',
                                        expectedDate: ((_c = v.expectedDate) === null || _c === void 0 ? void 0 : _c.toISOString()) || v.createdAt.toISOString(),
                                    });
                                })];
                    }
                });
            });
        };
        // ============ RECEIVED DELIVERIES ============
        AdminApiController_1.prototype.getReceivedDeliveries = function () {
            return __awaiter(this, void 0, void 0, function () {
                var deliveries;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.delivery.findMany({
                                where: { status: 'RECEIVED' },
                                include: { host: true },
                                orderBy: { receivedAt: 'desc' },
                                take: 10,
                            })];
                        case 1:
                            deliveries = _a.sent();
                            return [2 /*return*/, deliveries.map(function (d) {
                                    var _a, _b, _c;
                                    return ({
                                        id: d.id,
                                        courier: d.courier,
                                        recipient: d.recipient,
                                        hostName: ((_a = d.host) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown',
                                        hostCompany: ((_b = d.host) === null || _b === void 0 ? void 0 : _b.company) || 'Unknown',
                                        receivedAt: ((_c = d.receivedAt) === null || _c === void 0 ? void 0 : _c.toISOString()) || d.createdAt.toISOString(),
                                    });
                                })];
                    }
                });
            });
        };
        // ============ CHART DATA ============
        AdminApiController_1.prototype.getChartData = function () {
            return __awaiter(this, void 0, void 0, function () {
                var today, sevenDaysAgo, visitsPerDay, i, date, nextDate, count, statusCounts, statusDistribution, deliveriesPerDay, i, date, nextDate, count;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            today = new Date();
                            sevenDaysAgo = new Date(today);
                            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                            sevenDaysAgo.setHours(0, 0, 0, 0);
                            visitsPerDay = [];
                            i = 6;
                            _a.label = 1;
                        case 1:
                            if (!(i >= 0)) return [3 /*break*/, 4];
                            date = new Date(today);
                            date.setDate(date.getDate() - i);
                            date.setHours(0, 0, 0, 0);
                            nextDate = new Date(date);
                            nextDate.setDate(nextDate.getDate() + 1);
                            return [4 /*yield*/, this.prisma.visit.count({
                                    where: {
                                        checkInAt: {
                                            gte: date,
                                            lt: nextDate,
                                        },
                                    },
                                })];
                        case 2:
                            count = _a.sent();
                            visitsPerDay.push({ date: date.toISOString(), count: count });
                            _a.label = 3;
                        case 3:
                            i--;
                            return [3 /*break*/, 1];
                        case 4: return [4 /*yield*/, this.prisma.visit.groupBy({
                                by: ['status'],
                                _count: { status: true },
                            })];
                        case 5:
                            statusCounts = _a.sent();
                            statusDistribution = statusCounts.map(function (s) { return ({
                                status: s.status,
                                count: s._count.status,
                            }); });
                            deliveriesPerDay = [];
                            i = 6;
                            _a.label = 6;
                        case 6:
                            if (!(i >= 0)) return [3 /*break*/, 9];
                            date = new Date(today);
                            date.setDate(date.getDate() - i);
                            date.setHours(0, 0, 0, 0);
                            nextDate = new Date(date);
                            nextDate.setDate(nextDate.getDate() + 1);
                            return [4 /*yield*/, this.prisma.delivery.count({
                                    where: {
                                        receivedAt: {
                                            gte: date,
                                            lt: nextDate,
                                        },
                                    },
                                })];
                        case 7:
                            count = _a.sent();
                            deliveriesPerDay.push({ date: date.toISOString(), count: count });
                            _a.label = 8;
                        case 8:
                            i--;
                            return [3 /*break*/, 6];
                        case 9: return [2 /*return*/, { visitsPerDay: visitsPerDay, statusDistribution: statusDistribution, deliveriesPerDay: deliveriesPerDay }];
                    }
                });
            });
        };
        // ============ CURRENT VISITORS (for card view) ============
        AdminApiController_1.prototype.getCurrentVisitors = function () {
            return __awaiter(this, void 0, void 0, function () {
                var visitors, visitorsWithQr;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.visit.findMany({
                                where: { status: 'CHECKED_IN' },
                                include: {
                                    host: true,
                                    qrToken: true,
                                },
                                orderBy: { checkInAt: 'desc' },
                            })];
                        case 1:
                            visitors = _a.sent();
                            return [4 /*yield*/, Promise.all(visitors.map(function (v) { return __awaiter(_this, void 0, void 0, function () {
                                    var qrDataUrl, e_3;
                                    var _a, _b, _c, _d, _e;
                                    return __generator(this, function (_f) {
                                        switch (_f.label) {
                                            case 0:
                                                qrDataUrl = null;
                                                if (!((_a = v.qrToken) === null || _a === void 0 ? void 0 : _a.token)) return [3 /*break*/, 4];
                                                _f.label = 1;
                                            case 1:
                                                _f.trys.push([1, 3, , 4]);
                                                return [4 /*yield*/, QRCode.toDataURL(v.qrToken.token, {
                                                        width: 200,
                                                        margin: 2,
                                                    })];
                                            case 2:
                                                qrDataUrl = _f.sent();
                                                return [3 /*break*/, 4];
                                            case 3:
                                                e_3 = _f.sent();
                                                console.error('Failed to generate QR:', e_3);
                                                return [3 /*break*/, 4];
                                            case 4: return [2 /*return*/, {
                                                    id: v.id,
                                                    sessionId: v.sessionId,
                                                    visitorName: v.visitorName,
                                                    visitorCompany: v.visitorCompany,
                                                    visitorPhone: v.visitorPhone,
                                                    visitorEmail: v.visitorEmail,
                                                    hostName: ((_b = v.host) === null || _b === void 0 ? void 0 : _b.name) || 'Unknown',
                                                    hostCompany: ((_c = v.host) === null || _c === void 0 ? void 0 : _c.company) || 'Unknown',
                                                    purpose: v.purpose,
                                                    checkInAt: (_d = v.checkInAt) === null || _d === void 0 ? void 0 : _d.toISOString(),
                                                    qrToken: (_e = v.qrToken) === null || _e === void 0 ? void 0 : _e.token,
                                                    qrDataUrl: qrDataUrl,
                                                }];
                                        }
                                    });
                                }); }))];
                        case 2:
                            visitorsWithQr = _a.sent();
                            return [2 /*return*/, visitorsWithQr];
                    }
                });
            });
        };
        // ============ APPROVE / REJECT ACTIONS ============
        AdminApiController_1.prototype.approveVisit = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var visit;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.visit.findUnique({ where: { id: id } })];
                        case 1:
                            visit = _a.sent();
                            if (!visit) {
                                throw new common_1.HttpException('Visit not found', common_1.HttpStatus.NOT_FOUND);
                            }
                            if (visit.status !== 'PENDING_APPROVAL') {
                                throw new common_1.HttpException('Invalid status for approval', common_1.HttpStatus.BAD_REQUEST);
                            }
                            return [4 /*yield*/, this.prisma.visit.update({
                                    where: { id: id },
                                    data: {
                                        status: 'APPROVED',
                                        approvedAt: new Date(),
                                    },
                                })];
                        case 2:
                            _a.sent();
                            // TODO: Generate QR token and send notifications
                            return [2 /*return*/, { success: true, message: 'Visit approved' }];
                    }
                });
            });
        };
        AdminApiController_1.prototype.rejectVisit = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var visit;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.visit.findUnique({ where: { id: id } })];
                        case 1:
                            visit = _a.sent();
                            if (!visit) {
                                throw new common_1.HttpException('Visit not found', common_1.HttpStatus.NOT_FOUND);
                            }
                            if (visit.status !== 'PENDING_APPROVAL') {
                                throw new common_1.HttpException('Invalid status for rejection', common_1.HttpStatus.BAD_REQUEST);
                            }
                            return [4 /*yield*/, this.prisma.visit.update({
                                    where: { id: id },
                                    data: {
                                        status: 'REJECTED',
                                        rejectedAt: new Date(),
                                    },
                                })];
                        case 2:
                            _a.sent();
                            // TODO: Send rejection notification
                            return [2 /*return*/, { success: true, message: 'Visit rejected' }];
                    }
                });
            });
        };
        // ============ CHECKOUT ============
        AdminApiController_1.prototype.checkoutVisitor = function (sessionId) {
            return __awaiter(this, void 0, void 0, function () {
                var visit;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.visit.findUnique({
                                where: { sessionId: sessionId },
                            })];
                        case 1:
                            visit = _a.sent();
                            if (!visit) {
                                throw new common_1.HttpException('Visit not found', common_1.HttpStatus.NOT_FOUND);
                            }
                            if (visit.status !== 'CHECKED_IN') {
                                throw new common_1.HttpException('Visitor is not checked in', common_1.HttpStatus.BAD_REQUEST);
                            }
                            return [4 /*yield*/, this.prisma.visit.update({
                                    where: { sessionId: sessionId },
                                    data: {
                                        status: 'CHECKED_OUT',
                                        checkOutAt: new Date(),
                                    },
                                })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, { success: true, message: 'Visitor checked out' }];
                    }
                });
            });
        };
        // ============ QR CODE GENERATION ============
        AdminApiController_1.prototype.getQrCode = function (visitId) {
            return __awaiter(this, void 0, void 0, function () {
                var visit, token, qrDataUrl, e_4;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.visit.findUnique({
                                where: { id: visitId },
                                include: { qrToken: true },
                            })];
                        case 1:
                            visit = _b.sent();
                            if (!visit) {
                                throw new common_1.HttpException('Visit not found', common_1.HttpStatus.NOT_FOUND);
                            }
                            token = ((_a = visit.qrToken) === null || _a === void 0 ? void 0 : _a.token) || visit.sessionId;
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, QRCode.toDataURL(token, {
                                    width: 300,
                                    margin: 2,
                                })];
                        case 3:
                            qrDataUrl = _b.sent();
                            return [2 /*return*/, { qrDataUrl: qrDataUrl, token: token }];
                        case 4:
                            e_4 = _b.sent();
                            throw new common_1.HttpException('Failed to generate QR code', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        // ============ SEND QR (WhatsApp / Email) ============
        AdminApiController_1.prototype.sendQr = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                var visitId, method, visit, token, qrDataUrl, qrLink, message, sent, e_5, sent, e_6;
                var _a, _b, _c, _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            visitId = body.visitId, method = body.method;
                            return [4 /*yield*/, this.prisma.visit.findUnique({
                                    where: { id: visitId },
                                    include: { qrToken: true, host: true },
                                })];
                        case 1:
                            visit = _f.sent();
                            if (!visit) {
                                throw new common_1.HttpException('Visit not found', common_1.HttpStatus.NOT_FOUND);
                            }
                            token = ((_a = visit.qrToken) === null || _a === void 0 ? void 0 : _a.token) || visit.sessionId;
                            return [4 /*yield*/, QRCode.toDataURL(token, { width: 300, margin: 2 })];
                        case 2:
                            qrDataUrl = _f.sent();
                            if (!(method === 'whatsapp')) return [3 /*break*/, 6];
                            if (!visit.visitorPhone) {
                                throw new common_1.HttpException('No phone number available', common_1.HttpStatus.BAD_REQUEST);
                            }
                            _f.label = 3;
                        case 3:
                            _f.trys.push([3, 5, , 6]);
                            qrLink = "".concat(process.env.FRONTEND_URL || 'http://localhost:5173', "/check-in?session=").concat(token);
                            message = "Hello ".concat(visit.visitorName, "!\n\nYour QR code for visiting ").concat(((_b = visit.host) === null || _b === void 0 ? void 0 : _b.company) || 'our office', " is ready.\n\nPlease use this link to access your QR code:\n").concat(qrLink, "\n\nOr show this QR code at reception for check-in.");
                            return [4 /*yield*/, this.whatsappService.send(visit.visitorPhone, message)];
                        case 4:
                            sent = _f.sent();
                            if (!sent) {
                                throw new Error('WhatsApp service returned false');
                            }
                            return [2 /*return*/, { success: true, message: 'QR sent via WhatsApp' }];
                        case 5:
                            e_5 = _f.sent();
                            throw new common_1.HttpException('Failed to send WhatsApp message', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                        case 6:
                            if (!(method === 'email')) return [3 /*break*/, 10];
                            if (!visit.visitorEmail) {
                                throw new common_1.HttpException('No email address available', common_1.HttpStatus.BAD_REQUEST);
                            }
                            _f.label = 7;
                        case 7:
                            _f.trys.push([7, 9, , 10]);
                            return [4 /*yield*/, this.emailService.send({
                                    to: visit.visitorEmail,
                                    subject: "Your Visit QR Code - ".concat(((_c = visit.host) === null || _c === void 0 ? void 0 : _c.company) || 'Office Visit'),
                                    html: "\n            <h2>Hello ".concat(visit.visitorName, "!</h2>\n            <p>Your QR code for visiting <strong>").concat(((_d = visit.host) === null || _d === void 0 ? void 0 : _d.company) || 'our office', "</strong> is ready.</p>\n            <p>Please show this QR code at reception for check-in:</p>\n            <img src=\"").concat(qrDataUrl, "\" alt=\"QR Code\" style=\"width: 200px; height: 200px;\" />\n            <p>Host: ").concat(((_e = visit.host) === null || _e === void 0 ? void 0 : _e.name) || 'N/A', "</p>\n            <p>Purpose: ").concat(visit.purpose, "</p>\n            <br />\n            <p>Thank you!</p>\n          "),
                                })];
                        case 8:
                            sent = _f.sent();
                            return [2 /*return*/, { success: true, message: 'QR sent via Email' }];
                        case 9:
                            e_6 = _f.sent();
                            throw new common_1.HttpException('Failed to send email', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                        case 10: throw new common_1.HttpException('Invalid send method', common_1.HttpStatus.BAD_REQUEST);
                    }
                });
            });
        };
        // ============ CHANGE PASSWORD ============
        AdminApiController_1.prototype.changePassword = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                var currentPassword, newPassword, userEmail, user, validPassword, hashedPassword;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            currentPassword = body.currentPassword, newPassword = body.newPassword, userEmail = body.userEmail;
                            if (!userEmail) {
                                throw new common_1.HttpException('User not authenticated', common_1.HttpStatus.UNAUTHORIZED);
                            }
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { email: userEmail },
                                })];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
                            }
                            return [4 /*yield*/, bcrypt.compare(currentPassword, user.password)];
                        case 2:
                            validPassword = _a.sent();
                            if (!validPassword) {
                                throw new common_1.HttpException('Current password is incorrect', common_1.HttpStatus.BAD_REQUEST);
                            }
                            return [4 /*yield*/, bcrypt.hash(newPassword, 12)];
                        case 3:
                            hashedPassword = _a.sent();
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { email: userEmail },
                                    data: { password: hashedPassword },
                                })];
                        case 4:
                            _a.sent();
                            return [2 /*return*/, { success: true, message: 'Password changed successfully' }];
                    }
                });
            });
        };
        // ============ REPORTS ============
        AdminApiController_1.prototype.getVisitorsReport = function (dateFrom, dateTo, location, company, status) {
            return __awaiter(this, void 0, void 0, function () {
                var where, endDate, visits, filtered;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            where = {};
                            if (dateFrom) {
                                where.checkInAt = __assign(__assign({}, where.checkInAt), { gte: new Date(dateFrom) });
                            }
                            if (dateTo) {
                                endDate = new Date(dateTo);
                                endDate.setHours(23, 59, 59, 999);
                                where.checkInAt = __assign(__assign({}, where.checkInAt), { lte: endDate });
                            }
                            if (location) {
                                where.location = location;
                            }
                            if (status) {
                                where.status = status;
                            }
                            return [4 /*yield*/, this.prisma.visit.findMany({
                                    where: where,
                                    include: { host: true },
                                    orderBy: { checkInAt: 'desc' },
                                })];
                        case 1:
                            visits = _a.sent();
                            filtered = visits;
                            if (company) {
                                filtered = visits.filter(function (v) { var _a, _b; return (_b = (_a = v.host) === null || _a === void 0 ? void 0 : _a.company) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(company.toLowerCase()); });
                            }
                            return [2 /*return*/, filtered];
                    }
                });
            });
        };
        AdminApiController_1.prototype.exportVisitorsReport = function (res_1, dateFrom_1, dateTo_1, location_2, company_1, status_2) {
            return __awaiter(this, arguments, void 0, function (res, dateFrom, dateTo, location, company, status, format) {
                var data, csv, xlsx, ws, wb, buffer;
                if (format === void 0) { format = 'csv'; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getVisitorsReport(dateFrom, dateTo, location, company, status)];
                        case 1:
                            data = _a.sent();
                            if (format === 'csv') {
                                csv = this.generateCsv(data, [
                                    'visitorName',
                                    'visitorCompany',
                                    'visitorPhone',
                                    'visitorEmail',
                                    'purpose',
                                    'status',
                                    'checkInAt',
                                    'checkOutAt',
                                ]);
                                res.setHeader('Content-Type', 'text/csv');
                                res.setHeader('Content-Disposition', 'attachment; filename=visitors-report.csv');
                                return [2 /*return*/, res.send(csv)];
                            }
                            if (!(format === 'excel')) return [3 /*break*/, 3];
                            return [4 /*yield*/, Promise.resolve().then(function () { return require('xlsx'); })];
                        case 2:
                            xlsx = _a.sent();
                            ws = xlsx.utils.json_to_sheet(data.map(function (v) {
                                var _a, _b;
                                return ({
                                    'Visitor Name': v.visitorName,
                                    'Visitor Company': v.visitorCompany,
                                    'Phone': v.visitorPhone,
                                    'Email': v.visitorEmail || '',
                                    'Host': ((_a = v.host) === null || _a === void 0 ? void 0 : _a.name) || '',
                                    'Host Company': ((_b = v.host) === null || _b === void 0 ? void 0 : _b.company) || '',
                                    'Purpose': v.purpose,
                                    'Status': v.status,
                                    'Check In': v.checkInAt ? new Date(v.checkInAt).toLocaleString() : '',
                                    'Check Out': v.checkOutAt ? new Date(v.checkOutAt).toLocaleString() : '',
                                });
                            }));
                            wb = xlsx.utils.book_new();
                            xlsx.utils.book_append_sheet(wb, ws, 'Visitors');
                            buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
                            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                            res.setHeader('Content-Disposition', 'attachment; filename=visitors-report.xlsx');
                            return [2 /*return*/, res.send(buffer)];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        AdminApiController_1.prototype.getDeliveriesReport = function (dateFrom, dateTo, location, company, status) {
            return __awaiter(this, void 0, void 0, function () {
                var where, endDate, deliveries, filtered;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            where = {};
                            if (dateFrom) {
                                where.receivedAt = __assign(__assign({}, where.receivedAt), { gte: new Date(dateFrom) });
                            }
                            if (dateTo) {
                                endDate = new Date(dateTo);
                                endDate.setHours(23, 59, 59, 999);
                                where.receivedAt = __assign(__assign({}, where.receivedAt), { lte: endDate });
                            }
                            if (location) {
                                where.location = location;
                            }
                            if (status) {
                                where.status = status;
                            }
                            return [4 /*yield*/, this.prisma.delivery.findMany({
                                    where: where,
                                    include: { host: true },
                                    orderBy: { receivedAt: 'desc' },
                                })];
                        case 1:
                            deliveries = _a.sent();
                            filtered = deliveries;
                            if (company) {
                                filtered = deliveries.filter(function (d) { var _a, _b; return (_b = (_a = d.host) === null || _a === void 0 ? void 0 : _a.company) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(company.toLowerCase()); });
                            }
                            return [2 /*return*/, filtered];
                    }
                });
            });
        };
        AdminApiController_1.prototype.exportDeliveriesReport = function (res_1, dateFrom_1, dateTo_1, location_2, company_1, status_2) {
            return __awaiter(this, arguments, void 0, function (res, dateFrom, dateTo, location, company, status, format) {
                var data, csv, xlsx, ws, wb, buffer;
                if (format === void 0) { format = 'csv'; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getDeliveriesReport(dateFrom, dateTo, location, company, status)];
                        case 1:
                            data = _a.sent();
                            if (format === 'csv') {
                                csv = this.generateCsv(data, [
                                    'courier',
                                    'recipient',
                                    'location',
                                    'status',
                                    'receivedAt',
                                    'pickedUpAt',
                                ]);
                                res.setHeader('Content-Type', 'text/csv');
                                res.setHeader('Content-Disposition', 'attachment; filename=deliveries-report.csv');
                                return [2 /*return*/, res.send(csv)];
                            }
                            if (!(format === 'excel')) return [3 /*break*/, 3];
                            return [4 /*yield*/, Promise.resolve().then(function () { return require('xlsx'); })];
                        case 2:
                            xlsx = _a.sent();
                            ws = xlsx.utils.json_to_sheet(data.map(function (d) {
                                var _a, _b;
                                return ({
                                    'Courier': d.courier,
                                    'Recipient': d.recipient,
                                    'Host': ((_a = d.host) === null || _a === void 0 ? void 0 : _a.name) || '',
                                    'Host Company': ((_b = d.host) === null || _b === void 0 ? void 0 : _b.company) || '',
                                    'Location': d.location,
                                    'Status': d.status,
                                    'Received At': d.receivedAt ? new Date(d.receivedAt).toLocaleString() : '',
                                    'Picked Up At': d.pickedUpAt ? new Date(d.pickedUpAt).toLocaleString() : '',
                                });
                            }));
                            wb = xlsx.utils.book_new();
                            xlsx.utils.book_append_sheet(wb, ws, 'Deliveries');
                            buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
                            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                            res.setHeader('Content-Disposition', 'attachment; filename=deliveries-report.xlsx');
                            return [2 /*return*/, res.send(buffer)];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        // ============ SETTINGS ============
        AdminApiController_1.prototype.getSettings = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, {
                            site: {
                                name: process.env.SITE_NAME || 'Arafat VMS',
                                timezone: process.env.SITE_TIMEZONE || 'Asia/Qatar',
                            },
                            whatsapp: {
                                enabled: !!(process.env.WHATSAPP_ENDPOINT && process.env.WHATSAPP_API_KEY),
                                provider: 'wbiztool',
                                configured: !!(process.env.WHATSAPP_ENDPOINT && process.env.WHATSAPP_CLIENT_ID && process.env.WHATSAPP_CLIENT && process.env.WHATSAPP_API_KEY),
                            },
                            smtp: {
                                enabled: process.env.SMTP_ENABLED === 'true',
                                host: process.env.SMTP_HOST || 'Not configured',
                                configured: !!process.env.SMTP_HOST && !!process.env.SMTP_USER,
                            },
                            maintenance: {
                                enabled: process.env.MAINTENANCE_MODE === 'true',
                                message: process.env.MAINTENANCE_MESSAGE || 'System under maintenance',
                            },
                        }];
                });
            });
        };
        AdminApiController_1.prototype.testWhatsapp = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                var phone, sent, e_7;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            phone = body.phone;
                            if (!process.env.WHATSAPP_API_KEY || !process.env.WHATSAPP_ENDPOINT) {
                                throw new common_1.HttpException('WhatsApp not configured', common_1.HttpStatus.BAD_REQUEST);
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.whatsappService.send(phone, 'This is a test message from Arafat VMS. If you received this, WhatsApp is configured correctly!')];
                        case 2:
                            sent = _a.sent();
                            if (!sent) {
                                throw new Error('WhatsApp service returned false');
                            }
                            return [2 /*return*/, { success: true, message: 'Test message sent' }];
                        case 3:
                            e_7 = _a.sent();
                            throw new common_1.HttpException('Failed to send test message', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        AdminApiController_1.prototype.testEmail = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                var email, e_8;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            email = body.email;
                            if (!process.env.SMTP_HOST) {
                                throw new common_1.HttpException('SMTP not configured', common_1.HttpStatus.BAD_REQUEST);
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.emailService.send({
                                    to: email,
                                    subject: 'Test Email - Arafat VMS',
                                    html: '<h2>Test Email</h2><p>This is a test email from Arafat VMS. If you received this, SMTP is configured correctly!</p>',
                                })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, { success: true, message: 'Test email sent' }];
                        case 3:
                            e_8 = _a.sent();
                            throw new common_1.HttpException('Failed to send test email', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        AdminApiController_1.prototype.updateSettings = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                var fs, path, envPath, envContent_1, updateEnvVar;
                return __generator(this, function (_a) {
                    fs = require('fs');
                    path = require('path');
                    envPath = path.join(process.cwd(), '.env');
                    try {
                        envContent_1 = fs.readFileSync(envPath, 'utf8');
                        updateEnvVar = function (key, value) {
                            var strValue = String(value);
                            var regex = new RegExp("^".concat(key, "=.*$"), 'm');
                            if (regex.test(envContent_1)) {
                                envContent_1 = envContent_1.replace(regex, "".concat(key, "=").concat(strValue));
                            }
                            else {
                                envContent_1 += "\n".concat(key, "=").concat(strValue);
                            }
                            // Also update process.env for immediate effect
                            process.env[key] = strValue;
                        };
                        // Update SMTP settings
                        if (body.smtp) {
                            if (body.smtp.enabled !== undefined)
                                updateEnvVar('SMTP_ENABLED', body.smtp.enabled);
                            if (body.smtp.host)
                                updateEnvVar('SMTP_HOST', body.smtp.host);
                            if (body.smtp.port)
                                updateEnvVar('SMTP_PORT', body.smtp.port);
                            if (body.smtp.user)
                                updateEnvVar('SMTP_USER', body.smtp.user);
                            if (body.smtp.pass)
                                updateEnvVar('SMTP_PASS', body.smtp.pass);
                            if (body.smtp.from)
                                updateEnvVar('SMTP_FROM', body.smtp.from);
                        }
                        // Update WhatsApp settings
                        if (body.whatsapp) {
                            if (body.whatsapp.endpoint)
                                updateEnvVar('WHATSAPP_ENDPOINT', body.whatsapp.endpoint);
                            if (body.whatsapp.clientId)
                                updateEnvVar('WHATSAPP_CLIENT_ID', body.whatsapp.clientId);
                            if (body.whatsapp.client)
                                updateEnvVar('WHATSAPP_CLIENT', body.whatsapp.client);
                            if (body.whatsapp.apiKey)
                                updateEnvVar('WHATSAPP_API_KEY', body.whatsapp.apiKey);
                        }
                        // Update Maintenance settings
                        if (body.maintenance) {
                            if (body.maintenance.enabled !== undefined)
                                updateEnvVar('MAINTENANCE_MODE', body.maintenance.enabled);
                            if (body.maintenance.message)
                                updateEnvVar('MAINTENANCE_MESSAGE', body.maintenance.message);
                        }
                        // Write updated .env file
                        fs.writeFileSync(envPath, envContent_1);
                        return [2 /*return*/, { success: true, message: 'Settings updated. Some changes may require server restart.' }];
                    }
                    catch (e) {
                        console.error('Failed to update settings:', e);
                        throw new common_1.HttpException('Failed to update settings', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                    }
                    return [2 /*return*/];
                });
            });
        };
        // ============ HELPER METHODS ============
        AdminApiController_1.prototype.generateCsv = function (data, columns) {
            var header = columns.join(',');
            var rows = data.map(function (item) {
                return columns
                    .map(function (col) {
                    var value = item[col];
                    if (value === null || value === undefined)
                        return '';
                    if (typeof value === 'string' && value.includes(',')) {
                        return "\"".concat(value, "\"");
                    }
                    return value;
                })
                    .join(',');
            });
            return __spreadArray([header], rows, true).join('\n');
        };
        return AdminApiController_1;
    }());
    __setFunctionName(_classThis, "AdminApiController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getDashboardKpis_decorators = [(0, common_1.Get)('dashboard/kpis')];
        _getProfile_decorators = [(0, common_1.Get)('profile')];
        _updateProfile_decorators = [(0, common_1.Post)('profile/update')];
        _importHosts_decorators = [(0, common_1.Post)('hosts/import')];
        _getPendingApprovals_decorators = [(0, common_1.Get)('dashboard/pending-approvals')];
        _getReceivedDeliveries_decorators = [(0, common_1.Get)('dashboard/received-deliveries')];
        _getChartData_decorators = [(0, common_1.Get)('dashboard/charts')];
        _getCurrentVisitors_decorators = [(0, common_1.Get)('dashboard/current-visitors')];
        _approveVisit_decorators = [(0, common_1.Post)('dashboard/approve/:id')];
        _rejectVisit_decorators = [(0, common_1.Post)('dashboard/reject/:id')];
        _checkoutVisitor_decorators = [(0, common_1.Post)('dashboard/checkout/:sessionId')];
        _getQrCode_decorators = [(0, common_1.Get)('qr/:visitId')];
        _sendQr_decorators = [(0, common_1.Post)('send-qr')];
        _changePassword_decorators = [(0, common_1.Post)('change-password')];
        _getVisitorsReport_decorators = [(0, common_1.Get)('reports/visitors')];
        _exportVisitorsReport_decorators = [(0, common_1.Get)('reports/visitors/export')];
        _getDeliveriesReport_decorators = [(0, common_1.Get)('reports/deliveries')];
        _exportDeliveriesReport_decorators = [(0, common_1.Get)('reports/deliveries/export')];
        _getSettings_decorators = [(0, common_1.Get)('settings')];
        _testWhatsapp_decorators = [(0, common_1.Post)('settings/test-whatsapp')];
        _testEmail_decorators = [(0, common_1.Post)('settings/test-email')];
        _updateSettings_decorators = [(0, common_1.Post)('settings/update')];
        __esDecorate(_classThis, null, _getDashboardKpis_decorators, { kind: "method", name: "getDashboardKpis", static: false, private: false, access: { has: function (obj) { return "getDashboardKpis" in obj; }, get: function (obj) { return obj.getDashboardKpis; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getProfile_decorators, { kind: "method", name: "getProfile", static: false, private: false, access: { has: function (obj) { return "getProfile" in obj; }, get: function (obj) { return obj.getProfile; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateProfile_decorators, { kind: "method", name: "updateProfile", static: false, private: false, access: { has: function (obj) { return "updateProfile" in obj; }, get: function (obj) { return obj.updateProfile; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _importHosts_decorators, { kind: "method", name: "importHosts", static: false, private: false, access: { has: function (obj) { return "importHosts" in obj; }, get: function (obj) { return obj.importHosts; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPendingApprovals_decorators, { kind: "method", name: "getPendingApprovals", static: false, private: false, access: { has: function (obj) { return "getPendingApprovals" in obj; }, get: function (obj) { return obj.getPendingApprovals; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getReceivedDeliveries_decorators, { kind: "method", name: "getReceivedDeliveries", static: false, private: false, access: { has: function (obj) { return "getReceivedDeliveries" in obj; }, get: function (obj) { return obj.getReceivedDeliveries; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getChartData_decorators, { kind: "method", name: "getChartData", static: false, private: false, access: { has: function (obj) { return "getChartData" in obj; }, get: function (obj) { return obj.getChartData; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCurrentVisitors_decorators, { kind: "method", name: "getCurrentVisitors", static: false, private: false, access: { has: function (obj) { return "getCurrentVisitors" in obj; }, get: function (obj) { return obj.getCurrentVisitors; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _approveVisit_decorators, { kind: "method", name: "approveVisit", static: false, private: false, access: { has: function (obj) { return "approveVisit" in obj; }, get: function (obj) { return obj.approveVisit; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _rejectVisit_decorators, { kind: "method", name: "rejectVisit", static: false, private: false, access: { has: function (obj) { return "rejectVisit" in obj; }, get: function (obj) { return obj.rejectVisit; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _checkoutVisitor_decorators, { kind: "method", name: "checkoutVisitor", static: false, private: false, access: { has: function (obj) { return "checkoutVisitor" in obj; }, get: function (obj) { return obj.checkoutVisitor; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getQrCode_decorators, { kind: "method", name: "getQrCode", static: false, private: false, access: { has: function (obj) { return "getQrCode" in obj; }, get: function (obj) { return obj.getQrCode; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendQr_decorators, { kind: "method", name: "sendQr", static: false, private: false, access: { has: function (obj) { return "sendQr" in obj; }, get: function (obj) { return obj.sendQr; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _changePassword_decorators, { kind: "method", name: "changePassword", static: false, private: false, access: { has: function (obj) { return "changePassword" in obj; }, get: function (obj) { return obj.changePassword; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getVisitorsReport_decorators, { kind: "method", name: "getVisitorsReport", static: false, private: false, access: { has: function (obj) { return "getVisitorsReport" in obj; }, get: function (obj) { return obj.getVisitorsReport; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _exportVisitorsReport_decorators, { kind: "method", name: "exportVisitorsReport", static: false, private: false, access: { has: function (obj) { return "exportVisitorsReport" in obj; }, get: function (obj) { return obj.exportVisitorsReport; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getDeliveriesReport_decorators, { kind: "method", name: "getDeliveriesReport", static: false, private: false, access: { has: function (obj) { return "getDeliveriesReport" in obj; }, get: function (obj) { return obj.getDeliveriesReport; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _exportDeliveriesReport_decorators, { kind: "method", name: "exportDeliveriesReport", static: false, private: false, access: { has: function (obj) { return "exportDeliveriesReport" in obj; }, get: function (obj) { return obj.exportDeliveriesReport; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSettings_decorators, { kind: "method", name: "getSettings", static: false, private: false, access: { has: function (obj) { return "getSettings" in obj; }, get: function (obj) { return obj.getSettings; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _testWhatsapp_decorators, { kind: "method", name: "testWhatsapp", static: false, private: false, access: { has: function (obj) { return "testWhatsapp" in obj; }, get: function (obj) { return obj.testWhatsapp; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _testEmail_decorators, { kind: "method", name: "testEmail", static: false, private: false, access: { has: function (obj) { return "testEmail" in obj; }, get: function (obj) { return obj.testEmail; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateSettings_decorators, { kind: "method", name: "updateSettings", static: false, private: false, access: { has: function (obj) { return "updateSettings" in obj; }, get: function (obj) { return obj.updateSettings; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AdminApiController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AdminApiController = _classThis;
}();
exports.AdminApiController = AdminApiController;
