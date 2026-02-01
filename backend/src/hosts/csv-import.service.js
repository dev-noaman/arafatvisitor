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
exports.CsvImportService = void 0;
var common_1 = require("@nestjs/common");
var sync_1 = require("csv-parse/sync");
var CsvImportService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var CsvImportService = _classThis = /** @class */ (function () {
        function CsvImportService_1(prisma, hostsService) {
            this.prisma = prisma;
            this.hostsService = hostsService;
        }
        CsvImportService_1.prototype.mapLocation = function (loc) {
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
        };
        CsvImportService_1.prototype.importFromBuffer = function (buffer) {
            return __awaiter(this, void 0, void 0, function () {
                var records, imported, skipped, errors, i, row, name_1, company, phone, externalId, email, existing, location_1, status_1, e_1;
                var _a, _b, _c, _d, _e, _f;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            records = (0, sync_1.parse)(buffer, {
                                columns: true,
                                skip_empty_lines: true,
                                trim: true,
                                relax_column_count: true,
                            });
                            imported = 0;
                            skipped = 0;
                            errors = [];
                            i = 0;
                            _g.label = 1;
                        case 1:
                            if (!(i < records.length)) return [3 /*break*/, 8];
                            row = records[i];
                            name_1 = (_a = row.Name) === null || _a === void 0 ? void 0 : _a.trim();
                            company = (_b = row.Company) === null || _b === void 0 ? void 0 : _b.trim();
                            phone = ((_c = row['Phone Number']) !== null && _c !== void 0 ? _c : '').toString().replace(/^\+/, '').trim();
                            if (!name_1 || !company) {
                                skipped++;
                                return [3 /*break*/, 7];
                            }
                            if (!phone || phone.length < 6) {
                                skipped++;
                                return [3 /*break*/, 7];
                            }
                            externalId = ((_d = row.ID) === null || _d === void 0 ? void 0 : _d.trim()) || undefined;
                            email = ((_e = row['Email Address']) === null || _e === void 0 ? void 0 : _e.trim()) || undefined;
                            if (!externalId) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.host.findUnique({ where: { externalId: externalId } })];
                        case 2:
                            existing = _g.sent();
                            if (existing) {
                                skipped++;
                                return [3 /*break*/, 7];
                            }
                            _g.label = 3;
                        case 3:
                            location_1 = this.mapLocation(row.Location);
                            status_1 = ((_f = row.Status) !== null && _f !== void 0 ? _f : '').toLowerCase() === 'active' ? 1 : 0;
                            _g.label = 4;
                        case 4:
                            _g.trys.push([4, 6, , 7]);
                            return [4 /*yield*/, this.prisma.host.create({
                                    data: {
                                        name: name_1.substring(0, 100),
                                        company: company.substring(0, 100),
                                        email: email ? email.substring(0, 100) : undefined,
                                        phone: phone.substring(0, 191),
                                        location: location_1,
                                        status: status_1,
                                        externalId: externalId || undefined,
                                    },
                                })];
                        case 5:
                            _g.sent();
                            imported++;
                            return [3 /*break*/, 7];
                        case 6:
                            e_1 = _g.sent();
                            errors.push("Row ".concat(i + 2, ": ").concat(e_1.message));
                            return [3 /*break*/, 7];
                        case 7:
                            i++;
                            return [3 /*break*/, 1];
                        case 8: return [2 /*return*/, { imported: imported, skipped: skipped, errors: errors }];
                    }
                });
            });
        };
        return CsvImportService_1;
    }());
    __setFunctionName(_classThis, "CsvImportService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CsvImportService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CsvImportService = _classThis;
}();
exports.CsvImportService = CsvImportService;
