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

        // Strip extension and create base filename
        const timestamp = Date.now();
        const baseFilename = filename.replace(/\.[^.]+$/, '');

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
