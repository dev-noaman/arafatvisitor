import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'
import { PrismaClient } from '@prisma/client'

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
export const prismaMock = mockDeep<PrismaClient>() as DeepMockProxy<PrismaClient>

// Reset all mocks before each test to ensure test isolation
beforeEach(() => {
    mockReset(prismaMock)
})

// Export the mock for use in tests
export default prismaMock

/**
 * Helper function to create mock data for entities
 * 
 * @example
 * ```typescript
 * const mockUser = createMockUser({ id: 1, name: 'John' })
 * ```
 */
export const createMockUser = (overrides = {}) => ({
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
})

export const createMockHost = (overrides = {}) => ({
    id: 1,
    userId: 1,
    phone: '+1234567890',
    department: 'Engineering',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
})

export const createMockVisit = (overrides = {}) => ({
    id: 1,
    hostId: 1,
    visitorName: 'John Doe',
    visitorEmail: 'john@example.com',
    visitorPhone: '+1234567890',
    purpose: 'Meeting',
    status: 'PENDING',
    scheduledAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
})
