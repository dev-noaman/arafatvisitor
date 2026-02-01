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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVisitDto = void 0;
var class_validator_1 = require("class-validator");
var CreateVisitDto = function () {
    var _a;
    var _visitorName_decorators;
    var _visitorName_initializers = [];
    var _visitorName_extraInitializers = [];
    var _visitorCompany_decorators;
    var _visitorCompany_initializers = [];
    var _visitorCompany_extraInitializers = [];
    var _visitorPhone_decorators;
    var _visitorPhone_initializers = [];
    var _visitorPhone_extraInitializers = [];
    var _visitorEmail_decorators;
    var _visitorEmail_initializers = [];
    var _visitorEmail_extraInitializers = [];
    var _hostId_decorators;
    var _hostId_initializers = [];
    var _hostId_extraInitializers = [];
    var _purpose_decorators;
    var _purpose_initializers = [];
    var _purpose_extraInitializers = [];
    var _location_decorators;
    var _location_initializers = [];
    var _location_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateVisitDto() {
                this.visitorName = __runInitializers(this, _visitorName_initializers, void 0);
                this.visitorCompany = (__runInitializers(this, _visitorName_extraInitializers), __runInitializers(this, _visitorCompany_initializers, void 0));
                this.visitorPhone = (__runInitializers(this, _visitorCompany_extraInitializers), __runInitializers(this, _visitorPhone_initializers, void 0));
                this.visitorEmail = (__runInitializers(this, _visitorPhone_extraInitializers), __runInitializers(this, _visitorEmail_initializers, void 0));
                this.hostId = (__runInitializers(this, _visitorEmail_extraInitializers), __runInitializers(this, _hostId_initializers, void 0));
                this.purpose = (__runInitializers(this, _hostId_extraInitializers), __runInitializers(this, _purpose_initializers, void 0));
                this.location = (__runInitializers(this, _purpose_extraInitializers), __runInitializers(this, _location_initializers, void 0));
                __runInitializers(this, _location_extraInitializers);
            }
            return CreateVisitDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _visitorName_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(2)];
            _visitorCompany_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(2)];
            _visitorPhone_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(6)];
            _visitorEmail_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEmail)()];
            _hostId_decorators = [(0, class_validator_1.IsString)()];
            _purpose_decorators = [(0, class_validator_1.IsString)()];
            _location_decorators = [(0, class_validator_1.IsString)()];
            __esDecorate(null, null, _visitorName_decorators, { kind: "field", name: "visitorName", static: false, private: false, access: { has: function (obj) { return "visitorName" in obj; }, get: function (obj) { return obj.visitorName; }, set: function (obj, value) { obj.visitorName = value; } }, metadata: _metadata }, _visitorName_initializers, _visitorName_extraInitializers);
            __esDecorate(null, null, _visitorCompany_decorators, { kind: "field", name: "visitorCompany", static: false, private: false, access: { has: function (obj) { return "visitorCompany" in obj; }, get: function (obj) { return obj.visitorCompany; }, set: function (obj, value) { obj.visitorCompany = value; } }, metadata: _metadata }, _visitorCompany_initializers, _visitorCompany_extraInitializers);
            __esDecorate(null, null, _visitorPhone_decorators, { kind: "field", name: "visitorPhone", static: false, private: false, access: { has: function (obj) { return "visitorPhone" in obj; }, get: function (obj) { return obj.visitorPhone; }, set: function (obj, value) { obj.visitorPhone = value; } }, metadata: _metadata }, _visitorPhone_initializers, _visitorPhone_extraInitializers);
            __esDecorate(null, null, _visitorEmail_decorators, { kind: "field", name: "visitorEmail", static: false, private: false, access: { has: function (obj) { return "visitorEmail" in obj; }, get: function (obj) { return obj.visitorEmail; }, set: function (obj, value) { obj.visitorEmail = value; } }, metadata: _metadata }, _visitorEmail_initializers, _visitorEmail_extraInitializers);
            __esDecorate(null, null, _hostId_decorators, { kind: "field", name: "hostId", static: false, private: false, access: { has: function (obj) { return "hostId" in obj; }, get: function (obj) { return obj.hostId; }, set: function (obj, value) { obj.hostId = value; } }, metadata: _metadata }, _hostId_initializers, _hostId_extraInitializers);
            __esDecorate(null, null, _purpose_decorators, { kind: "field", name: "purpose", static: false, private: false, access: { has: function (obj) { return "purpose" in obj; }, get: function (obj) { return obj.purpose; }, set: function (obj, value) { obj.purpose = value; } }, metadata: _metadata }, _purpose_initializers, _purpose_extraInitializers);
            __esDecorate(null, null, _location_decorators, { kind: "field", name: "location", static: false, private: false, access: { has: function (obj) { return "location" in obj; }, get: function (obj) { return obj.location; }, set: function (obj, value) { obj.location = value; } }, metadata: _metadata }, _location_initializers, _location_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateVisitDto = CreateVisitDto;
