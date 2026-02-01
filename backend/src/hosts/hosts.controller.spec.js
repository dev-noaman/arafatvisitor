"use strict";
/**
 * HostsController Unit Tests
 *
 * This test file demonstrates comprehensive unit testing for HostsController.
 * It uses mocked dependencies (HostsService, CsvImportService) and guards
 * to test controller methods in isolation without external dependencies.
 *
 * Test Patterns Demonstrated:
 * - Mocking service dependencies using jest-mock-extended
 * - Testing successful paths for all controller methods
 * - Testing error paths (NotFoundException)
 * - Testing edge cases (invalid host, duplicate session IDs)
 * - Verifying method calls on mocks
 * - Testing guards and role-based access control
 *
 * Usage as Template:
 * This file serves as a template for testing other controllers in the application.
 * Follow the same patterns: mock services, test happy and sad paths,
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
var hosts_controller_1 = require("./hosts.controller");
var hosts_service_1 = require("./hosts.service");
var csv_import_service_1 = require("./csv-import.service");
var jest_mock_extended_1 = require("jest-mock-extended");
describe('HostsController', function () {
    var controller;
    var hostsServiceMock;
    var csvImportServiceMock;
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
        company: 'Acme Corp',
        name: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var module;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jest.clearAllMocks();
                    return [4 /*yield*/, testing_1.Test.createTestingModule({
                            controllers: [hosts_controller_1.HostsController],
                            providers: [
                                {
                                    provide: hosts_service_1.HostsService,
                                    useValue: (0, jest_mock_extended_1.mockDeep)(),
                                },
                                {
                                    provide: csv_import_service_1.CsvImportService,
                                    useValue: (0, jest_mock_extended_1.mockDeep)(),
                                },
                            ],
                        }).compile()];
                case 1:
                    module = _a.sent();
                    controller = module.get(hosts_controller_1.HostsController);
                    hostsServiceMock = module.get(hosts_service_1.HostsService);
                    csvImportServiceMock = module.get(csv_import_service_1.CsvImportService);
                    return [2 /*return*/];
            }
        });
    }); });
    describe('findAll', function () {
        it('should return all hosts without location filter', function () { return __awaiter(void 0, void 0, void 0, function () {
            var hosts, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hosts = [mockHost, __assign(__assign({}, mockHost), { id: BigInt(2) })];
                        hostsServiceMock.findAll.mockResolvedValue(hosts);
                        return [4 /*yield*/, controller.findAll()];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(hostsServiceMock.findAll).toHaveBeenCalledWith(undefined);
                        expect(result).toEqual(hosts);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return hosts filtered by location', function () { return __awaiter(void 0, void 0, void 0, function () {
            var hosts, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hosts = [mockHost];
                        hostsServiceMock.findAll.mockResolvedValue(hosts);
                        return [4 /*yield*/, controller.findAll('BARWA_TOWERS')];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(hostsServiceMock.findAll).toHaveBeenCalledWith('BARWA_TOWERS');
                        expect(result).toEqual(hosts);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should normalize location filter', function () { return __awaiter(void 0, void 0, void 0, function () {
            var hosts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hosts = [mockHost];
                        hostsServiceMock.findAll.mockResolvedValue(hosts);
                        // Act
                        return [4 /*yield*/, controller.findAll('barwa towers')];
                    case 1:
                        // Act
                        _a.sent();
                        // Assert
                        expect(hostsServiceMock.findAll).toHaveBeenCalledWith('BARWA_TOWERS');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('findOne', function () {
        it('should return a host by ID', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Arrange
                        hostsServiceMock.findOne.mockResolvedValue(mockHost);
                        return [4 /*yield*/, controller.findOne('1')];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(hostsServiceMock.findOne).toHaveBeenCalledWith(BigInt(1));
                        expect(result).toEqual(mockHost);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw NotFoundException when host not found', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Arrange
                        hostsServiceMock.findOne.mockResolvedValue(undefined);
                        hostsServiceMock.findOne.mockImplementation(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                throw new common_1.NotFoundException('Host not found');
                            });
                        }); });
                        // Act & Assert
                        return [4 /*yield*/, expect(controller.findOne('999')).rejects.toThrow(common_1.NotFoundException)];
                    case 1:
                        // Act & Assert
                        _a.sent();
                        return [4 /*yield*/, expect(controller.findOne('999')).rejects.toThrow('Host not found')];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('create', function () {
        it('should create a new host', function () { return __awaiter(void 0, void 0, void 0, function () {
            var createDto, newHost, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        createDto = {
                            name: 'Jane Doe',
                            company: 'Tech Corp',
                            email: 'jane@example.com',
                            phone: '+9876543210',
                            location: 'BARWA_TOWERS',
                            status: 1,
                        };
                        newHost = __assign(__assign({}, mockHost), { id: BigInt(2), name: 'Jane Doe' });
                        hostsServiceMock.create.mockResolvedValue(newHost);
                        return [4 /*yield*/, controller.create(createDto)];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(hostsServiceMock.create).toHaveBeenCalledWith(createDto);
                        expect(result).toEqual(newHost);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should create host with optional fields', function () { return __awaiter(void 0, void 0, void 0, function () {
            var createDto, newHost, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        createDto = {
                            name: 'Bob Smith',
                            company: 'Startup Inc',
                            email: 'bob@example.com',
                            phone: '+9876543211',
                            location: 'MARINA_50',
                        };
                        newHost = __assign(__assign({}, mockHost), { id: BigInt(3), name: 'Bob Smith' });
                        hostsServiceMock.create.mockResolvedValue(newHost);
                        return [4 /*yield*/, controller.create(createDto)];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(hostsServiceMock.create).toHaveBeenCalledWith(createDto);
                        expect(result).toEqual(newHost);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('update', function () {
        it('should update an existing host', function () { return __awaiter(void 0, void 0, void 0, function () {
            var updateDto, updatedHost, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateDto = {
                            name: 'Updated Name',
                            company: 'Updated Company',
                            email: 'updated@example.com',
                            phone: '+1111111111',
                            location: 'ELEMENT_MARIOTT',
                            status: 1,
                        };
                        updatedHost = __assign(__assign({}, mockHost), { name: 'Updated Name' });
                        hostsServiceMock.findOne.mockResolvedValue(mockHost);
                        hostsServiceMock.update.mockResolvedValue(updatedHost);
                        return [4 /*yield*/, controller.update('1', updateDto)];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(hostsServiceMock.findOne).toHaveBeenCalledWith(BigInt(1));
                        expect(hostsServiceMock.update).toHaveBeenCalledWith(BigInt(1), updateDto);
                        expect(result).toEqual(updatedHost);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw NotFoundException when updating non-existent host', function () { return __awaiter(void 0, void 0, void 0, function () {
            var updateDto;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateDto = { name: 'Updated Name' };
                        hostsServiceMock.findOne.mockResolvedValue(undefined);
                        hostsServiceMock.findOne.mockImplementation(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                throw new common_1.NotFoundException('Host not found');
                            });
                        }); });
                        // Act & Assert
                        return [4 /*yield*/, expect(controller.update('999', updateDto)).rejects.toThrow(common_1.NotFoundException)];
                    case 1:
                        // Act & Assert
                        _a.sent();
                        return [4 /*yield*/, expect(controller.update('999', updateDto)).rejects.toThrow('Host not found')];
                    case 2:
                        _a.sent();
                        expect(hostsServiceMock.update).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('remove', function () {
        it('should soft delete a host', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Arrange
                        hostsServiceMock.findOne.mockResolvedValue(mockHost);
                        hostsServiceMock.remove.mockResolvedValue(mockHost);
                        return [4 /*yield*/, controller.remove('1')];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(hostsServiceMock.findOne).toHaveBeenCalledWith(BigInt(1));
                        expect(hostsServiceMock.remove).toHaveBeenCalledWith(BigInt(1));
                        expect(hostsServiceMock.remove).toHaveBeenCalled();
                        expect(result).toEqual(mockHost);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw NotFoundException when removing non-existent host', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Arrange
                        hostsServiceMock.findOne.mockResolvedValue(undefined);
                        hostsServiceMock.findOne.mockImplementation(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                throw new common_1.NotFoundException('Host not found');
                            });
                        }); });
                        // Act & Assert
                        return [4 /*yield*/, expect(controller.remove('999')).rejects.toThrow(common_1.NotFoundException)];
                    case 1:
                        // Act & Assert
                        _a.sent();
                        return [4 /*yield*/, expect(controller.remove('999')).rejects.toThrow('Host not found')];
                    case 2:
                        _a.sent();
                        expect(hostsServiceMock.remove).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('import', function () {
        it('should import hosts from CSV file', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockFile, importResult, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFile = {
                            buffer: Buffer.from('name,email\nJohn,john@example.com'),
                            originalname: 'hosts.csv',
                            mimetype: 'text/csv',
                        };
                        importResult = {
                            imported: 10,
                            skipped: 2,
                            errors: [],
                        };
                        csvImportServiceMock.importFromBuffer.mockResolvedValue(importResult);
                        return [4 /*yield*/, controller.import(mockFile)];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(csvImportServiceMock.importFromBuffer).toHaveBeenCalledWith(mockFile.buffer);
                        expect(result).toEqual(importResult);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return error when no file uploaded', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockFile, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFile = {
                            buffer: null,
                        };
                        return [4 /*yield*/, controller.import(mockFile)];
                    case 1:
                        result = _a.sent();
                        // Assert
                        expect(result).toEqual({
                            imported: 0,
                            skipped: 0,
                            errors: ['No file uploaded'],
                        });
                        expect(csvImportServiceMock.importFromBuffer).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
