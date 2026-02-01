"use strict";
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitsController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
var roles_guard_1 = require("../common/guards/roles.guard");
var roles_decorator_1 = require("../common/decorators/roles.decorator");
var client_1 = require("@prisma/client");
var VisitsController = function () {
    var _classDecorators = [(0, common_1.Controller)('visits'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _create_decorators;
    var _preRegister_decorators;
    var _getPending_decorators;
    var _approve_decorators;
    var _reject_decorators;
    var _getActive_decorators;
    var _getHistory_decorators;
    var _findBySessionId_decorators;
    var _checkout_decorators;
    var VisitsController = _classThis = /** @class */ (function () {
        function VisitsController_1(visitsService) {
            this.visitsService = (__runInitializers(this, _instanceExtraInitializers), visitsService);
        }
        VisitsController_1.prototype.create = function (dto, userId) {
            return this.visitsService.create(dto, userId);
        };
        VisitsController_1.prototype.preRegister = function (dto, userId) {
            return this.visitsService.preRegister(dto, userId);
        };
        VisitsController_1.prototype.getPending = function (userId) {
            return this.visitsService.getPending(userId);
        };
        VisitsController_1.prototype.approve = function (id, userId) {
            return this.visitsService.approve(id, userId);
        };
        VisitsController_1.prototype.reject = function (id, userId, dto) {
            return this.visitsService.reject(id, userId, dto.reason);
        };
        VisitsController_1.prototype.getActive = function (location) {
            return this.visitsService.getActive(location);
        };
        VisitsController_1.prototype.getHistory = function (location, from, to) {
            return this.visitsService.getHistory({ location: location, from: from, to: to });
        };
        VisitsController_1.prototype.findBySessionId = function (sessionId) {
            return this.visitsService.findBySessionId(sessionId);
        };
        VisitsController_1.prototype.checkout = function (sessionId, userId) {
            return this.visitsService.checkout(sessionId, userId);
        };
        return VisitsController_1;
    }());
    __setFunctionName(_classThis, "VisitsController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _create_decorators = [(0, common_1.Post)(), (0, common_1.UseGuards)(roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.RECEPTION)];
        _preRegister_decorators = [(0, common_1.Post)('pre-register'), (0, common_1.UseGuards)(roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(client_1.Role.HOST)];
        _getPending_decorators = [(0, common_1.Get)('pending'), (0, common_1.UseGuards)(roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(client_1.Role.HOST)];
        _approve_decorators = [(0, common_1.Post)(':id/approve'), (0, common_1.UseGuards)(roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(client_1.Role.HOST)];
        _reject_decorators = [(0, common_1.Post)(':id/reject'), (0, common_1.UseGuards)(roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(client_1.Role.HOST)];
        _getActive_decorators = [(0, common_1.Get)('active'), (0, common_1.UseGuards)(roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.RECEPTION)];
        _getHistory_decorators = [(0, common_1.Get)('history'), (0, common_1.UseGuards)(roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(client_1.Role.ADMIN)];
        _findBySessionId_decorators = [(0, common_1.Get)(':sessionId'), (0, common_1.UseGuards)(roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.RECEPTION)];
        _checkout_decorators = [(0, common_1.Post)(':sessionId/checkout'), (0, common_1.UseGuards)(roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.RECEPTION)];
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: function (obj) { return "create" in obj; }, get: function (obj) { return obj.create; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _preRegister_decorators, { kind: "method", name: "preRegister", static: false, private: false, access: { has: function (obj) { return "preRegister" in obj; }, get: function (obj) { return obj.preRegister; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPending_decorators, { kind: "method", name: "getPending", static: false, private: false, access: { has: function (obj) { return "getPending" in obj; }, get: function (obj) { return obj.getPending; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _approve_decorators, { kind: "method", name: "approve", static: false, private: false, access: { has: function (obj) { return "approve" in obj; }, get: function (obj) { return obj.approve; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _reject_decorators, { kind: "method", name: "reject", static: false, private: false, access: { has: function (obj) { return "reject" in obj; }, get: function (obj) { return obj.reject; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getActive_decorators, { kind: "method", name: "getActive", static: false, private: false, access: { has: function (obj) { return "getActive" in obj; }, get: function (obj) { return obj.getActive; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getHistory_decorators, { kind: "method", name: "getHistory", static: false, private: false, access: { has: function (obj) { return "getHistory" in obj; }, get: function (obj) { return obj.getHistory; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findBySessionId_decorators, { kind: "method", name: "findBySessionId", static: false, private: false, access: { has: function (obj) { return "findBySessionId" in obj; }, get: function (obj) { return obj.findBySessionId; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _checkout_decorators, { kind: "method", name: "checkout", static: false, private: false, access: { has: function (obj) { return "checkout" in obj; }, get: function (obj) { return obj.checkout; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        VisitsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return VisitsController = _classThis;
}();
exports.VisitsController = VisitsController;
