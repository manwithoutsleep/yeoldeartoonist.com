import { describe, it, expect } from 'vitest';
import nextConfig from '../../next.config';

describe('Next.js Configuration', () => {
    describe('Server Actions', () => {
        it('should have serverActions bodySizeLimit configured', () => {
            expect(nextConfig.experimental?.serverActions).toBeDefined();
            expect(
                nextConfig.experimental?.serverActions?.bodySizeLimit
            ).toBeDefined();
        });

        it('should set bodySizeLimit to 10mb', () => {
            expect(nextConfig.experimental?.serverActions?.bodySizeLimit).toBe(
                '10mb'
            );
        });
    });
});
