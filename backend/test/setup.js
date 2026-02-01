"use strict";
/**
 * Jest Setup File for Backend Tests
 *
 * This file runs before all test suites in the backend.
 * It configures global mocks and test environment.
 */
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
// Import the Prisma mock to ensure it's available globally
var prisma_mock_1 = require("../src/test-utils/prisma.mock");
global.prismaMock = prisma_mock_1.prismaMock;
// Increase timeout for async operations
jest.setTimeout(10000);
// Mock console methods to reduce noise in tests (optional)
var originalError = console.error;
var originalWarn = console.warn;
beforeAll(function () {
    console.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // Allow error messages from tests to be visible
        // but filter out common noise
        if (typeof args[0] === 'string' &&
            args[0].includes('Warning: ')) {
            return;
        }
        originalError.call.apply(originalError, __spreadArray([console], args, false));
    };
    console.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // Filter out common warnings
        if (typeof args[0] === 'string' &&
            args[0].includes('deprecated')) {
            return;
        }
        originalWarn.call.apply(originalWarn, __spreadArray([console], args, false));
    };
});
afterAll(function () {
    console.error = originalError;
    console.warn = originalWarn;
});
// Clear all mocks after each test for isolation
afterEach(function () {
    jest.clearAllMocks();
});
