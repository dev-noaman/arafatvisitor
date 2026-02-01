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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockVisit = exports.createMockHost = exports.createMockUser = exports.prismaMock = void 0;
var jest_mock_extended_1 = require("jest-mock-extended");
/**
 * Prisma Mock Factory
 *
 * Creates a fully mocked Prisma client for testing without database connections.
 * This allows tests to run fast and independently of the database.
 *
 * @example
 * ```typescript
 * import { prismaMock } from '@/test-utils/prisma.mock'
 *
 * beforeEach(() => {
 *   mockReset(prismaMock)
 * })
 *
 * test('creates a user', async () => {
 *   prismaMock.user.create.mockResolvedValue({ id: 1, name: 'John' })
 *   const result = await userService.createUser({ name: 'John' })
 *   expect(result).toEqual({ id: 1, name: 'John' })
 * })
 * ```
 */
// Create a single instance of the mocked Prisma client
// This will be reused across all tests
exports.prismaMock = (0, jest_mock_extended_1.mockDeep)();
// Reset all mocks before each test to ensure test isolation
beforeEach(function () {
    (0, jest_mock_extended_1.mockReset)(exports.prismaMock);
});
// Export the mock for use in tests
exports.default = exports.prismaMock;
/**
 * Helper function to create mock data for entities
 *
 * @example
 * ```typescript
 * const mockUser = createMockUser({ id: 1, name: 'John' })
 * ```
 */
var createMockUser = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return (__assign({ id: 1, email: 'test@example.com', name: 'Test User', role: 'USER', createdAt: new Date(), updatedAt: new Date() }, overrides));
};
exports.createMockUser = createMockUser;
var createMockHost = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return (__assign({ id: 1, userId: 1, phone: '+1234567890', department: 'Engineering', createdAt: new Date(), updatedAt: new Date() }, overrides));
};
exports.createMockHost = createMockHost;
var createMockVisit = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return (__assign({ id: 1, hostId: 1, visitorName: 'John Doe', visitorEmail: 'john@example.com', visitorPhone: '+1234567890', purpose: 'Meeting', status: 'PENDING', scheduledAt: new Date(), createdAt: new Date(), updatedAt: new Date() }, overrides));
};
exports.createMockVisit = createMockVisit;
