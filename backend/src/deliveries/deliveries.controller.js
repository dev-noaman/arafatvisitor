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
exports.DeliveriesController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
var roles_guard_1 = require("../common/guards/roles.guard");
var roles_decorator_1 = require("../common/decorators/roles.decorator");
var client_1 = require("@prisma/client");
var DeliveriesController = function () {
    var _classDecorators = [(0, common_1.Controller)('deliveries'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _findAll_decorators;
    var _findMy_decorators;
    var _create_decorators;
    var _receive_decorators;
    var DeliveriesController = _classThis = /** @class */ (function () {
        function DeliveriesController_1(deliveriesService) {
            this.deliveriesService = (__runInitializers(this, _instanceExtraInitializers), deliveriesService);
        }
        DeliveriesController_1.prototype.findAll = function (location, search) {
            if (!location) {
                return this.deliveriesService.findAll('Barwa Towers', search);
            }
            return this.deliveriesService.findAll(location, search);
        };
        DeliveriesController_1.prototype.findMy = function (userId) {
            return this.deliveriesService.findMy(userId);
        };
        DeliveriesController_1.prototype.create = function (dto, location, userId) {
            var loc = location || 'Barwa Towers';
            return this.deliveriesService.create(dto, loc, userId);
        };
        DeliveriesController_1.prototype.receive = function (id, userId) {
            return this.deliveriesService.receive(id, userId);
        };
        return DeliveriesController_1;
    }());
    __setFunctionName(_classThis, "DeliveriesController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _findAll_decorators = [(0, common_1.Get)(), (0, common_1.UseGuards)(roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.RECEPTION)];
        _findMy_decorators = [(0, common_1.Get)('my'), (0, common_1.UseGuards)(roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(client_1.Role.HOST)];
        _create_decorators = [(0, common_1.Post)(), (0, common_1.UseGuards)(roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.RECEPTION)];
        _receive_decorators = [(0, common_1.Patch)(':id/receive'), (0, common_1.UseGuards)(roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.RECEPTION)];
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: function (obj) { return "findAll" in obj; }, get: function (obj) { return obj.findAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findMy_decorators, { kind: "method", name: "findMy", static: false, private: false, access: { has: function (obj) { return "findMy" in obj; }, get: function (obj) { return obj.findMy; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: function (obj) { return "create" in obj; }, get: function (obj) { return obj.create; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _receive_decorators, { kind: "method", name: "receive", static: false, private: false, access: { has: function (obj) { return "receive" in obj; }, get: function (obj) { return obj.receive; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DeliveriesController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DeliveriesController = _classThis;
}();
exports.DeliveriesController = DeliveriesController;
