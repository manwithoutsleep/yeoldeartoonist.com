import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./__tests__/setup.ts'],
        include: [
            '**/__tests__/**/*.test.ts',
            '**/__tests__/**/*.test.tsx',
            '**/*.test.ts',
            '**/*.test.tsx',
        ],
        exclude: ['**/node_modules/**', '**/.next/**'],
        fileParallelism: false, // Run test files sequentially to avoid hanging
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
