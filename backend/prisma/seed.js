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
var client_1 = require("@prisma/client");
var bcrypt = require("bcrypt");
var sync_1 = require("csv-parse/sync");
var fs = require("fs");
var path = require("path");
var crypto_1 = require("crypto");
var prisma = new client_1.PrismaClient();
var BCRYPT_ROUNDS = 12;
function mapLocation(loc) {
    if (!loc)
        return null;
    var s = loc.toLowerCase();
    if (s.includes('barwa'))
        return 'BARWA_TOWERS';
    if (s.includes('marina') && s.includes('50'))
        return 'MARINA_50';
    if (s.includes('element') || s.includes('mariott'))
        return 'ELEMENT_MARIOTT';
    return null;
}
function seedUsers() {
    return __awaiter(this, void 0, void 0, function () {
        var csvPath, content, records, imported, skipped, existing, _i, records_1, row, idStr, email, name_1, password, roleString, id, existingUser, emailExists, role, rawPassword, hash;
        var _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    csvPath = path.join(__dirname, '../../Adel Data/users-export.csv');
                    if (!fs.existsSync(csvPath)) {
                        console.log('Users CSV file not found, skipping user import');
                        return [2 /*return*/];
                    }
                    content = fs.readFileSync(csvPath, 'utf-8');
                    records = (0, sync_1.parse)(content, {
                        columns: true,
                        skip_empty_lines: true,
                        trim: true,
                        relax_column_count: true,
                    });
                    imported = 0;
                    skipped = 0;
                    existing = 0;
                    _i = 0, records_1 = records;
                    _f.label = 1;
                case 1:
                    if (!(_i < records_1.length)) return [3 /*break*/, 7];
                    row = records_1[_i];
                    idStr = (_a = row.id) === null || _a === void 0 ? void 0 : _a.trim();
                    email = (_b = row.Email) === null || _b === void 0 ? void 0 : _b.trim();
                    name_1 = (_c = row.Name) === null || _c === void 0 ? void 0 : _c.trim();
                    password = (_d = row.password) === null || _d === void 0 ? void 0 : _d.trim();
                    roleString = (_e = row.Role) === null || _e === void 0 ? void 0 : _e.trim();
                    // Skip rows without required fields
                    if (!email || !name_1) {
                        skipped++;
                        return [3 /*break*/, 6];
                    }
                    id = idStr ? parseInt(idStr, 10) : null;
                    if (!id || isNaN(id)) {
                        skipped++;
                        console.log("Skipping user without valid ID: ".concat(email));
                        return [3 /*break*/, 6];
                    }
                    return [4 /*yield*/, prisma.user.findUnique({ where: { id: id } })];
                case 2:
                    existingUser = _f.sent();
                    if (existingUser) {
                        existing++;
                        console.log("Skipping existing user (ID: ".concat(id, "): ").concat(existingUser.email));
                        return [3 /*break*/, 6];
                    }
                    return [4 /*yield*/, prisma.user.findUnique({ where: { email: email } })];
                case 3:
                    emailExists = _f.sent();
                    if (emailExists) {
                        existing++;
                        console.log("Skipping user - email already exists: ".concat(email));
                        return [3 /*break*/, 6];
                    }
                    role = ['ADMIN', 'RECEPTION', 'HOST'].includes(roleString)
                        ? roleString
                        : 'RECEPTION';
                    rawPassword = password || 'changeme123';
                    return [4 /*yield*/, bcrypt.hash(rawPassword, BCRYPT_ROUNDS)];
                case 4:
                    hash = _f.sent();
                    // Create user with specific ID from CSV
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                id: id,
                                email: email,
                                name: name_1,
                                password: hash,
                                role: role,
                            },
                        })];
                case 5:
                    // Create user with specific ID from CSV
                    _f.sent();
                    imported++;
                    console.log("Added new user (ID: ".concat(id, "): ").concat(email, " (").concat(role, ")"));
                    _f.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7:
                    console.log("Users: ".concat(imported, " imported, ").concat(existing, " existing, ").concat(skipped, " skipped"));
                    return [2 /*return*/];
            }
        });
    });
}
function seedHostsFromCsv() {
    return __awaiter(this, void 0, void 0, function () {
        var csvPath, content, records, imported, existingCount, errorCount, invalidCount, invalidRows, _i, records_2, row, name_2, company, phoneStr, phone, email, externalId, location_1, status_1, hostData, existingHost, e_1, header, rows, outPath;
        var _a, _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    csvPath = path.join(__dirname, '../../Adel Data/members-28-01-2026-T0941.csv');
                    if (!fs.existsSync(csvPath)) {
                        console.log('CSV file not found, skipping host import');
                        return [2 /*return*/];
                    }
                    content = fs.readFileSync(csvPath, 'utf-8');
                    records = (0, sync_1.parse)(content, {
                        columns: true,
                        skip_empty_lines: true,
                        trim: true,
                        relax_column_count: true,
                    });
                    imported = 0;
                    existingCount = 0;
                    errorCount = 0;
                    invalidCount = 0;
                    invalidRows = [];
                    _i = 0, records_2 = records;
                    _g.label = 1;
                case 1:
                    if (!(_i < records_2.length)) return [3 /*break*/, 8];
                    row = records_2[_i];
                    name_2 = (_a = row.Name) === null || _a === void 0 ? void 0 : _a.trim();
                    company = (_b = row.Company) === null || _b === void 0 ? void 0 : _b.trim();
                    phoneStr = ((_c = row['Phone Number']) !== null && _c !== void 0 ? _c : '').toString().replace(/^\+/, '').trim();
                    phone = phoneStr.length > 0 ? phoneStr : null;
                    email = (_d = row['Email Address']) === null || _d === void 0 ? void 0 : _d.trim();
                    // Updated validation: email is required, phone is optional
                    if (!name_2 || !company || !email) {
                        invalidCount++;
                        invalidRows.push(__assign(__assign({}, row), { Reason: 'Missing Name, Company, or Email' }));
                        return [3 /*break*/, 7];
                    }
                    externalId = (_e = row.ID) === null || _e === void 0 ? void 0 : _e.trim();
                    location_1 = mapLocation(row.Location);
                    status_1 = ((_f = row.Status) !== null && _f !== void 0 ? _f : '').toLowerCase() === 'active' ? 1 : 0;
                    hostData = {
                        name: name_2.substring(0, 100),
                        company: company.substring(0, 100),
                        email: email.substring(0, 100),
                        phone: phone ? phone.substring(0, 191) : null,
                        location: location_1,
                        status: status_1,
                        externalId: externalId || undefined,
                    };
                    _g.label = 2;
                case 2:
                    _g.trys.push([2, 6, , 7]);
                    if (!externalId) return [3 /*break*/, 4];
                    return [4 /*yield*/, prisma.host.findUnique({ where: { externalId: externalId } })];
                case 3:
                    existingHost = _g.sent();
                    if (existingHost) {
                        // Skip existing hosts - don't update them
                        existingCount++;
                        console.log("Skipping existing host (ID: ".concat(externalId, "): ").concat(name_2));
                        return [3 /*break*/, 7];
                    }
                    _g.label = 4;
                case 4: 
                // Only create new hosts
                return [4 /*yield*/, prisma.host.create({ data: hostData })];
                case 5:
                    // Only create new hosts
                    _g.sent();
                    imported++;
                    console.log("Added new host: ".concat(name_2, " (ID: ").concat(externalId || 'none', ")"));
                    return [3 /*break*/, 7];
                case 6:
                    e_1 = _g.sent();
                    console.error("Error importing ".concat(name_2, " (").concat(email, "):"), e_1);
                    errorCount++;
                    invalidRows.push(__assign(__assign({}, row), { Reason: "Db Error: ".concat(e_1 instanceof Error ? e_1.message : String(e_1)) }));
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8:
                    if (invalidRows.length > 0) {
                        header = Object.keys(invalidRows[0]).join(',') + '\n';
                        rows = invalidRows.map(function (r) { return Object.values(r).map(function (v) { return "\"".concat(String(v !== null && v !== void 0 ? v : '').replace(/"/g, '""'), "\""); }).join(','); }).join('\n');
                        outPath = path.join(__dirname, '../../Adel Data/invalid_hosts.csv');
                        fs.writeFileSync(outPath, header + rows);
                        console.log("Wrote ".concat(invalidRows.length, " invalid records to ").concat(outPath));
                    }
                    console.log("Hosts: ".concat(imported, " imported, ").concat(existingCount, " existing, ").concat(invalidCount, " invalid data, ").concat(errorCount, " errors"));
                    return [2 /*return*/];
            }
        });
    });
}
function seedPreRegistersByReception() {
    return __awaiter(this, void 0, void 0, function () {
        var reception, host, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Seeding Pre-Registers by Reception...');
                    return [4 /*yield*/, prisma.user.findFirst({
                            where: { role: 'RECEPTION' }
                        })];
                case 1:
                    reception = _a.sent();
                    if (!reception) {
                        console.log('No reception user found for seeding pre-registers');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, prisma.host.findFirst({
                            where: { status: 1 }
                        })];
                case 2:
                    host = _a.sent();
                    if (!host) {
                        console.log('No active host found for seeding pre-registers');
                        return [2 /*return*/];
                    }
                    i = 0;
                    _a.label = 3;
                case 3:
                    if (!(i < 5)) return [3 /*break*/, 6];
                    return [4 /*yield*/, prisma.visit.create({
                            data: {
                                sessionId: (0, crypto_1.randomUUID)(),
                                visitorName: "PreReg Visitor ".concat(i + 1),
                                visitorCompany: 'Test Corp',
                                visitorPhone: "+123456789".concat(i),
                                visitorEmail: "prereg".concat(i, "@example.com"),
                                purpose: 'Meeting',
                                location: 'BARWA_TOWERS',
                                status: 'PRE_REGISTERED',
                                hostId: host.id,
                                preRegisteredById: reception.id.toString(),
                                expectedDate: new Date(),
                            }
                        })];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6:
                    console.log('Created 5 pre-registered visits by reception');
                    return [2 /*return*/];
            }
        });
    });
}
function seedVisitorsByHost() {
    return __awaiter(this, void 0, void 0, function () {
        var host, statuses, i, status_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Seeding Visitors by Host...');
                    return [4 /*yield*/, prisma.host.findFirst({
                            where: { status: 1 }
                        })];
                case 1:
                    host = _a.sent();
                    if (!host) {
                        console.log('No active host found for seeding visitors');
                        return [2 /*return*/];
                    }
                    statuses = [
                        'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CHECKED_IN', 'CHECKED_OUT',
                        'PENDING_APPROVAL', 'APPROVED', 'CHECKED_IN', 'CHECKED_IN', 'CHECKED_OUT'
                    ];
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < 10)) return [3 /*break*/, 5];
                    status_2 = statuses[i];
                    return [4 /*yield*/, prisma.visit.create({
                            data: {
                                sessionId: (0, crypto_1.randomUUID)(),
                                visitorName: "Host Visitor ".concat(i + 1),
                                visitorCompany: 'Partner Inc',
                                visitorPhone: "+987654321".concat(i),
                                visitorEmail: "hostvis".concat(i, "@example.com"),
                                purpose: 'Site Visit',
                                location: 'MARINA_50',
                                status: status_2,
                                hostId: host.id,
                                expectedDate: new Date(),
                                // Add specific timestamps based on status
                                approvedAt: ['APPROVED', 'CHECKED_IN', 'CHECKED_OUT'].includes(status_2) ? new Date() : undefined,
                                checkInAt: ['CHECKED_IN', 'CHECKED_OUT'].includes(status_2) ? new Date() : undefined,
                                checkOutAt: status_2 === 'CHECKED_OUT' ? new Date() : undefined,
                                rejectedAt: status_2 === 'REJECTED' ? new Date() : undefined,
                            }
                        })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log('Created 10 visitors by host with different statuses');
                    return [2 /*return*/];
            }
        });
    });
}
function seedDeliveries() {
    return __awaiter(this, void 0, void 0, function () {
        var host, i, isPickedUp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Seeding Deliveries...');
                    return [4 /*yield*/, prisma.host.findFirst({
                            where: { status: 1 }
                        })];
                case 1:
                    host = _a.sent();
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < 10)) return [3 /*break*/, 5];
                    isPickedUp = i % 2 === 0;
                    return [4 /*yield*/, prisma.delivery.create({
                            data: {
                                recipient: host ? host.name : 'General Recipient',
                                hostId: host ? host.id : undefined,
                                courier: "Courier Service ".concat(i + 1),
                                location: 'ELEMENT_MARIOTT',
                                status: isPickedUp ? 'PICKED_UP' : 'RECEIVED',
                                notes: "Package #".concat(i + 1),
                                receivedAt: new Date(),
                                pickedUpAt: isPickedUp ? new Date() : undefined,
                            }
                        })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log('Created 10 deliveries with different statuses');
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, seedUsers()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, seedHostsFromCsv()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, seedPreRegistersByReception()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, seedVisitorsByHost()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, seedDeliveries()];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
