import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateImageVariants } from '@/lib/utils/image';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * POST /api/admin/upload
 *
 * Uploads an image file, processes it into 3 WebP variants (thumbnail, preview, large),
 * and stores them in Supabase Storage.
 *
 * @param request - Next.js request with multipart/form-data containing 'file'
 * @returns JSON response with URLs for all 3 variants or error message
 *
 * Authentication: Requires valid admin_session cookie
 * File Validation: Only JPEG, PNG, WebP up to 10MB
 * Processing: Generates 300px, 800px, and 1600px WebP variants
 * Storage: Uploads to 'artwork' bucket in Supabase Storage
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate request
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('admin_session');

        if (!sessionCookie) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
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
                return NextResponse.json(
                    {
                        error:
                            session.expiresAt < Date.now()
                                ? 'Session expired'
                                : 'Invalid session',
                    },
                    { status: 401 }
                );
            }
        } catch {
            return NextResponse.json(
                { error: 'Invalid session' },
                { status: 401 }
            );
        }

        // 2. Parse form data
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // 3. Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                {
                    error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
                },
                { status: 400 }
            );
        }

        // 4. Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 10MB.' },
                { status: 413 }
            );
        }

        // 5. Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 6. Generate image variants
        const variantsResult = await generateImageVariants(buffer, file.name);

        if (variantsResult.error || !variantsResult.data) {
            return NextResponse.json(
                {
                    error:
                        variantsResult.error?.message ||
                        'Failed to process image',
                },
                { status: 500 }
            );
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
            return NextResponse.json(
                {
                    error: `Failed to upload image: ${uploadError.error.message}`,
                },
                { status: 500 }
            );
        }

        // 9. Generate public URLs
        const baseUrl = `${supabaseUrl}/storage/v1/object/public/artwork`;

        return NextResponse.json(
            {
                image_thumbnail_url: `${baseUrl}/${thumbnail.filename}`,
                image_url: `${baseUrl}/${preview.filename}`,
                image_large_url: `${baseUrl}/${large.filename}`,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : 'An unexpected error occurred',
            },
            { status: 500 }
        );
    }
}
