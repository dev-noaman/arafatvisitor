import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../prisma/prisma.service'
import { prismaMock } from './prisma.mock'

/**
 * NestJS Module Factory Helpers
 * 
 * Provides utility functions to create test modules with mocked dependencies.
 * This simplifies setting up tests for NestJS services and controllers.
 * 
 * @example
 * ```typescript
 * import { createTestingModule } from '@/test-utils/module.factory'
 * 
 * describe('AuthService', () => {
 *   let service: AuthService
 *   let module: TestingModule
 * 
 *   beforeEach(async () => {
 *     module = await createTestingModule({
 *       providers: [AuthService],
 *     })
 *     service = module.get(AuthService)
 *   })
 * 
 *   afterEach(async () => {
 *     await module.close()
 *   })
 * })
 * ```
 */

/**
 * Creates a testing module with mocked Prisma service
 * 
 * @param options - Module builder options
 * @returns TestingModule instance
 */
export async function createTestingModule(
    options: {
        providers?: any[]
        controllers?: any[]
        imports?: any[]
        exports?: any[]
    } = {},
): Promise<TestingModule> {
    return Test.createTestingModule({
        ...options,
        providers: [
            ...(options.providers || []),
            // Always provide the mocked Prisma service
            {
                provide: PrismaService,
                useValue: prismaMock,
            },
        ],
    }).compile()
}

/**
 * Creates a testing module with a specific service and its dependencies
 * 
 * @param serviceClass - The service class to test
 * @param additionalProviders - Additional providers to include
 * @returns TestingModule instance with the service
 */
export async function createTestingModuleForService<T>(
    serviceClass: any,
    additionalProviders: any[] = [],
): Promise<TestingModule> {
    return Test.createTestingModule({
        providers: [
            serviceClass,
            ...additionalProviders,
            {
                provide: PrismaService,
                useValue: prismaMock,
            },
        ],
    }).compile()
}

/**
 * Creates a testing module for a controller with mocked dependencies
 * 
 * @param controllerClass - The controller class to test
 * @param providers - Service providers to include (will be mocked)
 * @returns TestingModule instance with the controller
 */
export async function createTestingModuleForController(
    controllerClass: any,
    providers: any[] = [],
): Promise<TestingModule> {
    // Mock all providers
    const mockedProviders = providers.map((provider) => ({
        provide: provider,
        useValue: {
            // Add common mock methods here
            // Specific mocks should be set in individual tests
        },
    }))

    return Test.createTestingModule({
        controllers: [controllerClass],
        providers: [
            ...mockedProviders,
            {
                provide: PrismaService,
                useValue: prismaMock,
            },
        ],
    }).compile()
}

/**
 * Helper to create a mock service with common methods
 * 
 * @example
 * ```typescript
 * const mockAuthService = createMockService<AuthService>({
 *   validateUser: jest.fn().mockResolvedValue(user),
 *   login: jest.fn().mockResolvedValue(token),
 * })
 * ```
 */
export function createMockService<T>(methods: Partial<T>): T {
    return {
        ...methods,
    } as T
}

/**
 * Helper to create a mock JWT payload
 */
export const createMockJwtPayload = (overrides = {}) => ({
    sub: 1,
    email: 'test@example.com',
    role: 'USER',
    iat: Date.now(),
    exp: Date.now() + 3600,
    ...overrides,
})

/**
 * Helper to create a mock request with user
 */
export const createMockRequest = (user = createMockJwtPayload()) => ({
    user,
    headers: {},
    query: {},
    params: {},
    body: {},
})
