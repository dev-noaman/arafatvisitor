module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src', '<rootDir>/test'],
    testMatch: [
        '**/__tests__/**/*.+(ts|tsx|js)',
        '**/*.(spec|test).+(ts|tsx|js)',
    ],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    collectCoverageFrom: [
        'src/**/*.(ts|tsx)',
        '!src/**/*.d.ts',
        '!src/**/*.interface.ts',
        '!src/**/*.dto.ts',
        '!src/main.ts',
        '!src/test-utils/**',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    // 80% coverage threshold as specified in requirements
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    // Setup file that runs before all tests
    setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@test/(.*)$': '<rootDir>/test/$1',
    },
    testTimeout: 10000,
}
