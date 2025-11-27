'use server';

import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { generateImageVariants } from '@/lib/utils/image';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface UploadResult {
    success: boolean;
    data?: {
        image_thumbnail_url: string;
        image_url: string;
        image_large_url: string;
    };
    error?: string;
}

/**
 * Server Action for uploading images with automatic CSRF protection.
 *
 * Processes uploaded images into 3 WebP variants (thumbnail, preview, large)
 * and stores them in Supabase Storage.
 *
 * @param formData - FormData containing 'file' field
 * @returns UploadResult with success status, URLs, or error message
 *
 * Security:
 * - CSRF protection: Built-in via Next.js 16 Server Actions
 * - Authentication: Requires valid admin_session cookie
 * - File validation: Type and size checks
 * - Processing: Generates 300px, 800px, and 1600px WebP variants
 * - Storage: Uploads to 'artwork' bucket in Supabase Storage
 */
export async function uploadImageAction(
    formData: FormData
): Promise<UploadResult> {
    try {
        // 1. Authenticate (CSRF protection automatic via Server Action)
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('admin_session');

        if (!sessionCookie) {
            return { success: false, error: 'Unauthorized' };
        }

        // Parse and validate session
        let session;
        try {
            session = JSON.parse(sessionCookie.value);

            if (
                !session.userId ||
                !session.expiresAt ||
                session.expiresAt < Date.now()
            ) {
                return {
                    success: false,
                    error:
                        session.expiresAt < Date.now()
                            ? 'Session expired'
                            : 'Invalid session',
                };
            }
        } catch {
            return { success: false, error: 'Invalid session' };
        }

        // 2. Parse form data
        const file = formData.get('file') as File | null;
        if (!file) {
            return { success: false, error: 'No file uploaded' };
        }

        // 3. Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return {
                success: false,
                error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
            };
        }

        // 4. Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return {
                success: false,
                error: 'File too large. Maximum size is 10MB.',
            };
        }

        // 5. Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 6. Generate image variants
        const variantsResult = await generateImageVariants(buffer, file.name);

        if (variantsResult.error || !variantsResult.data) {
            return {
                success: false,
                error:
                    variantsResult.error?.message || 'Failed to process image',
            };
        }

        const { thumbnail, preview, large } = variantsResult.data;

        // 7. Initialize Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 8. Upload all 3 variants to Supabase Storage
        const bucket = supabase.storage.from('artwork');

        const uploadPromises = [
            bucket.upload(thumbnail.filename, thumbnail.buffer, {
                contentType: 'image/webp',
                upsert: false,
            }),
            bucket.upload(preview.filename, preview.buffer, {
                contentType: 'image/webp',
                upsert: false,
            }),
            bucket.upload(large.filename, large.buffer, {
                contentType: 'image/webp',
                upsert: false,
            }),
        ];

        const uploadResults = await Promise.all(uploadPromises);

        // Check for upload errors
        const uploadError = uploadResults.find((result) => result.error);
        if (uploadError?.error) {
            return {
                success: false,
                error: `Failed to upload image: ${uploadError.error.message}`,
            };
        }

        // 9. Generate public URLs
        const baseUrl = `${supabaseUrl}/storage/v1/object/public/artwork`;

        return {
            success: true,
            data: {
                image_thumbnail_url: `${baseUrl}/${thumbnail.filename}`,
                image_url: `${baseUrl}/${preview.filename}`,
                image_large_url: `${baseUrl}/${large.filename}`,
            },
        };
    } catch (error) {
        console.error('Upload error:', error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred',
        };
    }
}
