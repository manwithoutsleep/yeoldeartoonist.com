import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: ['./__tests__/setup.ts'],
        include: [
            '**/__tests__/**/*.test.ts',
            '**/__tests__/**/*.test.tsx',
            '**/*.test.ts',
            '**/*.test.tsx',
        ],
        exclude: ['**/node_modules/**', '**/.next/**'],
        // Use forks instead of worker threads for guaranteed memory cleanup
        // jsdom has memory leak issues in worker threads that cause test hangs
        // Forks run tests in child processes where OS reclaims memory completely
        pool: 'forks',
        // Enable parallel test execution for significant performance improvement
        // Original issue with vi.resetModules() has been resolved (see commit a2566525)
        // Tests execute ~60% faster with parallelism enabled
        fileParallelism: true,
        // Isolate tests to prevent state leakage between test files
        isolate: true,
        // Max number of threads (workers) to use for parallel execution
        // Lower number avoids resource contention while still getting parallelism benefits
        maxWorkers: 4,
        testTimeout: 10000, // 10 second timeout per test
        hookTimeout: 10000, // 10 second timeout for hooks
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.{js,jsx,ts,tsx}'],
            exclude: [
                'src/**/*.d.ts',
                'src/**/*.stories.{js,jsx,ts,tsx}',
                'src/types/database.ts', // Auto-generated, don't measure coverage
                'src/middleware.ts', // Complex middleware, harder to test in isolation
                'src/lib/supabase/server.ts', // Server-side client, tested in integration
            ],
            // No coverage thresholds - manual review preferred
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@/app': path.resolve(__dirname, './src/app'),
            '@/components': path.resolve(__dirname, './src/components'),
            '@/lib': path.resolve(__dirname, './src/lib'),
            '@/types': path.resolve(__dirname, './src/types'),
            '@/hooks': path.resolve(__dirname, './src/hooks'),
            '@/context': path.resolve(__dirname, './src/context'),
            '@/styles': path.resolve(__dirname, './src/styles'),
        },
    },
});
