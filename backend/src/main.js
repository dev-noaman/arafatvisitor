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
// BigInt JSON serialization support (PostgreSQL IDs)
BigInt.prototype.toJSON = function () {
    return this.toString();
};
var core_1 = require("@nestjs/core");
var common_1 = require("@nestjs/common");
var app_module_1 = require("./app.module");
var prisma_service_1 = require("./prisma/prisma.service");
var bcrypt = require("bcrypt");
var path = require("path");
function bootstrap() {
    return __awaiter(this, void 0, void 0, function () {
        var app, httpAdapter, expressApp, express, AdminJS, AdminJSExpress, AdminJSPrisma, ComponentLoader, prisma_1, cookieSecret, runtimeModel, models, getModel, componentLoader, componentsDir, Components, admin, rootPath_1, session, MemoryStore, sharedSessionStore, sharedSessionConfig, adminRouter, httpAdapter_1, expressApp_1, autoLoginSessionMiddleware, showAdminQuickLogin, loginPageStyles, quickLoginFormsHtml_1, logoutSessionMiddleware, port_1, settingsSessionMiddleware, requireAdminSession, jsonParser, jsonParserLarge, err_1, port;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core_1.NestFactory.create(app_module_1.AppModule, {
                        bodyParser: false,
                    })];
                case 1:
                    app = _a.sent();
                    httpAdapter = app.getHttpAdapter();
                    expressApp = httpAdapter.getInstance();
                    express = require('express');
                    expressApp.use(express.json({ limit: '50mb' }));
                    expressApp.use(express.urlencoded({ extended: true, limit: '50mb' }));
                    app.useGlobalPipes(new common_1.ValidationPipe({
                        whitelist: true,
                        forbidNonWhitelisted: true,
                        transform: true,
                        transformOptions: { enableImplicitConversion: true },
                    }));
                    app.enableCors({
                        origin: [
                            'http://localhost:5173',
                            'http://127.0.0.1:5173',
                            'http://localhost:5174',
                            'http://127.0.0.1:5174',
                            'http://localhost:5175',
                            'http://127.0.0.1:5175',
                            'http://localhost:5176',
                            'http://127.0.0.1:5176',
                        ],
                        credentials: true,
                    });
                    // Serve custom admin CSS (sidebar visibility)
                    app.useStaticAssets(path.join(process.cwd(), 'public'), { prefix: '/' });
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, , 8]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('adminjs'); })];
                case 3:
                    AdminJS = (_a.sent()).default;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('@adminjs/express'); })];
                case 4:
                    AdminJSExpress = _a.sent();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('@adminjs/prisma'); })];
                case 5:
                    AdminJSPrisma = _a.sent();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('adminjs'); })];
                case 6:
                    ComponentLoader = (_a.sent()).ComponentLoader;
                    AdminJS.registerAdapter({ Database: AdminJSPrisma.Database, Resource: AdminJSPrisma.Resource });
                    prisma_1 = app.get(prisma_service_1.PrismaService);
                    cookieSecret = process.env.ADMINJS_COOKIE_SECRET || 'adminjs-secret-change-me-32chars';
                    runtimeModel = prisma_1._runtimeDataModel;
                    // If runtimeModel exists (Prisma 5+), transform it for AdminJS
                    if (runtimeModel && runtimeModel.models) {
                        models = Object.entries(runtimeModel.models).map(function (_a) {
                            var name = _a[0], model = _a[1];
                            return ({
                                name: name,
                                fields: model.fields.map(function (f) { return ({
                                    name: f.name,
                                    kind: f.kind,
                                    type: f.type,
                                    isRequired: f.isRequired,
                                    isList: f.isList,
                                    isUnique: f.isUnique,
                                    isId: f.isId,
                                    relationName: f.relationName,
                                }); }),
                            });
                        });
                        // Patch _baseDmmf for AdminJS compatibility
                        prisma_1._baseDmmf = {
                            datamodel: { models: models },
                            datamodelEnumMap: runtimeModel.enums || {},
                        };
                    }
                    getModel = function (name) { var _a, _b, _c; return (_c = (_b = (_a = prisma_1._baseDmmf) === null || _a === void 0 ? void 0 : _a.datamodel) === null || _b === void 0 ? void 0 : _b.models) === null || _c === void 0 ? void 0 : _c.find(function (m) { return m.name === name; }); };
                    if (!getModel('User')) {
                        console.log('DMMF patch failed, models not available');
                        throw new Error('Could not patch Prisma DMMF for AdminJS');
                    }
                    componentLoader = new ComponentLoader();
                    componentsDir = path.join(process.cwd(), 'src', 'admin', 'components');
                    Components = {
                        Dashboard: componentLoader.add('Dashboard', path.join(componentsDir, 'Dashboard')),
                        SendQrModal: componentLoader.add('SendQrModal', path.join(componentsDir, 'SendQrModal')),
                        ChangePasswordModal: componentLoader.add('ChangePasswordModal', path.join(componentsDir, 'ChangePasswordModal')),
                        ChangePasswordPage: componentLoader.add('ChangePasswordPage', path.join(componentsDir, 'ChangePasswordPage')),
                        EditProfilePanel: componentLoader.add('EditProfilePanel', path.join(componentsDir, 'EditProfilePanel')),
                        ReportsPanel: componentLoader.add('ReportsPanel', path.join(componentsDir, 'ReportsPanel')),
                        SettingsPanel: componentLoader.add('SettingsPanel', path.join(componentsDir, 'SettingsPanel')),
                        VisitorCards: componentLoader.add('VisitorCards', path.join(componentsDir, 'VisitorCards')),
                        BulkImportHosts: componentLoader.add('BulkImportHosts', path.join(componentsDir, 'BulkImportHosts')),
                    };
                    componentLoader.override('LoggedIn', path.join(componentsDir, 'LoggedIn'));
                    componentLoader.override('SidebarPages', path.join(componentsDir, 'SidebarPages'));
                    componentLoader.override('SidebarResourceSection', path.join(componentsDir, 'SidebarResourceSection'));
                    componentLoader.override('Login', path.join(componentsDir, 'Login'));
                    admin = new AdminJS({
                        rootPath: '/admin',
                        loginPath: '/admin/login',
                        logoutPath: '/admin/logout',
                        componentLoader: componentLoader,
                        branding: {
                            companyName: 'Arafat VMS',
                            logo: false,
                            favicon: '/favicon.ico',
                            withMadeWithLove: false,
                        },
                        dashboard: {
                            component: Components.Dashboard,
                        },
                        pages: {
                            ChangePassword: {
                                component: Components.ChangePasswordPage,
                                icon: 'Key',
                            },
                            EditProfile: {
                                component: Components.EditProfilePanel,
                                icon: 'Edit',
                            },
                            Reports: {
                                component: Components.ReportsPanel,
                                icon: 'BarChart2',
                            },
                            Settings: {
                                component: Components.SettingsPanel,
                                icon: 'Settings',
                            },
                        },
                        assets: {
                            styles: ['/admin-custom.css'],
                            scripts: ['/admin-scripts.js'],
                        },
                        resources: [
                            // Hosts Resource
                            {
                                resource: { model: getModel('Host'), client: prisma_1 },
                                options: {
                                    id: 'Hosts',
                                    navigation: { name: 'Operations', icon: 'Briefcase' },
                                    // Removed 'status' from list - table now shows only essential columns
                                    listProperties: ['name', 'company', 'email', 'phone', 'location'],
                                    filterProperties: ['company', 'location'],
                                    editProperties: ['name', 'company', 'email', 'phone', 'location', 'password'],
                                    properties: {
                                        id: { isVisible: { list: false, edit: false, show: true, filter: false } },
                                        externalId: { isVisible: { list: false, edit: false, show: false, filter: false } },
                                        // Hide status completely - not needed in UI
                                        status: { isVisible: { list: false, edit: false, show: false, filter: false } },
                                        deletedAt: { isVisible: { list: false, edit: false, show: false, filter: false } },
                                        createdAt: { isVisible: { list: false, edit: false, show: true, filter: false } },
                                        updatedAt: { isVisible: { list: false, edit: false, show: true, filter: false } },
                                        // Virtual password field for updating linked User's password
                                        password: {
                                            type: 'password',
                                            isVisible: { list: false, edit: true, show: false, filter: false },
                                            description: 'Set or change password for this host\'s login account',
                                        },
                                    },
                                    sort: { sortBy: 'company', direction: 'asc' },
                                    actions: {
                                        bulkImport: {
                                            actionType: 'resource',
                                            label: 'Bulk Import',
                                            icon: 'Upload',
                                            component: Components.BulkImportHosts,
                                            isAccessible: function (_a) {
                                                var currentAdmin = _a.currentAdmin;
                                                return (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'ADMIN';
                                            },
                                        },
                                        new: {
                                            // Only ADMIN can create hosts
                                            isAccessible: function (_a) {
                                                var currentAdmin = _a.currentAdmin;
                                                return (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'ADMIN';
                                            },
                                            after: function (response, request, context) { return __awaiter(_this, void 0, void 0, function () {
                                                var record, password, hostId, hostEmail, hostName, userEmail, existingUser, finalPassword, hashedPassword;
                                                var _a;
                                                return __generator(this, function (_b) {
                                                    switch (_b.label) {
                                                        case 0:
                                                            record = response.record;
                                                            password = (_a = request.payload) === null || _a === void 0 ? void 0 : _a.password;
                                                            hostId = BigInt(record.params.id);
                                                            hostEmail = record.params.email;
                                                            hostName = record.params.name;
                                                            userEmail = hostEmail || "host_".concat(hostId, "@system.local");
                                                            return [4 /*yield*/, prisma_1.user.findUnique({
                                                                    where: { email: userEmail.toLowerCase() },
                                                                })];
                                                        case 1:
                                                            existingUser = _b.sent();
                                                            if (!!existingUser) return [3 /*break*/, 4];
                                                            finalPassword = (password && password.trim())
                                                                ? password
                                                                : require('crypto').randomBytes(16).toString('hex');
                                                            return [4 /*yield*/, bcrypt.hash(finalPassword, 12)];
                                                        case 2:
                                                            hashedPassword = _b.sent();
                                                            return [4 /*yield*/, prisma_1.user.create({
                                                                    data: {
                                                                        email: userEmail.toLowerCase(),
                                                                        password: hashedPassword,
                                                                        name: hostName,
                                                                        role: 'HOST',
                                                                        hostId: hostId,
                                                                    },
                                                                })];
                                                        case 3:
                                                            _b.sent();
                                                            _b.label = 4;
                                                        case 4: return [2 /*return*/, response];
                                                    }
                                                });
                                            }); },
                                        },
                                        edit: {
                                            // Only ADMIN can edit hosts
                                            isAccessible: function (_a) {
                                                var currentAdmin = _a.currentAdmin;
                                                return (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'ADMIN';
                                            },
                                            after: function (response, request, context) { return __awaiter(_this, void 0, void 0, function () {
                                                var record, password, hostId, hostEmail, hostName, user, hashedPassword, userEmail;
                                                var _a;
                                                return __generator(this, function (_b) {
                                                    switch (_b.label) {
                                                        case 0:
                                                            record = response.record;
                                                            password = (_a = request.payload) === null || _a === void 0 ? void 0 : _a.password;
                                                            if (!(password && password.trim())) return [3 /*break*/, 6];
                                                            hostId = BigInt(record.params.id);
                                                            hostEmail = record.params.email;
                                                            hostName = record.params.name;
                                                            return [4 /*yield*/, prisma_1.user.findFirst({
                                                                    where: { hostId: hostId },
                                                                })];
                                                        case 1:
                                                            user = _b.sent();
                                                            return [4 /*yield*/, bcrypt.hash(password, 12)];
                                                        case 2:
                                                            hashedPassword = _b.sent();
                                                            if (!user) return [3 /*break*/, 4];
                                                            // Update existing user's password
                                                            return [4 /*yield*/, prisma_1.user.update({
                                                                    where: { id: user.id },
                                                                    data: { password: hashedPassword },
                                                                })];
                                                        case 3:
                                                            // Update existing user's password
                                                            _b.sent();
                                                            return [3 /*break*/, 6];
                                                        case 4:
                                                            userEmail = hostEmail || "host_".concat(hostId, "@system.local");
                                                            return [4 /*yield*/, prisma_1.user.create({
                                                                    data: {
                                                                        email: userEmail.toLowerCase(),
                                                                        password: hashedPassword,
                                                                        name: hostName,
                                                                        role: 'HOST',
                                                                        hostId: hostId,
                                                                    },
                                                                })];
                                                        case 5:
                                                            _b.sent();
                                                            _b.label = 6;
                                                        case 6: return [2 /*return*/, response];
                                                    }
                                                });
                                            }); },
                                        },
                                        delete: {
                                            // Only ADMIN can delete hosts - RECEPTION cannot delete
                                            isAccessible: function (_a) {
                                                var currentAdmin = _a.currentAdmin;
                                                return (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'ADMIN';
                                            },
                                        },
                                        bulkDelete: {
                                            // Only ADMIN can bulk delete hosts - RECEPTION cannot delete
                                            isAccessible: function (_a) {
                                                var currentAdmin = _a.currentAdmin;
                                                return (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'ADMIN';
                                            },
                                        },
                                        show: {
                                            // Everyone can view host details
                                            isAccessible: true,
                                        },
                                        list: {
                                            before: function (request, context) { return __awaiter(_this, void 0, void 0, function () {
                                                var currentAdmin, host;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            currentAdmin = context.currentAdmin;
                                                            if (!((currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'HOST' && (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.hostId))) return [3 /*break*/, 2];
                                                            return [4 /*yield*/, prisma_1.host.findUnique({
                                                                    where: { id: BigInt(currentAdmin.hostId) },
                                                                })];
                                                        case 1:
                                                            host = _a.sent();
                                                            if (host) {
                                                                request.query = __assign(__assign({}, request.query), { 'filters.company': host.company });
                                                            }
                                                            _a.label = 2;
                                                        case 2: return [2 /*return*/, request];
                                                    }
                                                });
                                            }); },
                                        },
                                    },
                                },
                            },
                            // Deliveries Resource
                            {
                                resource: { model: getModel('Delivery'), client: prisma_1 },
                                options: {
                                    id: 'Deliveries',
                                    navigation: { name: 'Operations', icon: 'Package' },
                                    listProperties: ['courier', 'recipient', 'hostId', 'location', 'status', 'receivedAt', 'pickedUpAt'],
                                    filterProperties: ['status', 'location', 'receivedAt'],
                                    editProperties: ['hostId', 'courier', 'recipient', 'notes', 'location'],
                                    properties: {
                                        id: { isVisible: { list: false, edit: false, show: true, filter: false } },
                                        hostId: {
                                            type: 'reference',
                                            reference: 'Hosts',
                                            isVisible: { list: true, edit: true, filter: true, show: true },
                                        },
                                        status: { isVisible: { list: true, edit: false, show: true, filter: true } },
                                        createdAt: { isVisible: { list: false, edit: false, show: true, filter: false } },
                                        receivedAt: { isVisible: { list: true, edit: false, show: true, filter: false } },
                                        pickedUpAt: { isVisible: { list: true, edit: false, show: true, filter: false } },
                                        receivedById: { isVisible: { list: false, edit: false, show: false, filter: false } },
                                    },
                                    actions: {
                                        new: {
                                            isAccessible: function (_a) {
                                                var currentAdmin = _a.currentAdmin;
                                                var role = currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role;
                                                return role === 'ADMIN' || role === 'RECEPTION';
                                            },
                                            before: function (request) { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    // Set default status and receivedAt on create
                                                    if (request.payload) {
                                                        request.payload.status = 'RECEIVED';
                                                        request.payload.receivedAt = new Date().toISOString();
                                                    }
                                                    return [2 /*return*/, request];
                                                });
                                            }); },
                                        },
                                        edit: {
                                            isAccessible: function (_a) {
                                                var currentAdmin = _a.currentAdmin;
                                                return (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'ADMIN';
                                            },
                                        },
                                        delete: {
                                            isAccessible: function (_a) {
                                                var currentAdmin = _a.currentAdmin;
                                                return (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'ADMIN';
                                            },
                                        },
                                        markPickedUp: {
                                            actionType: 'record',
                                            label: 'Mark Picked Up',
                                            icon: 'CheckCircle',
                                            guard: 'Are you sure you want to mark this delivery as picked up?',
                                            isVisible: true,
                                            isAccessible: function (_a) {
                                                var _b, _c, _d, _e;
                                                var currentAdmin = _a.currentAdmin, record = _a.record;
                                                var role = currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role;
                                                var status = (_b = record === null || record === void 0 ? void 0 : record.params) === null || _b === void 0 ? void 0 : _b.status;
                                                if (status !== 'RECEIVED')
                                                    return false;
                                                if (role === 'RECEPTION')
                                                    return false;
                                                if (role === 'ADMIN')
                                                    return true;
                                                if (role === 'HOST') {
                                                    return ((_d = (_c = record === null || record === void 0 ? void 0 : record.params) === null || _c === void 0 ? void 0 : _c.hostId) === null || _d === void 0 ? void 0 : _d.toString()) === ((_e = currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.hostId) === null || _e === void 0 ? void 0 : _e.toString());
                                                }
                                                return false;
                                            },
                                            handler: function (request, response, context) { return __awaiter(_this, void 0, void 0, function () {
                                                var record;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            record = context.record;
                                                            if (record.params.status !== 'RECEIVED') {
                                                                return [2 /*return*/, {
                                                                        record: record.toJSON(),
                                                                        notice: { type: 'error', message: 'Invalid state transition' },
                                                                    }];
                                                            }
                                                            return [4 /*yield*/, record.update({
                                                                    status: 'PICKED_UP',
                                                                    pickedUpAt: new Date(),
                                                                })];
                                                        case 1:
                                                            _a.sent();
                                                            return [2 /*return*/, {
                                                                    record: record.toJSON(),
                                                                    notice: { type: 'success', message: 'Marked as picked up' },
                                                                }];
                                                    }
                                                });
                                            }); },
                                        },
                                        list: {
                                            before: function (request, context) { return __awaiter(_this, void 0, void 0, function () {
                                                var currentAdmin;
                                                return __generator(this, function (_a) {
                                                    try {
                                                        currentAdmin = context.currentAdmin;
                                                        if ((currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'HOST' && (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.hostId)) {
                                                            request.query = __assign(__assign({}, request.query), { 'filters.hostId': currentAdmin.hostId });
                                                        }
                                                    }
                                                    catch (err) {
                                                        console.error('Deliveries list before hook error:', err);
                                                    }
                                                    return [2 /*return*/, request];
                                                });
                                            }); },
                                        },
                                    },
                                },
                            },
                            // Visitors Resource (Visit with CHECKED_IN, CHECKED_OUT)
                            {
                                resource: { model: getModel('Visit'), client: prisma_1 },
                                options: {
                                    id: 'Visitors',
                                    navigation: { name: 'Operations', icon: 'UserCheck' },
                                    listProperties: ['visitorName', 'visitorPhone', 'hostId', 'purpose', 'status', 'checkInAt'],
                                    filterProperties: ['status', 'location', 'checkInAt'],
                                    editProperties: ['visitorName', 'visitorCompany', 'visitorPhone', 'visitorEmail', 'hostId', 'purpose', 'location'],
                                    properties: {
                                        id: { isVisible: { list: false, edit: false, show: true, filter: false } },
                                        sessionId: { isVisible: { list: false, edit: false, show: true, filter: false } },
                                        hostId: {
                                            type: 'reference',
                                            reference: 'Hosts',
                                            isVisible: { list: true, edit: true, filter: true, show: true },
                                        },
                                        status: { isVisible: { list: true, edit: false, show: true, filter: true } },
                                        checkInAt: { isVisible: { list: true, edit: false, show: true, filter: false } },
                                        checkOutAt: { isVisible: { list: false, edit: false, show: true, filter: false } },
                                        createdAt: { isVisible: { list: false, edit: false, show: true, filter: false } },
                                        updatedAt: { isVisible: { list: false, edit: false, show: true, filter: false } },
                                        preRegisteredById: { isVisible: { list: false, edit: false, show: false, filter: false } },
                                    },
                                    actions: {
                                        new: {
                                            isAccessible: function (_a) {
                                                var currentAdmin = _a.currentAdmin;
                                                var role = currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role;
                                                return role === 'ADMIN' || role === 'RECEPTION';
                                            },
                                        },
                                        edit: {
                                            isAccessible: function (_a) {
                                                var currentAdmin = _a.currentAdmin;
                                                return (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'ADMIN';
                                            },
                                        },
                                        checkout: {
                                            actionType: 'record',
                                            label: 'Check Out',
                                            icon: 'LogOut',
                                            guard: 'Check out this visitor?',
                                            isVisible: true,
                                            isAccessible: function (_a) {
                                                var _b;
                                                var record = _a.record;
                                                return ((_b = record === null || record === void 0 ? void 0 : record.params) === null || _b === void 0 ? void 0 : _b.status) === 'CHECKED_IN';
                                            },
                                            handler: function (request, response, context) { return __awaiter(_this, void 0, void 0, function () {
                                                var record;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            record = context.record;
                                                            return [4 /*yield*/, record.update({
                                                                    status: 'CHECKED_OUT',
                                                                    checkOutAt: new Date(),
                                                                })];
                                                        case 1:
                                                            _a.sent();
                                                            return [2 /*return*/, {
                                                                    record: record.toJSON(),
                                                                    notice: { type: 'success', message: 'Visitor checked out' },
                                                                }];
                                                    }
                                                });
                                            }); },
                                        },
                                        sendQr: {
                                            actionType: 'record',
                                            label: 'Send QR',
                                            icon: 'Send',
                                            component: Components.SendQrModal,
                                            isVisible: true,
                                            isAccessible: function (_a) {
                                                var _b;
                                                var record = _a.record;
                                                return !!((_b = record === null || record === void 0 ? void 0 : record.params) === null || _b === void 0 ? void 0 : _b.id);
                                            },
                                            handler: function (request, response, context) { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    return [2 /*return*/, { record: context.record.toJSON() }];
                                                });
                                            }); },
                                        },
                                        list: {
                                            before: function (request, context) { return __awaiter(_this, void 0, void 0, function () {
                                                var currentAdmin;
                                                var _a;
                                                return __generator(this, function (_b) {
                                                    currentAdmin = context.currentAdmin;
                                                    if (!((_a = request.query) === null || _a === void 0 ? void 0 : _a['filters.status'])) {
                                                        request.query = __assign(__assign({}, request.query), { 'filters.status': 'CHECKED_IN' });
                                                    }
                                                    if ((currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'HOST' && (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.hostId)) {
                                                        request.query['filters.hostId'] = currentAdmin.hostId;
                                                    }
                                                    return [2 /*return*/, request];
                                                });
                                            }); },
                                        },
                                    },
                                },
                            },
                            // Pre Register Resource (Visit with pre-registration statuses)
                            {
                                resource: { model: getModel('Visit'), client: prisma_1 },
                                options: {
                                    id: 'PreRegister',
                                    navigation: { name: 'Operations', icon: 'Calendar' },
                                    listProperties: ['visitorName', 'visitorPhone', 'hostId', 'expectedDate', 'status', 'createdAt'],
                                    filterProperties: ['status', 'location', 'expectedDate'],
                                    editProperties: ['visitorName', 'visitorCompany', 'visitorPhone', 'visitorEmail', 'hostId', 'purpose', 'expectedDate', 'location'],
                                    properties: {
                                        id: { isVisible: { list: false, edit: false, show: true, filter: false } },
                                        sessionId: { isVisible: { list: false, edit: false, show: true, filter: false } },
                                        hostId: {
                                            type: 'reference',
                                            reference: 'Hosts',
                                            isVisible: { list: true, edit: true, filter: true, show: true },
                                        },
                                        status: { isVisible: { list: true, edit: false, show: true, filter: true } },
                                        approvedAt: { isVisible: { list: false, edit: false, show: true, filter: false } },
                                        rejectedAt: { isVisible: { list: false, edit: false, show: true, filter: false } },
                                        rejectionReason: { isVisible: { list: false, edit: false, show: true, filter: false } },
                                        checkInAt: { isVisible: { list: false, edit: false, show: true, filter: false } },
                                        checkOutAt: { isVisible: { list: false, edit: false, show: true, filter: false } },
                                        createdAt: { isVisible: { list: true, edit: false, show: true, filter: false } },
                                        updatedAt: { isVisible: { list: false, edit: false, show: true, filter: false } },
                                    },
                                    actions: {
                                        new: {
                                            isAccessible: function (_a) {
                                                var currentAdmin = _a.currentAdmin;
                                                var role = currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role;
                                                return role === 'ADMIN' || role === 'HOST' || role === 'RECEPTION';
                                            },
                                        },
                                        edit: {
                                            isAccessible: function () { return false; },
                                        },
                                        approve: {
                                            actionType: 'record',
                                            label: 'Approve',
                                            icon: 'Check',
                                            variant: 'success',
                                            guard: 'Approve this pre-registration?',
                                            isVisible: true,
                                            isAccessible: function (_a) {
                                                var _b, _c, _d, _e;
                                                var currentAdmin = _a.currentAdmin, record = _a.record;
                                                var status = (_b = record === null || record === void 0 ? void 0 : record.params) === null || _b === void 0 ? void 0 : _b.status;
                                                if (status !== 'PENDING_APPROVAL')
                                                    return false;
                                                var role = currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role;
                                                if (role === 'RECEPTION')
                                                    return false;
                                                if (role === 'ADMIN')
                                                    return true;
                                                if (role === 'HOST') {
                                                    return ((_d = (_c = record === null || record === void 0 ? void 0 : record.params) === null || _c === void 0 ? void 0 : _c.hostId) === null || _d === void 0 ? void 0 : _d.toString()) === ((_e = currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.hostId) === null || _e === void 0 ? void 0 : _e.toString());
                                                }
                                                return false;
                                            },
                                            handler: function (request, response, context) { return __awaiter(_this, void 0, void 0, function () {
                                                var record;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            record = context.record;
                                                            return [4 /*yield*/, record.update({
                                                                    status: 'APPROVED',
                                                                    approvedAt: new Date(),
                                                                })];
                                                        case 1:
                                                            _a.sent();
                                                            return [2 /*return*/, {
                                                                    record: record.toJSON(),
                                                                    notice: { type: 'success', message: 'Pre-registration approved' },
                                                                }];
                                                    }
                                                });
                                            }); },
                                        },
                                        reject: {
                                            actionType: 'record',
                                            label: 'Reject',
                                            icon: 'X',
                                            variant: 'danger',
                                            guard: 'Reject this pre-registration?',
                                            isVisible: true,
                                            isAccessible: function (_a) {
                                                var _b, _c, _d, _e;
                                                var currentAdmin = _a.currentAdmin, record = _a.record;
                                                var status = (_b = record === null || record === void 0 ? void 0 : record.params) === null || _b === void 0 ? void 0 : _b.status;
                                                if (status !== 'PENDING_APPROVAL')
                                                    return false;
                                                var role = currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role;
                                                if (role === 'RECEPTION')
                                                    return false;
                                                if (role === 'ADMIN')
                                                    return true;
                                                if (role === 'HOST') {
                                                    return ((_d = (_c = record === null || record === void 0 ? void 0 : record.params) === null || _c === void 0 ? void 0 : _c.hostId) === null || _d === void 0 ? void 0 : _d.toString()) === ((_e = currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.hostId) === null || _e === void 0 ? void 0 : _e.toString());
                                                }
                                                return false;
                                            },
                                            handler: function (request, response, context) { return __awaiter(_this, void 0, void 0, function () {
                                                var record;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            record = context.record;
                                                            return [4 /*yield*/, record.update({
                                                                    status: 'REJECTED',
                                                                    rejectedAt: new Date(),
                                                                })];
                                                        case 1:
                                                            _a.sent();
                                                            return [2 /*return*/, {
                                                                    record: record.toJSON(),
                                                                    notice: { type: 'success', message: 'Pre-registration rejected' },
                                                                }];
                                                    }
                                                });
                                            }); },
                                        },
                                        list: {
                                            before: function (request, context) { return __awaiter(_this, void 0, void 0, function () {
                                                var currentAdmin;
                                                var _a;
                                                return __generator(this, function (_b) {
                                                    currentAdmin = context.currentAdmin;
                                                    if (!((_a = request.query) === null || _a === void 0 ? void 0 : _a['filters.status'])) {
                                                        request.query = __assign(__assign({}, request.query), { 'filters.status': 'PENDING_APPROVAL' });
                                                    }
                                                    if ((currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'HOST' && (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.hostId)) {
                                                        request.query['filters.hostId'] = currentAdmin.hostId;
                                                    }
                                                    return [2 /*return*/, request];
                                                });
                                            }); },
                                        },
                                    },
                                },
                            },
                            // Users Resource (Admin only - hidden from HOST and RECEPTION)
                            {
                                resource: { model: getModel('User'), client: prisma_1 },
                                options: {
                                    id: 'Users',
                                    navigation: { name: 'System', icon: 'Users' },
                                    listProperties: ['name', 'email', 'role', 'createdAt'],
                                    filterProperties: ['role'],
                                    properties: {
                                        password: {
                                            type: 'password',
                                            isVisible: { list: false, show: false, edit: true, filter: false },
                                        },
                                        role: {
                                            availableValues: [
                                                { value: 'ADMIN', label: 'Admin' },
                                                { value: 'RECEPTION', label: 'Reception' },
                                                { value: 'HOST', label: 'Host' },
                                            ],
                                            isVisible: { list: true, show: true, edit: true, filter: true },
                                        },
                                        hostId: {
                                            isVisible: { list: false, show: false, edit: false, filter: false },
                                        },
                                        host: {
                                            isVisible: { list: false, show: false, edit: false, filter: false },
                                        },
                                        createdAt: {
                                            isVisible: { list: true, show: false, edit: false, filter: false },
                                        },
                                        updatedAt: {
                                            isVisible: { list: false, show: false, edit: false, filter: false },
                                        },
                                    },
                                    actions: {
                                        list: {
                                            isAccessible: function (_a) {
                                                var currentAdmin = _a.currentAdmin;
                                                return (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'ADMIN';
                                            },
                                            isVisible: function (_a) {
                                                var currentAdmin = _a.currentAdmin;
                                                return (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'ADMIN';
                                            },
                                        },
                                        new: {
                                            isAccessible: function (_a) {
                                                var currentAdmin = _a.currentAdmin;
                                                return (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'ADMIN';
                                            },
                                            before: function (request) { return __awaiter(_this, void 0, void 0, function () {
                                                var _a;
                                                var _b;
                                                return __generator(this, function (_c) {
                                                    switch (_c.label) {
                                                        case 0:
                                                            if (!((_b = request.payload) === null || _b === void 0 ? void 0 : _b.password)) return [3 /*break*/, 2];
                                                            _a = request.payload;
                                                            return [4 /*yield*/, bcrypt.hash(request.payload.password, 12)];
                                                        case 1:
                                                            _a.password = _c.sent();
                                                            _c.label = 2;
                                                        case 2: return [2 /*return*/, request];
                                                    }
                                                });
                                            }); },
                                        },
                                        edit: {
                                            isAccessible: function (_a) {
                                                var currentAdmin = _a.currentAdmin;
                                                return (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'ADMIN';
                                            },
                                            before: function (request) { return __awaiter(_this, void 0, void 0, function () {
                                                var _a;
                                                var _b, _c;
                                                return __generator(this, function (_d) {
                                                    switch (_d.label) {
                                                        case 0:
                                                            if (!((_b = request.payload) === null || _b === void 0 ? void 0 : _b.password)) return [3 /*break*/, 2];
                                                            _a = request.payload;
                                                            return [4 /*yield*/, bcrypt.hash(request.payload.password, 12)];
                                                        case 1:
                                                            _a.password = _d.sent();
                                                            return [3 /*break*/, 3];
                                                        case 2:
                                                            (_c = request.payload) === null || _c === void 0 ? true : delete _c.password;
                                                            _d.label = 3;
                                                        case 3: return [2 /*return*/, request];
                                                    }
                                                });
                                            }); },
                                        },
                                        delete: {
                                            isAccessible: function (_a) {
                                                var currentAdmin = _a.currentAdmin;
                                                return (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'ADMIN';
                                            },
                                        },
                                        show: {
                                            isAccessible: function (_a) {
                                                var currentAdmin = _a.currentAdmin;
                                                return (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'ADMIN';
                                            },
                                        },
                                    },
                                },
                            },
                            // Audit Log Resource (Admin only - hidden from HOST and RECEPTION)
                            {
                                resource: { model: getModel('AuditLog'), client: prisma_1 },
                                options: {
                                    id: 'AuditLog',
                                    navigation: { name: 'System', icon: 'FileText' },
                                    actions: {
                                        list: {
                                            isAccessible: function (_a) {
                                                var currentAdmin = _a.currentAdmin;
                                                return (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'ADMIN';
                                            },
                                            isVisible: function (_a) {
                                                var currentAdmin = _a.currentAdmin;
                                                return (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'ADMIN';
                                            },
                                        },
                                        show: {
                                            isAccessible: function (_a) {
                                                var currentAdmin = _a.currentAdmin;
                                                return (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'ADMIN';
                                            },
                                        },
                                        new: { isAccessible: false },
                                        edit: { isAccessible: false },
                                        delete: { isAccessible: false },
                                    },
                                },
                            },
                        ],
                        locale: {
                            language: 'en',
                            translations: {
                                en: {
                                    labels: {
                                        Hosts: 'Hosts',
                                        Deliveries: 'Deliveries',
                                        Visitors: 'Visitors',
                                        PreRegister: 'Pre Register',
                                        Users: 'Users',
                                        AuditLog: 'Audit Log',
                                        location: {
                                            BARWA_TOWERS: 'Barwa Towers',
                                            MARINA_50: 'Marina 50',
                                            ELEMENT_MARIOTT: 'Element Marriott',
                                        },
                                        role: {
                                            ADMIN: 'Admin',
                                            RECEPTION: 'Reception',
                                            HOST: 'Host',
                                            Admin: 'Admin',
                                            Reception: 'Reception',
                                            Host: 'Host',
                                            admin: 'Admin',
                                            reception: 'Reception',
                                            host: 'Host',
                                        },
                                        Role: {
                                            ADMIN: 'Admin',
                                            RECEPTION: 'Reception',
                                            HOST: 'Host',
                                            Admin: 'Admin',
                                            Reception: 'Reception',
                                            Host: 'Host',
                                        },
                                    },
                                    properties: {
                                        hostId: 'Host',
                                        visitorName: 'Visitor Name',
                                        visitorCompany: 'Company',
                                        visitorPhone: 'Phone',
                                        visitorEmail: 'Email',
                                        purpose: 'Purpose',
                                        expectedDate: 'Expected Visit Date',
                                        courier: 'Courier',
                                        recipient: 'Recipient',
                                        notes: 'Notes',
                                        location: 'Location',
                                        name: 'Name',
                                        company: 'Company',
                                        email: 'Email',
                                        phone: 'Phone',
                                        status: 'Status',
                                        checkInAt: 'Check In Time',
                                        checkOutAt: 'Check Out Time',
                                        receivedAt: 'Received At',
                                        pickedUpAt: 'Picked Up At',
                                        createdAt: 'Created At',
                                        updatedAt: 'Updated At',
                                        role: 'Role',
                                        Role: 'Role',
                                    },
                                    actions: {
                                        markPickedUp: 'Mark Picked Up',
                                        checkout: 'Check Out',
                                        sendQr: 'Send QR',
                                        approve: 'Approve',
                                        reject: 'Reject',
                                        bulkImport: 'Bulk Import',
                                    },
                                    components: {
                                        Login: {
                                            welcomeMessage: 'Welcome to Admin Panel',
                                        },
                                    },
                                    resources: {
                                        User: {
                                            properties: {
                                                role: 'Role',
                                            },
                                        },
                                        Hosts: {
                                            properties: {
                                                role: 'Role',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    });
                    rootPath_1 = admin.options.rootPath;
                    session = require('express-session');
                    MemoryStore = session.MemoryStore;
                    sharedSessionStore = new MemoryStore();
                    sharedSessionConfig = {
                        store: sharedSessionStore,
                        secret: cookieSecret,
                        name: 'adminjs',
                        resave: false,
                        saveUninitialized: false,
                        cookie: { httpOnly: true, sameSite: 'lax' },
                    };
                    adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
                        authenticate: function (email, password) { return __awaiter(_this, void 0, void 0, function () {
                            var user, match;
                            var _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0: return [4 /*yield*/, prisma_1.user.findUnique({
                                            where: { email: email.toLowerCase() },
                                            include: { host: true },
                                        })];
                                    case 1:
                                        user = _c.sent();
                                        if (!user)
                                            return [2 /*return*/, null];
                                        return [4 /*yield*/, bcrypt.compare(password, user.password)];
                                    case 2:
                                        match = _c.sent();
                                        if (!match)
                                            return [2 /*return*/, null];
                                        // Return user with role and hostId for RBAC
                                        return [2 /*return*/, {
                                                email: user.email,
                                                role: user.role,
                                                hostId: (_a = user.hostId) === null || _a === void 0 ? void 0 : _a.toString(),
                                                hostCompany: (_b = user.host) === null || _b === void 0 ? void 0 : _b.company,
                                                name: user.name,
                                            }];
                                }
                            });
                        }); },
                        cookieName: 'adminjs',
                        cookiePassword: cookieSecret,
                    }, null, sharedSessionConfig);
                    httpAdapter_1 = app.getHttpAdapter();
                    expressApp_1 = httpAdapter_1.getInstance();
                    autoLoginSessionMiddleware = session(sharedSessionConfig);
                    expressApp_1.get("".concat(rootPath_1, "/auto-login"), autoLoginSessionMiddleware, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var token, jwt, secret, payload, user, err_2;
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    token = req.query.token;
                                    if (!token) {
                                        return [2 /*return*/, res.redirect("".concat(rootPath_1, "/login"))];
                                    }
                                    _c.label = 1;
                                case 1:
                                    _c.trys.push([1, 3, , 4]);
                                    jwt = require('jsonwebtoken');
                                    secret = process.env.JWT_SECRET || 'fallback-secret-min-32-chars';
                                    payload = jwt.verify(token, secret);
                                    return [4 /*yield*/, prisma_1.user.findUnique({
                                            where: { id: payload.sub },
                                            include: { host: true },
                                        })];
                                case 2:
                                    user = _c.sent();
                                    if (!user) {
                                        return [2 /*return*/, res.redirect("".concat(rootPath_1, "/login"))];
                                    }
                                    // Only allow ADMIN and RECEPTION (GM is also ADMIN)
                                    if (user.role !== 'ADMIN' && user.role !== 'RECEPTION') {
                                        return [2 /*return*/, res.redirect("".concat(rootPath_1, "/login"))];
                                    }
                                    // Create AdminJS session (same shape as authenticate() result)
                                    req.session.adminUser = {
                                        email: user.email,
                                        role: user.role,
                                        hostId: (_a = user.hostId) === null || _a === void 0 ? void 0 : _a.toString(),
                                        hostCompany: (_b = user.host) === null || _b === void 0 ? void 0 : _b.company,
                                        name: user.name,
                                    };
                                    // Save session before redirect
                                    req.session.save(function (err) {
                                        if (err) {
                                            console.error('Session save failed:', err);
                                            return res.redirect("".concat(rootPath_1, "/login"));
                                        }
                                        return res.redirect(rootPath_1);
                                    });
                                    return [3 /*break*/, 4];
                                case 3:
                                    err_2 = _c.sent();
                                    console.error('Admin auto-login failed:', err_2);
                                    return [2 /*return*/, res.redirect("".concat(rootPath_1, "/login"))];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    showAdminQuickLogin = process.env.ADMINJS_QUICK_LOGIN === 'true' ||
                        (process.env.NODE_ENV !== 'production' && process.env.ADMINJS_QUICK_LOGIN !== 'false');
                    loginPageStyles = "\n<style>\n  /* Hide default AdminJS login styling and apply custom design */\n  body {\n    background: #f9fafb !important;\n    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;\n  }\n\n  /* Center the login box */\n  [data-css=\"login\"] {\n    min-height: 100vh !important;\n    display: flex !important;\n    align-items: center !important;\n    justify-content: center !important;\n    background: #f9fafb !important;\n  }\n\n  /* Style the login card */\n  [data-css=\"login\"] > section,\n  [data-css=\"login\"] > div > section,\n  [data-css=\"login\"] form {\n    background: white !important;\n    border-radius: 8px !important;\n    box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;\n    overflow: hidden !important;\n    max-width: 400px !important;\n    width: 100% !important;\n  }\n\n  /* Add indigo accent bar at top */\n  [data-css=\"login\"] > section::before,\n  [data-css=\"login\"] > div > section::before {\n    content: '' !important;\n    display: block !important;\n    height: 8px !important;\n    background: linear-gradient(90deg, #818cf8 0%, #6366f1 100%) !important;\n    border-radius: 8px 8px 0 0 !important;\n  }\n\n  /* Style the title */\n  [data-css=\"login\"] h1,\n  [data-css=\"login\"] [class*=\"H1\"],\n  [data-css=\"login\"] [class*=\"Title\"] {\n    font-size: 1.5rem !important;\n    font-weight: 600 !important;\n    color: #1f2937 !important;\n    text-align: center !important;\n    margin-bottom: 1rem !important;\n  }\n\n  /* Style labels */\n  [data-css=\"login\"] label {\n    display: block !important;\n    font-weight: 600 !important;\n    color: #374151 !important;\n    margin-bottom: 8px !important;\n    font-size: 14px !important;\n  }\n\n  /* Style inputs */\n  [data-css=\"login\"] input[type=\"text\"],\n  [data-css=\"login\"] input[type=\"email\"],\n  [data-css=\"login\"] input[type=\"password\"] {\n    width: 100% !important;\n    padding: 12px !important;\n    border: 1px solid #d1d5db !important;\n    border-radius: 4px !important;\n    font-size: 14px !important;\n    outline: none !important;\n    box-sizing: border-box !important;\n    transition: border-color 0.2s, box-shadow 0.2s !important;\n  }\n\n  [data-css=\"login\"] input:focus {\n    border-color: #6366f1 !important;\n    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;\n  }\n\n  /* Style submit button */\n  [data-css=\"login\"] button[type=\"submit\"],\n  [data-css=\"login\"] [class*=\"Button\"][class*=\"primary\"] {\n    background: #6366f1 !important;\n    color: white !important;\n    border: none !important;\n    padding: 10px 20px !important;\n    border-radius: 6px !important;\n    font-weight: 500 !important;\n    cursor: pointer !important;\n    transition: background-color 0.2s !important;\n  }\n\n  [data-css=\"login\"] button[type=\"submit\"]:hover,\n  [data-css=\"login\"] [class*=\"Button\"][class*=\"primary\"]:hover {\n    background: #4f46e5 !important;\n  }\n\n  /* Style form sections with padding */\n  [data-css=\"login\"] form > div,\n  [data-css=\"login\"] form section {\n    padding: 8px 32px !important;\n  }\n\n  /* Hide logo if present */\n  [data-css=\"login\"] img[alt*=\"logo\"],\n  [data-css=\"login\"] [class*=\"Logo\"] {\n    display: none !important;\n  }\n\n  /* Style any links */\n  [data-css=\"login\"] a {\n    color: #6b7280 !important;\n    font-size: 14px !important;\n    text-decoration: none !important;\n  }\n\n  [data-css=\"login\"] a:hover {\n    color: #ef4444 !important;\n    text-decoration: underline !important;\n  }\n</style>";
                    quickLoginFormsHtml_1 = "\n<div style=\"margin-top:1rem;padding:0.75rem;border:1px solid #ddd;border-radius:6px;background:#f5f5f5;\">\n  <p style=\"margin:0 0 0.5rem 0;font-size:0.85rem;color:#555;\">Debug quick login:</p>\n  <form method=\"POST\" action=\"".concat(rootPath_1, "/login\" enctype=\"multipart/form-data\" style=\"display:inline-block;margin-right:0.5rem;margin-bottom:0.25rem;\">\n    <input type=\"hidden\" name=\"email\" value=\"admin@arafatvisitor.cloud\"><input type=\"hidden\" name=\"password\" value=\"admin123\">\n    <button type=\"submit\" style=\"padding:0.35rem 0.75rem;cursor:pointer;border:1px solid #ccc;border-radius:4px;background:#fff;\">Admin</button>\n  </form>\n  <form method=\"POST\" action=\"").concat(rootPath_1, "/login\" enctype=\"multipart/form-data\" style=\"display:inline-block;margin-right:0.5rem;margin-bottom:0.25rem;\">\n    <input type=\"hidden\" name=\"email\" value=\"gm@arafatvisitor.cloud\"><input type=\"hidden\" name=\"password\" value=\"gm123\">\n    <button type=\"submit\" style=\"padding:0.35rem 0.75rem;cursor:pointer;border:1px solid #ccc;border-radius:4px;background:#fff;\">GM</button>\n  </form>\n  <form method=\"POST\" action=\"").concat(rootPath_1, "/login\" enctype=\"multipart/form-data\" style=\"display:inline-block;margin-right:0.5rem;margin-bottom:0.25rem;\">\n    <input type=\"hidden\" name=\"email\" value=\"host@arafatvisitor.cloud\"><input type=\"hidden\" name=\"password\" value=\"host123\">\n    <button type=\"submit\" style=\"padding:0.35rem 0.75rem;cursor:pointer;border:1px solid #ccc;border-radius:4px;background:#fff;\">Host</button>\n  </form>\n  <form method=\"POST\" action=\"").concat(rootPath_1, "/login\" enctype=\"multipart/form-data\" style=\"display:inline-block;margin-right:0.5rem;margin-bottom:0.25rem;\">\n    <input type=\"hidden\" name=\"email\" value=\"reception@arafatvisitor.cloud\"><input type=\"hidden\" name=\"password\" value=\"reception123\">\n    <button type=\"submit\" style=\"padding:0.35rem 0.75rem;cursor:pointer;border:1px solid #ccc;border-radius:4px;background:#fff;\">Reception</button>\n  </form>\n</div>");
                    logoutSessionMiddleware = session(sharedSessionConfig);
                    expressApp_1.get("".concat(rootPath_1, "/logout"), logoutSessionMiddleware, function (req, res) {
                        req.session.destroy(function (err) {
                            if (err) {
                                console.error('Logout session destroy error:', err);
                            }
                            res.clearCookie('connect.sid');
                            res.redirect("".concat(rootPath_1, "/login"));
                        });
                    });
                    // Serve custom login page BEFORE AdminJS handles it
                    expressApp_1.get("".concat(rootPath_1, "/login"), function (req, res) {
                        res.setHeader('Content-Type', 'text/html; charset=utf-8');
                        res.send("\n<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Login - Arafat VMS</title>\n  <link href=\"https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css\" rel=\"stylesheet\">\n  <link href=\"https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap\" rel=\"stylesheet\">\n  <style>\n    * { font-family: 'DM Sans', sans-serif; }\n    .login-card {\n      box-shadow: 0 10px 40px rgba(37, 99, 235, 0.08), 0 2px 10px rgba(0, 0, 0, 0.04);\n      border: 1px solid rgba(226, 232, 240, 0.8);\n    }\n    .accent-bar {\n      background: #2563eb;\n    }\n    .input-field {\n      transition: all 0.2s ease;\n      border: 1.5px solid #e2e8f0;\n    }\n    .input-field:focus {\n      border-color: #2563eb;\n      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);\n    }\n    .btn-primary {\n      background: #2563eb;\n      transition: all 0.2s ease;\n      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);\n    }\n    .btn-primary:hover {\n      background: #1d4ed8;\n      transform: translateY(-1px);\n      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);\n    }\n    .forgot-link {\n      position: relative;\n      color: #2563eb;\n      transition: all 0.2s ease;\n    }\n    .forgot-link::after {\n      content: '';\n      position: absolute;\n      bottom: -2px;\n      left: 50%;\n      width: 0;\n      height: 1.5px;\n      background: #2563eb;\n      transition: all 0.2s ease;\n      transform: translateX(-50%);\n    }\n    .forgot-link:hover::after {\n      width: 100%;\n    }\n    .forgot-link:hover {\n      color: #1d4ed8;\n    }\n    .quick-btn {\n      transition: all 0.15s ease;\n      border: 1.5px solid #e2e8f0;\n    }\n    .quick-btn:hover {\n      border-color: #93c5fd;\n      background: #eff6ff;\n      color: #2563eb;\n    }\n  </style>\n</head>\n<body class=\"bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden\">\n  <div class=\"h-screen flex flex-col text-gray-800 antialiased justify-center relative\">\n    <div class=\"relative py-4 w-full max-w-md mx-auto px-4\">\n      <div class=\"text-center mb-6\">\n        <div class=\"inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-lg mb-4\">\n          <svg class=\"w-7 h-7 text-white\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\n            <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z\"></path>\n          </svg>\n        </div>\n        <h1 class=\"text-2xl font-bold text-gray-900\" id=\"pageTitle\">Welcome Back</h1>\n        <p class=\"text-gray-500 mt-1 text-sm\" id=\"pageSubtitle\">Sign in to your account</p>\n      </div>\n\n      <div class=\"login-card bg-white rounded-2xl overflow-hidden\">\n        <div class=\"accent-bar h-1.5\"></div>\n\n        <!-- Login Form -->\n        <form id=\"loginForm\" method=\"POST\" action=\"".concat(rootPath_1, "/login\" enctype=\"multipart/form-data\" class=\"p-8\">\n          <div class=\"space-y-5\">\n            <div>\n              <label class=\"block text-sm font-semibold text-gray-700 mb-2\">Email Address</label>\n              <input type=\"email\" name=\"email\" placeholder=\"you@example.com\" required\n                class=\"input-field w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 outline-none\" />\n            </div>\n\n            <div>\n              <label class=\"block text-sm font-semibold text-gray-700 mb-2\">Password</label>\n              <input type=\"password\" name=\"password\" placeholder=\"Enter your password\" required\n                class=\"input-field w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 outline-none\" />\n            </div>\n          </div>\n\n          <div class=\"mt-7\">\n            <button type=\"submit\" class=\"btn-primary w-full py-3.5 text-white font-semibold rounded-xl\">\n              Sign In\n            </button>\n          </div>\n\n          <div class=\"mt-5 text-center\">\n            <a href=\"#\" onclick=\"showForgotPassword(); return false;\" class=\"forgot-link text-sm font-medium\">\n              Forgot your password?\n            </a>\n          </div>\n        </form>\n\n        <!-- Forgot Password Form (hidden by default) -->\n        <form id=\"forgotForm\" class=\"p-8 hidden\">\n          <div class=\"text-center mb-6\">\n            <div class=\"inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 mb-3\">\n              <svg class=\"w-6 h-6 text-indigo-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\n                <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z\"></path>\n              </svg>\n            </div>\n            <p class=\"text-gray-600 text-sm\">Enter your email and we'll send you a reset link.</p>\n          </div>\n\n          <div>\n            <label class=\"block text-sm font-semibold text-gray-700 mb-2\">Email Address</label>\n            <input type=\"email\" id=\"forgotEmail\" placeholder=\"you@example.com\" required\n              class=\"input-field w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 outline-none\" />\n          </div>\n\n          <div id=\"forgotMessage\" class=\"mt-4 text-sm text-center hidden p-3 rounded-lg\"></div>\n\n          <div class=\"mt-6\">\n            <button type=\"submit\" onclick=\"submitForgotPassword(event)\" class=\"btn-primary w-full py-3.5 text-white font-semibold rounded-xl\">\n              Send Reset Link\n            </button>\n          </div>\n\n          <div class=\"mt-5 text-center\">\n            <a href=\"#\" onclick=\"showLogin(); return false;\" class=\"forgot-link text-sm font-medium\">\n              Back to sign in\n            </a>\n          </div>\n        </form>\n\n        <!-- Quick Login Buttons -->\n        <div id=\"quickLogin\" class=\"px-8 pb-8 pt-4 border-t border-gray-100\">\n          <p class=\"text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 text-center\">Quick Access</p>\n          <div class=\"flex flex-wrap justify-center gap-2\">\n            <form method=\"POST\" action=\"").concat(rootPath_1, "/login\" enctype=\"multipart/form-data\" class=\"inline\">\n              <input type=\"hidden\" name=\"email\" value=\"admin@arafatvisitor.cloud\">\n              <input type=\"hidden\" name=\"password\" value=\"admin123\">\n              <button type=\"submit\" class=\"quick-btn px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg\">Admin</button>\n            </form>\n            <form method=\"POST\" action=\"").concat(rootPath_1, "/login\" enctype=\"multipart/form-data\" class=\"inline\">\n              <input type=\"hidden\" name=\"email\" value=\"gm@arafatvisitor.cloud\">\n              <input type=\"hidden\" name=\"password\" value=\"gm123\">\n              <button type=\"submit\" class=\"quick-btn px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg\">GM</button>\n            </form>\n            <form method=\"POST\" action=\"").concat(rootPath_1, "/login\" enctype=\"multipart/form-data\" class=\"inline\">\n              <input type=\"hidden\" name=\"email\" value=\"host@arafatvisitor.cloud\">\n              <input type=\"hidden\" name=\"password\" value=\"host123\">\n              <button type=\"submit\" class=\"quick-btn px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg\">Host</button>\n            </form>\n            <form method=\"POST\" action=\"").concat(rootPath_1, "/login\" enctype=\"multipart/form-data\" class=\"inline\">\n              <input type=\"hidden\" name=\"email\" value=\"reception@arafatvisitor.cloud\">\n              <input type=\"hidden\" name=\"password\" value=\"reception123\">\n              <button type=\"submit\" class=\"quick-btn px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg\">Reception</button>\n            </form>\n          </div>\n        </div>\n      </div>\n\n      <p class=\"text-center text-xs text-gray-400 mt-6\">Arafat Visitor Management System</p>\n    </div>\n  </div>\n  <script>\n    function showForgotPassword() {\n      document.getElementById('loginForm').classList.add('hidden');\n      document.getElementById('forgotForm').classList.remove('hidden');\n      document.getElementById('quickLogin').classList.add('hidden');\n      document.getElementById('pageTitle').textContent = 'Reset Password';\n      document.getElementById('pageSubtitle').textContent = 'We will help you recover your account';\n    }\n    function showLogin() {\n      document.getElementById('loginForm').classList.remove('hidden');\n      document.getElementById('forgotForm').classList.add('hidden');\n      document.getElementById('quickLogin').classList.remove('hidden');\n      document.getElementById('pageTitle').textContent = 'Welcome Back';\n      document.getElementById('pageSubtitle').textContent = 'Sign in to your account';\n      document.getElementById('forgotMessage').classList.add('hidden');\n    }\n    async function submitForgotPassword(e) {\n      e.preventDefault();\n      var email = document.getElementById('forgotEmail').value;\n      var msgEl = document.getElementById('forgotMessage');\n      msgEl.classList.remove('hidden');\n      msgEl.className = 'mt-4 text-sm text-center p-3 rounded-lg bg-gray-50 text-gray-600';\n      msgEl.textContent = 'Sending...';\n      try {\n        var res = await fetch('/auth/forgot-password', {\n          method: 'POST',\n          headers: { 'Content-Type': 'application/json' },\n          body: JSON.stringify({ email: email })\n        });\n        var data = await res.json();\n        msgEl.className = 'mt-4 text-sm text-center p-3 rounded-lg bg-green-50 text-green-700';\n        msgEl.textContent = data.message || 'If an account exists, a reset link has been sent.';\n      } catch (err) {\n        msgEl.className = 'mt-4 text-sm text-center p-3 rounded-lg bg-red-50 text-red-700';\n        msgEl.textContent = 'Failed to send reset link. Please try again.';\n      }\n    }\n  </script>\n</body>\n</html>"));
                    });
                    // Reset Password Page
                    expressApp_1.get("".concat(rootPath_1, "/reset-password"), function (req, res) {
                        var token = req.query.token || '';
                        res.setHeader('Content-Type', 'text/html; charset=utf-8');
                        res.send("\n<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Reset Password - Arafat VMS</title>\n  <link href=\"https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css\" rel=\"stylesheet\">\n</head>\n<body>\n  <div class=\"min-h-screen bg-gray-50 py-6 flex flex-col text-gray-800 antialiased justify-center relative overflow-hidden sm:py-12\">\n    <div class=\"relative py-3 w-96 sm:w-100 mx-auto text-center\">\n      <span class=\"text-2xl font-semibold\">Reset Your Password</span>\n\n      <div class=\"mt-4 bg-white shadow-md rounded-lg space-y-2 text-left\">\n        <div class=\"h-2 bg-indigo-400 rounded-t-md\"></div>\n        <form id=\"resetForm\" class=\"px-8 py-6\">\n          <input type=\"hidden\" id=\"resetToken\" value=\"".concat(token, "\" />\n\n          <label class=\"block font-semibold\">New Password</label>\n          <input type=\"password\" id=\"newPassword\" placeholder=\"New Password\" required minlength=\"6\"\n            class=\"border w-full h-5 px-3 py-5 mt-2 hover:outline-none focus:outline-none focus:ring-1 focus:ring-indigo-600 rounded\" />\n\n          <label class=\"block font-semibold mt-4\">Confirm Password</label>\n          <input type=\"password\" id=\"confirmPassword\" placeholder=\"Confirm Password\" required minlength=\"6\"\n            class=\"border w-full h-5 px-3 py-5 mt-2 hover:outline-none focus:outline-none focus:ring-1 focus:ring-indigo-600 rounded\" />\n\n          <div id=\"resetMessage\" class=\"mt-3 text-sm hidden\"></div>\n\n          <div class=\"flex items-center justify-between mt-4\">\n            <button type=\"submit\" onclick=\"submitReset(event)\" class=\"px-5 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600\">Reset Password</button>\n            <a href=\"").concat(rootPath_1, "/login\" class=\"text-sm text-indigo-600 hover:underline\">Back to login</a>\n          </div>\n        </form>\n      </div>\n    </div>\n  </div>\n  <script>\n    async function submitReset(e) {\n      e.preventDefault();\n      var token = document.getElementById('resetToken').value;\n      var newPassword = document.getElementById('newPassword').value;\n      var confirmPassword = document.getElementById('confirmPassword').value;\n      var msgEl = document.getElementById('resetMessage');\n\n      msgEl.classList.remove('hidden', 'text-green-600', 'text-red-600');\n\n      if (!token) {\n        msgEl.classList.add('text-red-600');\n        msgEl.textContent = 'Invalid or missing reset token.';\n        return;\n      }\n      if (newPassword !== confirmPassword) {\n        msgEl.classList.add('text-red-600');\n        msgEl.textContent = 'Passwords do not match.';\n        return;\n      }\n      if (newPassword.length < 6) {\n        msgEl.classList.add('text-red-600');\n        msgEl.textContent = 'Password must be at least 6 characters.';\n        return;\n      }\n\n      msgEl.textContent = 'Resetting...';\n      try {\n        var res = await fetch('/auth/reset-password', {\n          method: 'POST',\n          headers: { 'Content-Type': 'application/json' },\n          body: JSON.stringify({ token: token, newPassword: newPassword })\n        });\n        var data = await res.json();\n        if (res.ok) {\n          msgEl.classList.add('text-green-600');\n          msgEl.textContent = 'Password reset successfully! Redirecting to login...';\n          setTimeout(function() { window.location.href = '").concat(rootPath_1, "/login'; }, 2000);\n        } else {\n          msgEl.classList.add('text-red-600');\n          msgEl.textContent = data.message || 'Failed to reset password.';\n        }\n      } catch (err) {\n        msgEl.classList.add('text-red-600');\n        msgEl.textContent = 'Failed to reset password. Please try again.';\n      }\n    }\n  </script>\n</body>\n</html>"));
                    });
                    if (showAdminQuickLogin) {
                        port_1 = process.env.PORT || 3000;
                        console.log("Admin quick-login: http://localhost:".concat(port_1).concat(rootPath_1, "/quick-login"));
                        // Standalone quick-login page
                        expressApp_1.get("".concat(rootPath_1, "/quick-login"), function (_req, res) {
                            res.setHeader('Content-Type', 'text/html; charset=utf-8');
                            res.send("\n<!DOCTYPE html>\n<html><head><meta charset=\"utf-8\"><title>Quick Login - Arafat VMS</title></head>\n<body style=\"font-family:sans-serif;max-width:480px;margin:2rem auto;padding:1rem;\">\n  <h1 style=\"margin-bottom:0.5rem;\">Arafat VMS</h1>\n  <p style=\"color:#666;margin-bottom:1rem;\">Debug quick login</p>\n  ".concat(quickLoginFormsHtml_1, "\n  <p style=\"margin-top:1rem;font-size:0.9rem;\"><a href=\"").concat(rootPath_1, "/login\">Standard login</a></p>\n</body></html>"));
                        });
                    }
                    settingsSessionMiddleware = session(sharedSessionConfig);
                    requireAdminSession = function (req, res, next) {
                        var _a;
                        if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.adminUser) || req.session.adminUser.role !== 'ADMIN') {
                            return res.status(401).json({ message: 'Unauthorized' });
                        }
                        next();
                    };
                    jsonParser = require('express').json();
                    // GET /admin/api/settings
                    expressApp_1.get("".concat(rootPath_1, "/api/settings"), settingsSessionMiddleware, requireAdminSession, function (_req, res) {
                        res.json({
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
                        });
                    });
                    // POST /admin/api/settings/test-whatsapp
                    expressApp_1.post("".concat(rootPath_1, "/api/settings/test-whatsapp"), settingsSessionMiddleware, jsonParser, requireAdminSession, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var phone, WhatsAppService, whatsappService, sent, e_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    phone = req.body.phone;
                                    if (!phone) {
                                        return [2 /*return*/, res.status(400).json({ message: 'Phone number required' })];
                                    }
                                    if (!process.env.WHATSAPP_ENDPOINT || !process.env.WHATSAPP_API_KEY) {
                                        return [2 /*return*/, res.status(400).json({ message: 'WhatsApp not configured' })];
                                    }
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 4, , 5]);
                                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./notifications/whatsapp.service'); })];
                                case 2:
                                    WhatsAppService = (_a.sent()).WhatsAppService;
                                    whatsappService = app.get(WhatsAppService);
                                    return [4 /*yield*/, whatsappService.send(phone, 'This is a test message from Arafat VMS. If you received this, WhatsApp is configured correctly!')];
                                case 3:
                                    sent = _a.sent();
                                    if (!sent) {
                                        return [2 /*return*/, res.status(500).json({ message: 'Failed to send test message' })];
                                    }
                                    res.json({ success: true, message: 'Test message sent' });
                                    return [3 /*break*/, 5];
                                case 4:
                                    e_1 = _a.sent();
                                    console.error('WhatsApp test failed:', e_1);
                                    res.status(500).json({ message: 'Failed to send test message' });
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    // POST /admin/api/settings/test-email
                    expressApp_1.post("".concat(rootPath_1, "/api/settings/test-email"), settingsSessionMiddleware, jsonParser, requireAdminSession, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var email, EmailService, emailService, e_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    email = req.body.email;
                                    if (!email) {
                                        return [2 /*return*/, res.status(400).json({ message: 'Email address required' })];
                                    }
                                    if (!process.env.SMTP_HOST) {
                                        return [2 /*return*/, res.status(400).json({ message: 'SMTP not configured' })];
                                    }
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 4, , 5]);
                                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./notifications/email.service'); })];
                                case 2:
                                    EmailService = (_a.sent()).EmailService;
                                    emailService = app.get(EmailService);
                                    return [4 /*yield*/, emailService.send({
                                            to: email,
                                            subject: 'Test Email - Arafat VMS',
                                            html: '<h2>Test Email</h2><p>This is a test email from Arafat VMS. If you received this, SMTP is configured correctly!</p>',
                                        })];
                                case 3:
                                    _a.sent();
                                    res.json({ success: true, message: 'Test email sent' });
                                    return [3 /*break*/, 5];
                                case 4:
                                    e_2 = _a.sent();
                                    console.error('Email test failed:', e_2);
                                    res.status(500).json({ message: 'Failed to send test email' });
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    // POST /admin/api/settings/update
                    expressApp_1.post("".concat(rootPath_1, "/api/settings/update"), settingsSessionMiddleware, jsonParser, requireAdminSession, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var fs, pathModule, envPath, envContent_1, updateEnvVar, _a, smtp, whatsapp, maintenance;
                        return __generator(this, function (_b) {
                            fs = require('fs');
                            pathModule = require('path');
                            envPath = pathModule.join(process.cwd(), '.env');
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
                                    process.env[key] = strValue;
                                };
                                _a = req.body, smtp = _a.smtp, whatsapp = _a.whatsapp, maintenance = _a.maintenance;
                                if (smtp) {
                                    if (smtp.enabled !== undefined)
                                        updateEnvVar('SMTP_ENABLED', smtp.enabled);
                                    if (smtp.host)
                                        updateEnvVar('SMTP_HOST', smtp.host);
                                    if (smtp.port)
                                        updateEnvVar('SMTP_PORT', smtp.port);
                                    if (smtp.user)
                                        updateEnvVar('SMTP_USER', smtp.user);
                                    if (smtp.pass)
                                        updateEnvVar('SMTP_PASS', smtp.pass);
                                    if (smtp.from)
                                        updateEnvVar('SMTP_FROM', smtp.from);
                                }
                                if (whatsapp) {
                                    if (whatsapp.endpoint)
                                        updateEnvVar('WHATSAPP_ENDPOINT', whatsapp.endpoint);
                                    if (whatsapp.clientId)
                                        updateEnvVar('WHATSAPP_CLIENT_ID', whatsapp.clientId);
                                    if (whatsapp.client)
                                        updateEnvVar('WHATSAPP_CLIENT', whatsapp.client);
                                    if (whatsapp.apiKey)
                                        updateEnvVar('WHATSAPP_API_KEY', whatsapp.apiKey);
                                }
                                if (maintenance) {
                                    if (maintenance.enabled !== undefined)
                                        updateEnvVar('MAINTENANCE_MODE', maintenance.enabled);
                                    if (maintenance.message)
                                        updateEnvVar('MAINTENANCE_MESSAGE', maintenance.message);
                                }
                                fs.writeFileSync(envPath, envContent_1);
                                res.json({ success: true, message: 'Settings updated' });
                            }
                            catch (e) {
                                console.error('Settings update failed:', e);
                                res.status(500).json({ message: 'Failed to update settings' });
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    jsonParserLarge = require('express').json({ limit: '50mb' });
                    expressApp_1.post("".concat(rootPath_1, "/api/hosts/import"), settingsSessionMiddleware, jsonParserLarge, requireAdminSession, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var validateOnly, csvContent, parse, records, totalProcessed, inserted, skipped, usersCreated, usersSkipped, rejectedRows, createdCredentials, emailRegex, mapLocation, mapStatus, cleanPhone, index, row, rowNumber, reasons, externalIdRaw, nameRaw, companyRaw, emailRaw, phoneRaw, locationRaw, statusRaw, name_1, company, email, phone, phoneValue, location_1, status_1, externalId, hostId, hostIsNew, existingHost, userEmail, existingUserByHostId, existingUserByEmail, existingUserByEmail, createdHost, e_3, errorMsg, userEmail, existingUserByEmail, existingUserByHostId, crypto_1, randomPassword, hashedPassword, e_4, errorMsg, rejected, error_1;
                        var _a, _b, _c, _d, _e, _f, _g;
                        return __generator(this, function (_h) {
                            switch (_h.label) {
                                case 0:
                                    validateOnly = req.query.validate === 'true';
                                    console.log("Bulk import request received (validateOnly: ".concat(validateOnly, ")"));
                                    _h.label = 1;
                                case 1:
                                    _h.trys.push([1, 27, , 28]);
                                    csvContent = (req.body || {}).csvContent;
                                    if (!csvContent || typeof csvContent !== 'string' || !csvContent.trim()) {
                                        return [2 /*return*/, res.status(400).json({ message: 'csvContent is required' })];
                                    }
                                    console.log("CSV content received, length: ".concat(csvContent.length, " chars"));
                                    return [4 /*yield*/, Promise.resolve().then(function () { return require('csv-parse/sync'); })];
                                case 2:
                                    parse = (_h.sent()).parse;
                                    records = parse(csvContent, {
                                        columns: true,
                                        skip_empty_lines: true,
                                        trim: true,
                                        relax_column_count: true,
                                    });
                                    console.log("CSV parsed successfully, ".concat(records.length, " records found"));
                                    if (records.length > 0) {
                                        console.log('CSV columns detected:', Object.keys(records[0]));
                                        console.log('First row data:', JSON.stringify(records[0]));
                                    }
                                    totalProcessed = 0;
                                    inserted = 0;
                                    skipped = 0;
                                    usersCreated = 0;
                                    usersSkipped = 0;
                                    rejectedRows = [];
                                    createdCredentials = [];
                                    emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
                                    mapLocation = function (value) {
                                        if (!value)
                                            return null;
                                        var v = value.trim().toLowerCase();
                                        if (v.includes('barwa'))
                                            return 'BARWA_TOWERS';
                                        if (v.includes('element') || v.includes('mariott'))
                                            return 'ELEMENT_MARIOTT';
                                        if (v.includes('marina') && v.includes('50'))
                                            return 'MARINA_50';
                                        return null;
                                    };
                                    mapStatus = function (value) {
                                        if (!value)
                                            return undefined; // No default - require explicit status
                                        var v = value.trim().toLowerCase();
                                        if (v === 'active' || v === '1')
                                            return 1;
                                        if (v === 'inactive' || v === '0')
                                            return 0;
                                        return undefined; // Unknown value - reject for review
                                    };
                                    cleanPhone = function (value) {
                                        if (!value)
                                            return '';
                                        var v = value.replace(/[\s\-()]/g, '');
                                        if (v.startsWith('+')) {
                                            v = v.slice(1);
                                        }
                                        return v;
                                    };
                                    index = 0;
                                    _h.label = 3;
                                case 3:
                                    if (!(index < records.length)) return [3 /*break*/, 26];
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
                                        reasons.push('Missing phone');
                                    }
                                    else if (/[a-zA-Z]/.test(phone)) {
                                        reasons.push('Invalid phone (contains letters)');
                                    }
                                    phoneValue = phone || null;
                                    location_1 = mapLocation(locationRaw || null);
                                    status_1 = mapStatus(statusRaw || null);
                                    if (status_1 === undefined) {
                                        reasons.push('Invalid or missing status');
                                    }
                                    if (reasons.length > 0) {
                                        rejectedRows.push({
                                            rowNumber: rowNumber,
                                            reason: reasons.join('; '),
                                            data: {
                                                id: externalIdRaw,
                                                name: nameRaw,
                                                company: companyRaw,
                                                email: emailRaw,
                                                phone: phoneRaw,
                                                location: locationRaw,
                                                status: statusRaw,
                                            },
                                        });
                                        return [3 /*break*/, 25];
                                    }
                                    externalId = externalIdRaw || null;
                                    hostId = null;
                                    hostIsNew = false;
                                    if (!externalId) return [3 /*break*/, 5];
                                    return [4 /*yield*/, prisma_1.host.findUnique({
                                            where: { externalId: externalId },
                                        })];
                                case 4:
                                    existingHost = _h.sent();
                                    if (existingHost) {
                                        // Host exists - skip host creation but may need to create user
                                        skipped += 1;
                                        hostId = existingHost.id;
                                    }
                                    _h.label = 5;
                                case 5:
                                    if (!validateOnly) return [3 /*break*/, 12];
                                    if (!hostId) {
                                        inserted += 1; // New host would be created
                                    }
                                    userEmail = email || "host_".concat(hostId || 'new', "@system.local");
                                    if (!hostId) return [3 /*break*/, 9];
                                    return [4 /*yield*/, prisma_1.user.findFirst({
                                            where: { hostId: hostId },
                                        })];
                                case 6:
                                    existingUserByHostId = _h.sent();
                                    if (!!existingUserByHostId) return [3 /*break*/, 8];
                                    return [4 /*yield*/, prisma_1.user.findUnique({
                                            where: { email: userEmail },
                                        })];
                                case 7:
                                    existingUserByEmail = _h.sent();
                                    if (!existingUserByEmail) {
                                        usersCreated += 1; // User would be created for existing host
                                    }
                                    _h.label = 8;
                                case 8: return [3 /*break*/, 11];
                                case 9: return [4 /*yield*/, prisma_1.user.findUnique({
                                        where: { email: userEmail },
                                    })];
                                case 10:
                                    existingUserByEmail = _h.sent();
                                    if (!existingUserByEmail) {
                                        usersCreated += 1; // User would be created for new host
                                    }
                                    _h.label = 11;
                                case 11: return [3 /*break*/, 25];
                                case 12:
                                    if (!!hostId) return [3 /*break*/, 16];
                                    _h.label = 13;
                                case 13:
                                    _h.trys.push([13, 15, , 16]);
                                    return [4 /*yield*/, prisma_1.host.create({
                                            data: {
                                                externalId: externalId,
                                                name: name_1,
                                                company: company !== null && company !== void 0 ? company : '',
                                                email: email,
                                                phone: phoneValue,
                                                location: location_1,
                                                status: status_1 !== null && status_1 !== void 0 ? status_1 : 1,
                                            },
                                        })];
                                case 14:
                                    createdHost = _h.sent();
                                    hostId = createdHost.id;
                                    hostIsNew = true;
                                    inserted += 1;
                                    return [3 /*break*/, 16];
                                case 15:
                                    e_3 = _h.sent();
                                    errorMsg = e_3 instanceof Error ? e_3.message : 'Unknown database error';
                                    console.error("Row ".concat(rowNumber, " database error:"), e_3);
                                    rejectedRows.push({
                                        rowNumber: rowNumber,
                                        reason: "Database error: ".concat(errorMsg),
                                        data: {
                                            id: externalIdRaw,
                                            name: nameRaw,
                                            company: companyRaw,
                                            email: emailRaw,
                                            phone: phoneRaw,
                                            location: locationRaw,
                                            status: statusRaw,
                                        },
                                    });
                                    return [3 /*break*/, 25];
                                case 16:
                                    _h.trys.push([16, 24, , 25]);
                                    userEmail = email || "host_".concat(hostId, "@system.local");
                                    return [4 /*yield*/, prisma_1.user.findUnique({
                                            where: { email: userEmail },
                                        })];
                                case 17:
                                    existingUserByEmail = _h.sent();
                                    if (!existingUserByEmail) return [3 /*break*/, 18];
                                    usersSkipped += 1;
                                    return [3 /*break*/, 23];
                                case 18: return [4 /*yield*/, prisma_1.user.findFirst({
                                        where: { hostId: hostId },
                                    })];
                                case 19:
                                    existingUserByHostId = _h.sent();
                                    if (!existingUserByHostId) return [3 /*break*/, 20];
                                    usersSkipped += 1;
                                    return [3 /*break*/, 23];
                                case 20:
                                    crypto_1 = require('crypto');
                                    randomPassword = crypto_1.randomBytes(8).toString('hex');
                                    return [4 /*yield*/, bcrypt.hash(randomPassword, 12)];
                                case 21:
                                    hashedPassword = _h.sent();
                                    return [4 /*yield*/, prisma_1.user.create({
                                            data: {
                                                email: userEmail,
                                                password: hashedPassword,
                                                name: name_1,
                                                role: 'HOST',
                                                hostId: hostId,
                                            },
                                        })];
                                case 22:
                                    _h.sent();
                                    usersCreated += 1;
                                    // Store credentials for export
                                    createdCredentials.push({
                                        name: name_1,
                                        email: userEmail,
                                        password: randomPassword,
                                        company: company !== null && company !== void 0 ? company : '',
                                    });
                                    _h.label = 23;
                                case 23: return [3 /*break*/, 25];
                                case 24:
                                    e_4 = _h.sent();
                                    errorMsg = e_4 instanceof Error ? e_4.message : 'Unknown database error';
                                    console.error("Row ".concat(rowNumber, " user creation error:"), e_4);
                                    // Don't reject the row if host was created, just log user creation failure
                                    if (!hostIsNew) {
                                        rejectedRows.push({
                                            rowNumber: rowNumber,
                                            reason: "User creation error: ".concat(errorMsg),
                                            data: {
                                                id: externalIdRaw,
                                                name: nameRaw,
                                                company: companyRaw,
                                                email: emailRaw,
                                                phone: phoneRaw,
                                                location: locationRaw,
                                                status: statusRaw,
                                            },
                                        });
                                    }
                                    return [3 /*break*/, 25];
                                case 25:
                                    index++;
                                    return [3 /*break*/, 3];
                                case 26:
                                    rejected = rejectedRows.length;
                                    console.log("Bulk import completed: ".concat(totalProcessed, " processed, ").concat(inserted, " inserted, ").concat(skipped, " skipped, ").concat(rejected, " rejected"));
                                    res.json({
                                        totalProcessed: totalProcessed,
                                        inserted: inserted,
                                        skipped: skipped,
                                        rejected: rejected,
                                        rejectedRows: rejectedRows,
                                        createdCredentials: createdCredentials,
                                        usersCreated: usersCreated,
                                        usersSkipped: usersSkipped,
                                    });
                                    return [3 /*break*/, 28];
                                case 27:
                                    error_1 = _h.sent();
                                    console.error('Bulk import error:', error_1);
                                    res.status(500).json({
                                        message: "Import failed: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error'),
                                    });
                                    return [3 /*break*/, 28];
                                case 28: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.use(admin.options.rootPath, adminRouter);
                    console.log("Admin dashboard at http://localhost:".concat(process.env.PORT || 3000).concat(admin.options.rootPath));
                    return [3 /*break*/, 8];
                case 7:
                    err_1 = _a.sent();
                    console.error('AdminJS setup failed:', err_1);
                    console.log('API will run without Admin dashboard.');
                    return [3 /*break*/, 8];
                case 8:
                    port = process.env.PORT || 3000;
                    return [4 /*yield*/, app.listen(port)];
                case 9:
                    _a.sent();
                    console.log("VMS Backend running at http://localhost:".concat(port));
                    return [2 /*return*/];
            }
        });
    });
}
bootstrap().catch(function (err) {
    console.error(err);
    process.exit(1);
});
