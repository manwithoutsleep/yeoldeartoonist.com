import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
});

// Add any custom config to be passed to Jest
const config: Config = {
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.stories.{js,jsx,ts,tsx}',
        '!src/types/database.ts', // Auto-generated, don't measure coverage
        '!src/middleware.ts', // Complex middleware, harder to test in isolation
        '!src/lib/supabase/server.ts', // Server-side client, tested in integration
    ],
    // Coverage thresholds for Phase 2.5
    // These will increase as we add more tests in Phase 3+
    coverageThreshold: {
        global: {
            branches: 10,
            functions: 10,
            lines: 10,
            statements: 10,
        },
        './src/lib/supabase/': {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
        './src/components/': {
            branches: 80,
            functions: 85,
            lines: 85,
            statements: 85,
        },
        './src/config/': {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@/app/(.*)$': '<rootDir>/src/app/$1',
        '^@/components/(.*)$': '<rootDir>/src/components/$1',
        '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
        '^@/types/(.*)$': '<rootDir>/src/types/$1',
        '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
        '^@/context/(.*)$': '<rootDir>/src/context/$1',
        '^@/styles/(.*)$': '<rootDir>/src/styles/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
    testEnvironment: 'jest-environment-jsdom',
    testMatch: [
        '**/__tests__/**/*.test.ts',
        '**/__tests__/**/*.test.tsx',
        '**/*.test.ts',
        '**/*.test.tsx',
    ],
    transform: {
        '^.+\\.(ts|tsx)$': [
            'ts-jest',
            {
                tsconfig: {
                    jsx: 'react-jsx',
                    esModuleInterop: true,
                    allowSyntheticDefaultImports: true,
                },
            },
        ],
    },
    testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
