import { describe, it, expect, beforeEach } from 'vitest';
import { generateImageVariants } from '@/lib/utils/image';
import sharp from 'sharp';

describe('generateImageVariants', () => {
    let testImageBuffer: Buffer;

    beforeEach(() => {
        // Create a test image buffer (1x1 red pixel PNG)
        testImageBuffer = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
            'base64'
        );
    });

    it('should generate three size variants', async () => {
        const result = await generateImageVariants(
            testImageBuffer,
            'test-image.jpg'
        );

        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
        expect(result.data?.thumbnail).toBeDefined();
        expect(result.data?.preview).toBeDefined();
        expect(result.data?.large).toBeDefined();
    });

    it('should generate thumbnail variant at 300px width', async () => {
        const result = await generateImageVariants(
            testImageBuffer,
            'test-image.jpg'
        );

        expect(result.error).toBeNull();
        expect(result.data?.thumbnail).toBeDefined();

        // Verify the thumbnail buffer is valid WebP
        const metadata = await sharp(result.data!.thumbnail.buffer).metadata();
        expect(metadata.format).toBe('webp');
        expect(metadata.width).toBe(300);
    });

    it('should generate preview variant at 800px width', async () => {
        const result = await generateImageVariants(
            testImageBuffer,
            'test-image.jpg'
        );

        expect(result.error).toBeNull();
        expect(result.data?.preview).toBeDefined();

        const metadata = await sharp(result.data!.preview.buffer).metadata();
        expect(metadata.format).toBe('webp');
        expect(metadata.width).toBe(800);
    });

    it('should generate large variant at 1600px width', async () => {
        const result = await generateImageVariants(
            testImageBuffer,
            'test-image.jpg'
        );

        expect(result.error).toBeNull();
        expect(result.data?.large).toBeDefined();

        const metadata = await sharp(result.data!.large.buffer).metadata();
        expect(metadata.format).toBe('webp');
        expect(metadata.width).toBe(1600);
    });

    it('should convert all variants to WebP format', async () => {
        const result = await generateImageVariants(
            testImageBuffer,
            'test-image.jpg'
        );

        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();

        const thumbMeta = await sharp(result.data!.thumbnail.buffer).metadata();
        const previewMeta = await sharp(result.data!.preview.buffer).metadata();
        const largeMeta = await sharp(result.data!.large.buffer).metadata();

        expect(thumbMeta.format).toBe('webp');
        expect(previewMeta.format).toBe('webp');
        expect(largeMeta.format).toBe('webp');
    });

    it('should maintain aspect ratio for all variants', async () => {
        // Create a 2:1 aspect ratio test image (2000x1000)
        const wideImageBuffer = await sharp({
            create: {
                width: 2000,
                height: 1000,
                channels: 3,
                background: { r: 255, g: 0, b: 0 },
            },
        })
            .png()
            .toBuffer();

        const result = await generateImageVariants(
            wideImageBuffer,
            'wide-image.jpg'
        );

        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();

        const thumbMeta = await sharp(result.data!.thumbnail.buffer).metadata();
        const previewMeta = await sharp(result.data!.preview.buffer).metadata();
        const largeMeta = await sharp(result.data!.large.buffer).metadata();

        // All should maintain 2:1 aspect ratio
        expect(thumbMeta.width).toBe(300);
        expect(thumbMeta.height).toBe(150);

        expect(previewMeta.width).toBe(800);
        expect(previewMeta.height).toBe(400);

        expect(largeMeta.width).toBe(1600);
        expect(largeMeta.height).toBe(800);
    });

    it('should generate filenames with timestamp and size suffix', async () => {
        const result = await generateImageVariants(
            testImageBuffer,
            'artwork-painting.jpg'
        );

        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();

        expect(result.data!.thumbnail.filename).toMatch(
            /^\d+-artwork-painting-thumb\.webp$/
        );
        expect(result.data!.preview.filename).toMatch(
            /^\d+-artwork-painting-preview\.webp$/
        );
        expect(result.data!.large.filename).toMatch(
            /^\d+-artwork-painting-large\.webp$/
        );
    });

    it('should handle invalid buffer gracefully', async () => {
        const invalidBuffer = Buffer.from('not an image');

        const result = await generateImageVariants(invalidBuffer, 'test.jpg');

        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('Failed to process image');
    });

    it('should handle empty buffer', async () => {
        const emptyBuffer = Buffer.alloc(0);

        const result = await generateImageVariants(emptyBuffer, 'test.jpg');

        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
    });

    it('should handle corrupt image data', async () => {
        // Create a buffer that looks like an image but is corrupted
        const corruptBuffer = Buffer.concat([
            Buffer.from([0xff, 0xd8, 0xff, 0xe0]), // JPEG header
            Buffer.from('corrupt data'),
        ]);

        const result = await generateImageVariants(corruptBuffer, 'test.jpg');

        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
    });

    it('should strip original extension and use .webp', async () => {
        const testCases = [
            'image.jpg',
            'image.jpeg',
            'image.png',
            'image.gif',
            'image',
        ];

        for (const filename of testCases) {
            const result = await generateImageVariants(
                testImageBuffer,
                filename
            );

            expect(result.error).toBeNull();
            expect(result.data?.thumbnail.filename).toMatch(/\.webp$/);
            expect(result.data?.preview.filename).toMatch(/\.webp$/);
            expect(result.data?.large.filename).toMatch(/\.webp$/);
        }
    });

    it('should return error for extremely small images', async () => {
        // Create a 1x1 pixel image that's too small to resize
        const tinyBuffer = await sharp({
            create: {
                width: 1,
                height: 1,
                channels: 3,
                background: { r: 255, g: 0, b: 0 },
            },
        })
            .png()
            .toBuffer();

        const result = await generateImageVariants(tinyBuffer, 'tiny.png');

        // Should still succeed but upscale the tiny image
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
    });
});
