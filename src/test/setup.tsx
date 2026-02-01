"use strict";
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
var vitest_1 = require("vitest");
require("@testing-library/jest-dom/vitest");
// Global test setup for Vitest with happy-dom
// This file runs before each test file
// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vitest_1.vi.fn().mockImplementation(function (query) { return ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vitest_1.vi.fn(), // Deprecated
        removeListener: vitest_1.vi.fn(), // Deprecated
        addEventListener: vitest_1.vi.fn(),
        removeEventListener: vitest_1.vi.fn(),
        dispatchEvent: vitest_1.vi.fn(),
    }); }),
});
globalThis.IntersectionObserver = /** @class */ (function () {
    function IntersectionObserver() {
    }
    IntersectionObserver.prototype.disconnect = function () { };
    IntersectionObserver.prototype.observe = function () { };
    IntersectionObserver.prototype.takeRecords = function () {
        return [];
    };
    IntersectionObserver.prototype.unobserve = function () { };
    return IntersectionObserver;
}());
globalThis.ResizeObserver = /** @class */ (function () {
    function ResizeObserver() {
    }
    ResizeObserver.prototype.disconnect = function () { };
    ResizeObserver.prototype.observe = function () { };
    ResizeObserver.prototype.unobserve = function () { };
    return ResizeObserver;
}());
// Suppress console errors/warnings in tests unless explicitly testing for them
var originalError = console.error;
var originalWarn = console.warn;
console.error = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (typeof args[0] === 'string' &&
        args[0].includes('Warning: ReactDOM.render')) {
        return;
    }
    originalError.call.apply(originalError, __spreadArray([console], args, false));
};
console.warn = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (typeof args[0] === 'string' &&
        (args[0].includes('componentWillReceiveProps') ||
            args[0].includes('componentWillMount'))) {
        return;
    }
    originalWarn.call.apply(originalWarn, __spreadArray([console], args, false));
};
