import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/admin/upload/route';
import { NextRequest } from 'next/server';
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

describe('POST /api/admin/upload', () => {
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
    });

    describe('Authentication', () => {
        it('should return 401 if no session cookie exists', async () => {
            mockCookieStore.get.mockReturnValue(undefined);

            const formData = new FormData();
            const request = new NextRequest(
                'http://localhost:3000/api/admin/upload',
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Unauthorized');
        });

        it('should return 401 if session cookie is invalid JSON', async () => {
            mockCookieStore.get.mockReturnValue({
                value: 'invalid-json',
            });

            const formData = new FormData();
            const request = new NextRequest(
                'http://localhost:3000/api/admin/upload',
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Invalid session');
        });

        it('should return 401 if session is missing userId', async () => {
            mockCookieStore.get.mockReturnValue({
                value: JSON.stringify({
                    expiresAt: Date.now() + 10000,
                }),
            });

            const formData = new FormData();
            const request = new NextRequest(
                'http://localhost:3000/api/admin/upload',
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Invalid session');
        });

        it('should return 401 if session has expired', async () => {
            mockCookieStore.get.mockReturnValue({
                value: JSON.stringify({
                    userId: '123',
                    expiresAt: Date.now() - 10000, // Expired
                }),
            });

            const formData = new FormData();
            const request = new NextRequest(
                'http://localhost:3000/api/admin/upload',
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Session expired');
        });
    });

    describe('File Validation', () => {
        beforeEach(() => {
            // Mock valid session for these tests
            mockCookieStore.get.mockReturnValue({
                value: JSON.stringify({
                    userId: '123',
                    expiresAt: Date.now() + 10000,
                }),
            });
        });

        it('should return 400 if no file is uploaded', async () => {
            const formData = new FormData();
            const request = new NextRequest(
                'http://localhost:3000/api/admin/upload',
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('No file uploaded');
        });

        it('should return 400 for invalid file type', async () => {
            const textFile = new File(['text content'], 'document.txt', {
                type: 'text/plain',
            });
            const formData = new FormData();
            formData.append('file', textFile);

            const request = new NextRequest(
                'http://localhost:3000/api/admin/upload',
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
            );
        });

        it('should accept image/jpeg files', async () => {
            const { generateImageVariants } = await import('@/lib/utils/image');
            (
                generateImageVariants as ReturnType<typeof vi.fn>
            ).mockResolvedValue({
                data: {
                    thumbnail: {
                        buffer: Buffer.from('thumb'),
                        filename: 'thumb.webp',
                    },
                    preview: {
                        buffer: Buffer.from('preview'),
                        filename: 'preview.webp',
                    },
                    large: {
                        buffer: Buffer.from('large'),
                        filename: 'large.webp',
                    },
                },
                error: null,
            });

            const mockSupabase = {
                storage: {
                    from: vi.fn().mockReturnValue({
                        upload: vi
                            .fn()
                            .mockResolvedValue({ data: {}, error: null }),
                    }),
                },
            };
            (createClient as ReturnType<typeof vi.fn>).mockReturnValue(
                mockSupabase
            );

            const jpegFile = new File(['fake image'], 'photo.jpg', {
                type: 'image/jpeg',
            });
            const formData = new FormData();
            formData.append('file', jpegFile);

            const request = new NextRequest(
                'http://localhost:3000/api/admin/upload',
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const response = await POST(request);
            expect(response.status).toBe(200);
        });

        it('should accept image/png files', async () => {
            const { generateImageVariants } = await import('@/lib/utils/image');
            (
                generateImageVariants as ReturnType<typeof vi.fn>
            ).mockResolvedValue({
                data: {
                    thumbnail: {
                        buffer: Buffer.from('thumb'),
                        filename: 'thumb.webp',
                    },
                    preview: {
                        buffer: Buffer.from('preview'),
                        filename: 'preview.webp',
                    },
                    large: {
                        buffer: Buffer.from('large'),
                        filename: 'large.webp',
                    },
                },
                error: null,
            });

            const mockSupabase = {
                storage: {
                    from: vi.fn().mockReturnValue({
                        upload: vi
                            .fn()
                            .mockResolvedValue({ data: {}, error: null }),
                    }),
                },
            };
            (createClient as ReturnType<typeof vi.fn>).mockReturnValue(
                mockSupabase
            );

            const pngFile = new File(['fake image'], 'photo.png', {
                type: 'image/png',
            });
            const formData = new FormData();
            formData.append('file', pngFile);

            const request = new NextRequest(
                'http://localhost:3000/api/admin/upload',
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const response = await POST(request);
            expect(response.status).toBe(200);
        });

        it('should accept image/webp files', async () => {
            const { generateImageVariants } = await import('@/lib/utils/image');
            (
                generateImageVariants as ReturnType<typeof vi.fn>
            ).mockResolvedValue({
                data: {
                    thumbnail: {
                        buffer: Buffer.from('thumb'),
                        filename: 'thumb.webp',
                    },
                    preview: {
                        buffer: Buffer.from('preview'),
                        filename: 'preview.webp',
                    },
                    large: {
                        buffer: Buffer.from('large'),
                        filename: 'large.webp',
                    },
                },
                error: null,
            });

            const mockSupabase = {
                storage: {
                    from: vi.fn().mockReturnValue({
                        upload: vi
                            .fn()
                            .mockResolvedValue({ data: {}, error: null }),
                    }),
                },
            };
            (createClient as ReturnType<typeof vi.fn>).mockReturnValue(
                mockSupabase
            );

            const webpFile = new File(['fake image'], 'photo.webp', {
                type: 'image/webp',
            });
            const formData = new FormData();
            formData.append('file', webpFile);

            const request = new NextRequest(
                'http://localhost:3000/api/admin/upload',
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const response = await POST(request);
            expect(response.status).toBe(200);
        });

        it('should return 413 for files larger than 10MB', async () => {
            // Create a file larger than 10MB (10 * 1024 * 1024 bytes)
            const largeBuffer = new ArrayBuffer(11 * 1024 * 1024);
            const largeFile = new File([largeBuffer], 'large.jpg', {
                type: 'image/jpeg',
            });
            const formData = new FormData();
            formData.append('file', largeFile);

            const request = new NextRequest(
                'http://localhost:3000/api/admin/upload',
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(413);
            expect(data.error).toBe('File too large. Maximum size is 10MB.');
        });
    });

    describe('Image Processing', () => {
        beforeEach(() => {
            mockCookieStore.get.mockReturnValue({
                value: JSON.stringify({
                    userId: '123',
                    expiresAt: Date.now() + 10000,
                }),
            });
        });

        it('should return 500 if image processing fails', async () => {
            const { generateImageVariants } = await import('@/lib/utils/image');
            (
                generateImageVariants as ReturnType<typeof vi.fn>
            ).mockResolvedValue({
                data: null,
                error: {
                    message: 'Failed to process image',
                    code: 'PROCESSING_ERROR',
                },
            });

            const jpegFile = new File(['fake image'], 'photo.jpg', {
                type: 'image/jpeg',
            });
            const formData = new FormData();
            formData.append('file', jpegFile);

            const request = new NextRequest(
                'http://localhost:3000/api/admin/upload',
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toContain('Failed to process image');
        });
    });

    describe('Storage Upload', () => {
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

        it('should upload all 3 variants to Supabase Storage', async () => {
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

            const jpegFile = new File(['fake image'], 'artwork.jpg', {
                type: 'image/jpeg',
            });
            const formData = new FormData();
            formData.append('file', jpegFile);

            const request = new NextRequest(
                'http://localhost:3000/api/admin/upload',
                {
                    method: 'POST',
                    body: formData,
                }
            );

            await POST(request);

            expect(mockFrom).toHaveBeenCalledWith('artwork');
            expect(mockUpload).toHaveBeenCalledTimes(3);
            expect(mockUpload).toHaveBeenCalledWith(
                '123-thumb.webp',
                expect.any(Buffer),
                expect.objectContaining({ contentType: 'image/webp' })
            );
        });

        it('should return 500 if storage upload fails', async () => {
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

            const jpegFile = new File(['fake image'], 'artwork.jpg', {
                type: 'image/jpeg',
            });
            const formData = new FormData();
            formData.append('file', jpegFile);

            const request = new NextRequest(
                'http://localhost:3000/api/admin/upload',
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toContain('Failed to upload');
        });

        it('should return 200 with all 3 URLs on success', async () => {
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

            const jpegFile = new File(['fake image'], 'artwork.jpg', {
                type: 'image/jpeg',
            });
            const formData = new FormData();
            formData.append('file', jpegFile);

            const request = new NextRequest(
                'http://localhost:3000/api/admin/upload',
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toHaveProperty('image_thumbnail_url');
            expect(data).toHaveProperty('image_url');
            expect(data).toHaveProperty('image_large_url');
            expect(data.image_thumbnail_url).toContain('123-thumb.webp');
            expect(data.image_url).toContain('123-preview.webp');
            expect(data.image_large_url).toContain('123-large.webp');
        });
    });
});
