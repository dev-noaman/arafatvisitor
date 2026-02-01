/**
 * Jest Setup File for Backend Tests
 * 
 * This file runs before all test suites in the backend.
 * It configures global mocks and test environment.
 */

// Import the Prisma mock to ensure it's available globally
import { prismaMock } from '../src/test-utils/prisma.mock'

// Make prismaMock available globally for convenience
// Use 'any' to avoid circular type reference
declare global {
    // eslint-disable-next-line no-var
    var prismaMock: any
}

global.prismaMock = prismaMock

// Increase timeout for async operations
jest.setTimeout(10000)

// Mock console methods to reduce noise in tests (optional)
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
    console.error = (...args: any[]) => {
        // Allow error messages from tests to be visible
        // but filter out common noise
        if (
            typeof args[0] === 'string' &&
            args[0].includes('Warning: ')
        ) {
            return
        }
        originalError.call(console, ...args)
    }

    console.warn = (...args: any[]) => {
        // Filter out common warnings
        if (
            typeof args[0] === 'string' &&
            args[0].includes('deprecated')
        ) {
            return
        }
        originalWarn.call(console, ...args)
    }
})

afterAll(() => {
    console.error = originalError
    console.warn = originalWarn
})

// Clear all mocks after each test for isolation
afterEach(() => {
    jest.clearAllMocks()
})
