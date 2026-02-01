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
exports.CreateDeliveryDto = void 0;
var class_validator_1 = require("class-validator");
var CreateDeliveryDto = function () {
    var _a;
    var _recipient_decorators;
    var _recipient_initializers = [];
    var _recipient_extraInitializers = [];
    var _courier_decorators;
    var _courier_initializers = [];
    var _courier_extraInitializers = [];
    var _location_decorators;
    var _location_initializers = [];
    var _location_extraInitializers = [];
    var _hostId_decorators;
    var _hostId_initializers = [];
    var _hostId_extraInitializers = [];
    var _notes_decorators;
    var _notes_initializers = [];
    var _notes_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateDeliveryDto() {
                this.recipient = __runInitializers(this, _recipient_initializers, void 0);
                this.courier = (__runInitializers(this, _recipient_extraInitializers), __runInitializers(this, _courier_initializers, void 0));
                this.location = (__runInitializers(this, _courier_extraInitializers), __runInitializers(this, _location_initializers, void 0));
                this.hostId = (__runInitializers(this, _location_extraInitializers), __runInitializers(this, _hostId_initializers, void 0));
                this.notes = (__runInitializers(this, _hostId_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
                __runInitializers(this, _notes_extraInitializers);
            }
            return CreateDeliveryDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _recipient_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1)];
            _courier_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1)];
            _location_decorators = [(0, class_validator_1.IsString)()];
            _hostId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _notes_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _recipient_decorators, { kind: "field", name: "recipient", static: false, private: false, access: { has: function (obj) { return "recipient" in obj; }, get: function (obj) { return obj.recipient; }, set: function (obj, value) { obj.recipient = value; } }, metadata: _metadata }, _recipient_initializers, _recipient_extraInitializers);
            __esDecorate(null, null, _courier_decorators, { kind: "field", name: "courier", static: false, private: false, access: { has: function (obj) { return "courier" in obj; }, get: function (obj) { return obj.courier; }, set: function (obj, value) { obj.courier = value; } }, metadata: _metadata }, _courier_initializers, _courier_extraInitializers);
            __esDecorate(null, null, _location_decorators, { kind: "field", name: "location", static: false, private: false, access: { has: function (obj) { return "location" in obj; }, get: function (obj) { return obj.location; }, set: function (obj, value) { obj.location = value; } }, metadata: _metadata }, _location_initializers, _location_extraInitializers);
            __esDecorate(null, null, _hostId_decorators, { kind: "field", name: "hostId", static: false, private: false, access: { has: function (obj) { return "hostId" in obj; }, get: function (obj) { return obj.hostId; }, set: function (obj, value) { obj.hostId = value; } }, metadata: _metadata }, _hostId_initializers, _hostId_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: function (obj) { return "notes" in obj; }, get: function (obj) { return obj.notes; }, set: function (obj, value) { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateDeliveryDto = CreateDeliveryDto;
