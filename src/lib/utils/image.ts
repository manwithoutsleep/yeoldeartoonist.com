import sharp from 'sharp';

/**
 * Image variant with buffer and filename
 */
export interface ImageVariant {
    buffer: Buffer;
    filename: string;
}

/**
 * Result of image variant generation
 */
export interface ImageVariantsResult {
    thumbnail: ImageVariant;
    preview: ImageVariant;
    large: ImageVariant;
}

/**
 * Standard error response
 */
export interface ImageError {
    message: string;
    code?: string;
}

/**
 * Response format matching the codebase pattern
 */
export interface ImageVariantsResponse {
    data: ImageVariantsResult | null;
    error: ImageError | null;
}

/**
 * Sanitizes a filename by removing path components, multiple extensions, and special characters
 *
 * @param filename - The original filename to sanitize
 * @returns Sanitized filename (alphanumeric, hyphens, underscores only, max 100 chars)
 *
 * @example
 * sanitizeFilename('../../etc/passwd.jpg') // 'passwd'
 * sanitizeFilename('image.php.jpg') // 'image_php'
 * sanitizeFilename('my photo!.jpg') // 'my_photo'
 */
function sanitizeFilename(filename: string): string {
    // Remove any path components (handles both Unix and Windows paths)
    const basename = filename.split('/').pop()?.split('\\').pop() || 'image';

    // Extract only the last extension and remove it
    const parts = basename.split('.');
    const base = parts.length > 1 ? parts.slice(0, -1).join('_') : basename;

    // Sanitize: only alphanumeric, hyphens, underscores, spaces
    const sanitized = base.replace(/[^a-zA-Z0-9_-\s]/g, '_');

    // Replace multiple spaces/underscores with single underscore
    const cleaned = sanitized.replace(/[\s_]+/g, '_');

    // Remove leading/trailing underscores
    const trimmed = cleaned.replace(/^_+|_+$/g, '');

    // Limit length and ensure we have a valid name
    return (trimmed || 'image').substring(0, 100);
}

/**
 * Generates three WebP image variants (thumbnail, preview, large) from an uploaded image buffer
 *
 * @param buffer - The original image buffer
 * @param filename - The original filename (extension will be replaced)
 * @returns Object with data (variants) or error
 *
 * @example
 * const result = await generateImageVariants(imageBuffer, 'artwork.jpg');
 * if (result.error) {
 *   console.error('Image processing failed:', result.error);
 * } else {
 *   console.log('Generated variants:', result.data);
 * }
 */
export async function generateImageVariants(
    buffer: Buffer,
    filename: string
): Promise<ImageVariantsResponse> {
    try {
        // Validate buffer
        if (!buffer || buffer.length === 0) {
            return {
                data: null,
                error: {
                    message: 'Invalid or empty image buffer',
                    code: 'INVALID_BUFFER',
                },
            };
        }

        // Sanitize filename to prevent security issues
        const timestamp = Date.now();
        const baseFilename = sanitizeFilename(filename);

        // Generate the three variants in parallel
        const [thumbnail, preview, large] = await Promise.all([
            // Thumbnail: 300px wide
            sharp(buffer)
                .resize(300, null, {
                    withoutEnlargement: false,
                    fit: 'inside',
                })
                .webp({ quality: 80 })
                .toBuffer(),

            // Preview: 800px wide
            sharp(buffer)
                .resize(800, null, {
                    withoutEnlargement: false,
                    fit: 'inside',
                })
                .webp({ quality: 80 })
                .toBuffer(),

            // Large: 1600px wide
            sharp(buffer)
                .resize(1600, null, {
                    withoutEnlargement: false,
                    fit: 'inside',
                })
                .webp({ quality: 80 })
                .toBuffer(),
        ]);

        return {
            data: {
                thumbnail: {
                    buffer: thumbnail,
                    filename: `${timestamp}-${baseFilename}-thumb.webp`,
                },
                preview: {
                    buffer: preview,
                    filename: `${timestamp}-${baseFilename}-preview.webp`,
                },
                large: {
                    buffer: large,
                    filename: `${timestamp}-${baseFilename}-large.webp`,
                },
            },
            error: null,
        };
    } catch (error) {
        return {
            data: null,
            error: {
                message:
                    error instanceof Error
                        ? `Failed to process image: ${error.message}`
                        : 'Failed to process image: Unknown error',
                code: 'PROCESSING_ERROR',
            },
        };
    }
}
