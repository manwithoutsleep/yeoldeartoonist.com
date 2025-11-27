import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadImageAction } from '@/app/admin/actions/upload';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Mock dependencies
vi.mock('next/headers', () => ({
    cookies: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(),
}));

vi.mock('@/lib/utils/image', () => ({
    generateImageVariants: vi.fn(),
}));

// Helper function to create a File with arrayBuffer support for Node.js
function createMockFile(
    content: string[],
    filename: string,
    options: FilePropertyBag
): File {
    const file = new File(content, filename, options);
    // Add arrayBuffer method for Node.js test environment
    Object.defineProperty(file, 'arrayBuffer', {
        value: async () => new ArrayBuffer(10),
    });
    return file;
}

describe('uploadImageAction', () => {
    const mockSupabaseUrl = 'https://test.supabase.co';
    const mockCookieStore = {
        get: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(
            mockCookieStore
        );
        process.env.NEXT_PUBLIC_SUPABASE_URL = mockSupabaseUrl;
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
    });

    describe('Authentication', () => {
        it('should return error if no session cookie exists', async () => {
            mockCookieStore.get.mockReturnValue(undefined);

            const formData = new FormData();
            const result = await uploadImageAction(formData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Unauthorized');
        });

        it('should return error if session is invalid JSON', async () => {
            mockCookieStore.get.mockReturnValue({
                value: 'invalid-json',
            });

            const formData = new FormData();
            const result = await uploadImageAction(formData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid session');
        });

        it('should return error if session is missing userId', async () => {
            mockCookieStore.get.mockReturnValue({
                value: JSON.stringify({
                    expiresAt: Date.now() + 10000,
                }),
            });

            const formData = new FormData();
            const result = await uploadImageAction(formData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid session');
        });

        it('should return error if session is expired', async () => {
            mockCookieStore.get.mockReturnValue({
                value: JSON.stringify({
                    userId: '123',
                    expiresAt: Date.now() - 10000, // Expired
                }),
            });

            const formData = new FormData();
            const result = await uploadImageAction(formData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Session expired');
        });
    });

    describe('File Validation', () => {
        beforeEach(() => {
            mockCookieStore.get.mockReturnValue({
                value: JSON.stringify({
                    userId: '123',
                    expiresAt: Date.now() + 10000,
                }),
            });
        });

        it('should return error if no file uploaded', async () => {
            const formData = new FormData();
            const result = await uploadImageAction(formData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('No file uploaded');
        });

        it('should return error for invalid file type', async () => {
            const textFile = new File(['text content'], 'document.txt', {
                type: 'text/plain',
            });
            const formData = new FormData();
            formData.append('file', textFile);

            const result = await uploadImageAction(formData);

            expect(result.success).toBe(false);
            expect(result.error).toBe(
                'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
            );
        });

        it('should accept JPEG files', async () => {
            const { generateImageVariants } = await import('@/lib/utils/image');
            (
                generateImageVariants as ReturnType<typeof vi.fn>
            ).mockResolvedValue({
                data: {
                    thumbnail: {
                        buffer: Buffer.from('thumb'),
                        filename: '123-thumb.webp',
                    },
                    preview: {
                        buffer: Buffer.from('preview'),
                        filename: '123-preview.webp',
                    },
                    large: {
                        buffer: Buffer.from('large'),
                        filename: '123-large.webp',
                    },
                },
                error: null,
            });

            const mockUpload = vi
                .fn()
                .mockResolvedValue({ data: {}, error: null });
            const mockFrom = vi.fn().mockReturnValue({ upload: mockUpload });
            const mockSupabase = {
                storage: { from: mockFrom },
            };
            (createClient as ReturnType<typeof vi.fn>).mockReturnValue(
                mockSupabase
            );

            const jpegFile = createMockFile(['fake image'], 'photo.jpg', {
                type: 'image/jpeg',
            });
            const formData = new FormData();
            formData.append('file', jpegFile);

            const result = await uploadImageAction(formData);

            expect(result.success).toBe(true);
        });

        it('should accept PNG files', async () => {
            const { generateImageVariants } = await import('@/lib/utils/image');
            (
                generateImageVariants as ReturnType<typeof vi.fn>
            ).mockResolvedValue({
                data: {
                    thumbnail: {
                        buffer: Buffer.from('thumb'),
                        filename: '123-thumb.webp',
                    },
                    preview: {
                        buffer: Buffer.from('preview'),
                        filename: '123-preview.webp',
                    },
                    large: {
                        buffer: Buffer.from('large'),
                        filename: '123-large.webp',
                    },
                },
                error: null,
            });

            const mockUpload = vi
                .fn()
                .mockResolvedValue({ data: {}, error: null });
            const mockFrom = vi.fn().mockReturnValue({ upload: mockUpload });
            const mockSupabase = {
                storage: { from: mockFrom },
            };
            (createClient as ReturnType<typeof vi.fn>).mockReturnValue(
                mockSupabase
            );

            const pngFile = createMockFile(['fake image'], 'photo.png', {
                type: 'image/png',
            });
            const formData = new FormData();
            formData.append('file', pngFile);

            const result = await uploadImageAction(formData);

            expect(result.success).toBe(true);
        });

        it('should return error for files larger than 10MB', async () => {
            const largeBuffer = new ArrayBuffer(11 * 1024 * 1024);
            const largeFile = new File([largeBuffer], 'large.jpg', {
                type: 'image/jpeg',
            });
            const formData = new FormData();
            formData.append('file', largeFile);

            const result = await uploadImageAction(formData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('File too large. Maximum size is 10MB.');
        });
    });

    describe('Upload Process', () => {
        beforeEach(async () => {
            mockCookieStore.get.mockReturnValue({
                value: JSON.stringify({
                    userId: '123',
                    expiresAt: Date.now() + 10000,
                }),
            });

            const imageModule = await import('@/lib/utils/image');
            const { generateImageVariants } = imageModule;
            (
                generateImageVariants as ReturnType<typeof vi.fn>
            ).mockResolvedValue({
                data: {
                    thumbnail: {
                        buffer: Buffer.from('thumb'),
                        filename: '123-thumb.webp',
                    },
                    preview: {
                        buffer: Buffer.from('preview'),
                        filename: '123-preview.webp',
                    },
                    large: {
                        buffer: Buffer.from('large'),
                        filename: '123-large.webp',
                    },
                },
                error: null,
            });
        });

        it('should successfully upload and return URLs', async () => {
            const mockUpload = vi
                .fn()
                .mockResolvedValue({ data: {}, error: null });
            const mockFrom = vi.fn().mockReturnValue({ upload: mockUpload });
            const mockSupabase = {
                storage: { from: mockFrom },
            };
            (createClient as ReturnType<typeof vi.fn>).mockReturnValue(
                mockSupabase
            );

            const jpegFile = createMockFile(['fake image'], 'artwork.jpg', {
                type: 'image/jpeg',
            });
            const formData = new FormData();
            formData.append('file', jpegFile);

            const result = await uploadImageAction(formData);

            expect(result.success).toBe(true);
            expect(result.data).toHaveProperty('image_thumbnail_url');
            expect(result.data).toHaveProperty('image_url');
            expect(result.data).toHaveProperty('image_large_url');
            expect(result.data?.image_thumbnail_url).toContain(
                '123-thumb.webp'
            );
            expect(result.data?.image_url).toContain('123-preview.webp');
            expect(result.data?.image_large_url).toContain('123-large.webp');
        });

        it('should call Supabase storage upload for all 3 variants', async () => {
            const mockUpload = vi
                .fn()
                .mockResolvedValue({ data: {}, error: null });
            const mockFrom = vi.fn().mockReturnValue({ upload: mockUpload });
            const mockSupabase = {
                storage: { from: mockFrom },
            };
            (createClient as ReturnType<typeof vi.fn>).mockReturnValue(
                mockSupabase
            );

            const jpegFile = createMockFile(['fake image'], 'artwork.jpg', {
                type: 'image/jpeg',
            });
            const formData = new FormData();
            formData.append('file', jpegFile);

            await uploadImageAction(formData);

            expect(mockFrom).toHaveBeenCalledWith('artwork');
            expect(mockUpload).toHaveBeenCalledTimes(3);
        });

        it('should return error if image processing fails', async () => {
            const { generateImageVariants } = await import('@/lib/utils/image');
            (
                generateImageVariants as ReturnType<typeof vi.fn>
            ).mockResolvedValue({
                data: null,
                error: { message: 'Processing failed' },
            });

            const jpegFile = createMockFile(['fake image'], 'artwork.jpg', {
                type: 'image/jpeg',
            });
            const formData = new FormData();
            formData.append('file', jpegFile);

            const result = await uploadImageAction(formData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Processing failed');
        });

        it('should return error if storage upload fails', async () => {
            const mockUpload = vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Storage error' },
            });
            const mockFrom = vi.fn().mockReturnValue({ upload: mockUpload });
            const mockSupabase = {
                storage: { from: mockFrom },
            };
            (createClient as ReturnType<typeof vi.fn>).mockReturnValue(
                mockSupabase
            );

            const jpegFile = createMockFile(['fake image'], 'artwork.jpg', {
                type: 'image/jpeg',
            });
            const formData = new FormData();
            formData.append('file', jpegFile);

            const result = await uploadImageAction(formData);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Failed to upload image');
        });
    });
});
