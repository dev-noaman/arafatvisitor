"use strict";
// Main AdminJS Configuration
// Modular setup with custom dashboard, role-based access, and custom components
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
exports.buildAdminOptions = exports.getNavigationForRole = exports.customStyles = exports.brandingConfig = exports.componentPaths = void 0;
// Component paths for bundling (relative to this file)
exports.componentPaths = {
    Dashboard: './components/Dashboard',
    VisitorCards: './components/VisitorCards',
    ReportsPanel: './components/ReportsPanel',
    SettingsPanel: './components/SettingsPanel',
    SendQrModal: './components/SendQrModal',
    ChangePasswordModal: './components/ChangePasswordModal',
    UserPasswordField: './components/UserPasswordField',
    EditProfilePanel: './components/EditProfilePanel',
};
// AdminJS branding configuration
exports.brandingConfig = {
    companyName: 'Our Admin Panel',
    logo: false,
    favicon: '/favicon.ico',
    withMadeWithLove: false,
};
// Custom CSS for dark mode and sidebar
exports.customStyles = "\n  /* Dark mode support */\n  :root {\n    --adminjs-primary: #3b82f6;\n    --adminjs-primary-dark: #2563eb;\n  }\n  \n  .dark {\n    --adminjs-bg: #1f2937;\n    --adminjs-text: #f9fafb;\n    --adminjs-border: #374151;\n  }\n  \n  /* Sidebar always visible by default */\n  [data-css=\"sidebar\"] {\n    transform: translateX(0) !important;\n    transition: transform 0.3s ease;\n  }\n  \n  [data-css=\"sidebar\"].collapsed {\n    transform: translateX(-100%) !important;\n  }\n";
// Role-based navigation visibility
var getNavigationForRole = function (role) {
    var baseNav = [
        { name: 'Dashboard Stats', icon: 'Dashboard' },
        { name: 'Hosts', icon: 'User' },
        { name: 'Deliveries', icon: 'Package' },
        { name: 'Visitors', icon: 'UserCheck' },
        { name: 'Pre Register', icon: 'Calendar' },
    ];
    if (role === 'ADMIN') {
        return __spreadArray(__spreadArray([], baseNav, true), [
            { name: 'Reports', icon: 'FileText' },
            { name: 'Settings', icon: 'Settings' },
        ], false);
    }
    if (role === 'HOST') {
        return __spreadArray(__spreadArray([], baseNav, true), [
            { name: 'Reports', icon: 'FileText' },
        ], false);
    }
    // RECEPTION - limited navigation
    return [
        { name: 'Dashboard', icon: 'Dashboard' },
        { name: 'Deliveries', icon: 'Package' },
        { name: 'Visitors', icon: 'UserCheck' },
        { name: 'Pre Register', icon: 'Calendar' },
    ];
};
exports.getNavigationForRole = getNavigationForRole;
// Export admin options builder function
var buildAdminOptions = function (getModel, prisma, Components) { return ({
    rootPath: '/admin',
    loginPath: '/admin/login',
    logoutPath: '/admin/logout',
    branding: exports.brandingConfig,
    dashboard: {
        component: Components.Dashboard,
    },
    pages: {
        Reports: {
            component: Components.ReportsPanel,
            icon: 'FileText',
        },
        Settings: {
            component: Components.SettingsPanel,
            icon: 'Settings',
        },
        EditProfile: {
            component: Components.EditProfilePanel,
            icon: 'User',
        },
    },
    resources: [
        // Hosts Resource
        {
            resource: { model: getModel('Host'), client: prisma },
            options: {
                id: 'Hosts',
                navigation: { name: 'Hosts', icon: 'User' },
                listProperties: ['name', 'company', 'email', 'phone', 'location'],
                filterProperties: ['company', 'location', 'status'],
                sort: { sortBy: 'company', direction: 'asc' },
                properties: {
                    status: {
                        availableValues: [
                            { value: 1, label: 'Active' },
                            { value: 0, label: 'InActive' },
                        ],
                    },
                },
                actions: {
                    new: {
                        isAccessible: function (_a) {
                            var currentAdmin = _a.currentAdmin;
                            return (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'ADMIN';
                        },
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
                    list: {
                        before: function (request, context) { return __awaiter(void 0, void 0, void 0, function () {
                            var currentAdmin, host;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        currentAdmin = context.currentAdmin;
                                        if (!((currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'HOST' && (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.hostId))) return [3 /*break*/, 2];
                                        return [4 /*yield*/, prisma.host.findUnique({
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
            resource: { model: getModel('Delivery'), client: prisma },
            options: {
                id: 'Deliveries',
                navigation: { name: 'Deliveries', icon: 'Package' },
                listProperties: ['courier', 'recipient', 'host', 'location', 'status', 'receivedAt', 'pickedUpAt'],
                filterProperties: ['status', 'location', 'receivedAt'],
                actions: {
                    // Reception can create, Host cannot
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
                    delete: {
                        isAccessible: function (_a) {
                            var currentAdmin = _a.currentAdmin;
                            return (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'ADMIN';
                        },
                    },
                    // Mark Picked Up action - Host only
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
                            // Must be RECEIVED status (no skipping)
                            if (status !== 'RECEIVED')
                                return false;
                            // Reception NEVER picks up
                            if (role === 'RECEPTION')
                                return false;
                            // Admin can pick up any
                            if (role === 'ADMIN')
                                return true;
                            // Host can pick up own company deliveries
                            if (role === 'HOST') {
                                return ((_d = (_c = record === null || record === void 0 ? void 0 : record.params) === null || _c === void 0 ? void 0 : _c.hostId) === null || _d === void 0 ? void 0 : _d.toString()) === ((_e = currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.hostId) === null || _e === void 0 ? void 0 : _e.toString());
                            }
                            return false;
                        },
                        handler: function (request, response, context) { return __awaiter(void 0, void 0, void 0, function () {
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
                        before: function (request, context) { return __awaiter(void 0, void 0, void 0, function () {
                            var currentAdmin;
                            return __generator(this, function (_a) {
                                currentAdmin = context.currentAdmin;
                                if ((currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'HOST' && (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.hostId)) {
                                    request.query = __assign(__assign({}, request.query), { 'filters.hostId': currentAdmin.hostId });
                                }
                                if ((currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'RECEPTION') {
                                    // Reception sees all at their location (no filter by hostId)
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
            resource: { model: getModel('Visit'), client: prisma },
            options: {
                id: 'Visitors',
                navigation: { name: 'Visitors', icon: 'UserCheck' },
                listProperties: ['visitorName', 'visitorPhone', 'host', 'purpose', 'status', 'checkInAt'],
                filterProperties: ['status', 'location', 'checkInAt'],
                // Custom list component for card view
                // component: Components.VisitorCards,
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
                    // Checkout action
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
                        handler: function (request, response, context) { return __awaiter(void 0, void 0, void 0, function () {
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
                    // Send QR action - all roles
                    sendQr: {
                        actionType: 'record',
                        label: 'Send QR',
                        icon: 'Send',
                        component: Components.SendQrModal,
                        isVisible: true,
                        isAccessible: function (_a) {
                            var _b;
                            var record = _a.record;
                            // Show if visit has a QR token
                            return !!((_b = record === null || record === void 0 ? void 0 : record.params) === null || _b === void 0 ? void 0 : _b.id);
                        },
                        handler: function (request, response, context) { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                // Handled by component
                                return [2 /*return*/, { record: context.record.toJSON() }];
                            });
                        }); },
                    },
                    list: {
                        before: function (request, context) { return __awaiter(void 0, void 0, void 0, function () {
                            var currentAdmin;
                            var _a;
                            return __generator(this, function (_b) {
                                currentAdmin = context.currentAdmin;
                                // Filter to show only CHECKED_IN and CHECKED_OUT
                                request.query = __assign(__assign({}, request.query), { 'filters.status': ((_a = request.query) === null || _a === void 0 ? void 0 : _a['filters.status']) || ['CHECKED_IN', 'CHECKED_OUT'] });
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
        // Pre Register Resource (Visit with PRE_REGISTERED, PENDING_APPROVAL, APPROVED, REJECTED)
        {
            resource: { model: getModel('Visit'), client: prisma },
            options: {
                id: 'PreRegister',
                navigation: { name: 'Pre Register', icon: 'Calendar' },
                listProperties: ['visitorName', 'visitorPhone', 'host', 'expectedDate', 'status', 'createdAt'],
                filterProperties: ['status', 'location', 'expectedDate'],
                actions: {
                    new: {
                        isAccessible: function (_a) {
                            var currentAdmin = _a.currentAdmin;
                            var role = currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role;
                            return role === 'ADMIN' || role === 'HOST' || role === 'RECEPTION';
                        },
                    },
                    edit: {
                        isAccessible: function () { return false; }, // No edit allowed
                    },
                    // Approve action
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
                                return false; // Reception never approves
                            if (role === 'ADMIN')
                                return true;
                            if (role === 'HOST') {
                                return ((_d = (_c = record === null || record === void 0 ? void 0 : record.params) === null || _c === void 0 ? void 0 : _c.hostId) === null || _d === void 0 ? void 0 : _d.toString()) === ((_e = currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.hostId) === null || _e === void 0 ? void 0 : _e.toString());
                            }
                            return false;
                        },
                        handler: function (request, response, context) { return __awaiter(void 0, void 0, void 0, function () {
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
                                        // TODO: Generate QR token and send notification
                                        return [2 /*return*/, {
                                                record: record.toJSON(),
                                                notice: { type: 'success', message: 'Pre-registration approved' },
                                            }];
                                }
                            });
                        }); },
                    },
                    // Reject action
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
                        handler: function (request, response, context) { return __awaiter(void 0, void 0, void 0, function () {
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
                                        // TODO: Send rejection notification
                                        return [2 /*return*/, {
                                                record: record.toJSON(),
                                                notice: { type: 'success', message: 'Pre-registration rejected' },
                                            }];
                                }
                            });
                        }); },
                    },
                    list: {
                        before: function (request, context) { return __awaiter(void 0, void 0, void 0, function () {
                            var currentAdmin, preRegStatuses;
                            var _a;
                            return __generator(this, function (_b) {
                                currentAdmin = context.currentAdmin;
                                preRegStatuses = ['PRE_REGISTERED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'];
                                request.query = __assign(__assign({}, request.query), { 'filters.status': ((_a = request.query) === null || _a === void 0 ? void 0 : _a['filters.status']) || preRegStatuses });
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
        // Users Resource (Admin only)
        {
            resource: { model: getModel('User'), client: prisma },
            options: {
                id: 'Users',
                navigation: { name: 'System', icon: 'Users' },
                listProperties: ['name', 'email', 'role', 'createdAt'],
                properties: {
                    password: {
                        isVisible: { list: false, show: false, edit: true, filter: false },
                        components: {
                            edit: Components.UserPasswordField,
                        },
                    },
                    hostId: {
                        isVisible: { list: false, show: false, edit: false, filter: false },
                    },
                    host: {
                        isVisible: { list: false, show: true, edit: false, filter: false },
                    },
                    email: {
                        isRequired: true,
                    },
                },
                actions: {
                    list: {
                        isAccessible: function (_a) {
                            var currentAdmin = _a.currentAdmin;
                            return (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'ADMIN';
                        },
                    },
                    new: {
                        isAccessible: function (_a) {
                            var currentAdmin = _a.currentAdmin;
                            return (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'ADMIN';
                        },
                        before: function (request) { return __awaiter(void 0, void 0, void 0, function () {
                            var email;
                            return __generator(this, function (_a) {
                                if (request.method === 'post') {
                                    email = request.payload.email;
                                    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                                        throw new Error('Invalid email address format');
                                    }
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
                        before: function (request) { return __awaiter(void 0, void 0, void 0, function () {
                            var email;
                            return __generator(this, function (_a) {
                                if (request.method === 'post') {
                                    email = request.payload.email;
                                    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                                        throw new Error('Invalid email address format');
                                    }
                                }
                                return [2 /*return*/, request];
                            });
                        }); },
                    },
                    delete: {
                        isAccessible: function (_a) {
                            var currentAdmin = _a.currentAdmin;
                            return (currentAdmin === null || currentAdmin === void 0 ? void 0 : currentAdmin.role) === 'ADMIN';
                        },
                    },
                },
            },
        },
        // Audit Log Resource (Admin only, read-only)
        {
            resource: { model: getModel('AuditLog'), client: prisma },
            options: {
                id: 'AuditLog',
                navigation: { name: 'System', icon: 'FileText' },
                actions: {
                    list: {
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
            },
            actions: {
                markPickedUp: 'Mark Picked Up',
                checkout: 'Check Out',
                sendQr: 'Send QR',
                approve: 'Approve',
                reject: 'Reject',
                bulkImport: 'Bulk Import',
            },
        },
    },
}); };
exports.buildAdminOptions = buildAdminOptions;
