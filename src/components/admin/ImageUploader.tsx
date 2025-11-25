'use client';

import { useState, useRef, ChangeEvent } from 'react';

interface ImageUrls {
    image_thumbnail_url: string;
    image_url: string;
    image_large_url: string;
}

interface ImageUploaderProps {
    onUploadComplete: (urls: ImageUrls) => void;
    existingImageUrl?: string;
    maxSizeMB?: number;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DEFAULT_MAX_SIZE_MB = 10;

/**
 * ImageUploader component for admin interface
 *
 * Provides file selection, validation, preview, and upload functionality for images.
 * Uploads to `/api/admin/upload` which generates 3 WebP variants.
 *
 * @param onUploadComplete - Callback with URLs for thumbnail, preview, and large variants
 * @param existingImageUrl - Optional URL of existing image (for edit mode)
 * @param maxSizeMB - Maximum file size in MB (default: 10)
 *
 * Features:
 * - Client-side validation (file type and size)
 * - Image preview using object URL
 * - Upload progress indication
 * - Error handling with user-friendly messages
 * - Clear/reset functionality
 *
 * @example
 * <ImageUploader
 *   onUploadComplete={(urls) => setFormData({ ...formData, ...urls })}
 *   existingImageUrl={artwork?.image_url}
 *   maxSizeMB={10}
 * />
 */
export default function ImageUploader({
    onUploadComplete,
    existingImageUrl,
    maxSizeMB = DEFAULT_MAX_SIZE_MB,
}: ImageUploaderProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Validates file type and size before allowing selection
     */
    const validateFile = (file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.';
        }

        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return `File too large. Maximum size is ${maxSizeMB}MB.`;
        }

        return null;
    };

    /**
     * Handles file selection from input
     */
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setError(null);

        if (!file) {
            return;
        }

        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        // Set selected file and create preview
        setSelectedFile(file);
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
    };

    /**
     * Uploads the selected file to the API
     */
    const handleUpload = async () => {
        if (!selectedFile) {
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setError(null);

        try {
            // Create FormData for multipart upload
            const formData = new FormData();
            formData.append('file', selectedFile);

            // Simulate progress (since fetch doesn't support upload progress easily)
            setUploadProgress(30);

            const response = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            setUploadProgress(70);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();
            setUploadProgress(100);

            // Call the completion callback with URLs
            onUploadComplete({
                image_thumbnail_url: data.image_thumbnail_url,
                image_url: data.image_url,
                image_large_url: data.image_large_url,
            });

            // Clear preview after successful upload
            handleClear();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'An unexpected error occurred'
            );
            setUploadProgress(0);
        } finally {
            setIsUploading(false);
        }
    };

    /**
     * Clears the selected file and preview
     */
    const handleClear = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setError(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            {/* Existing image display (edit mode) */}
            {existingImageUrl && !previewUrl && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Image
                    </label>
                    {/* Suppress ESLint warning: Already optimized WebP image from
                    Supabase Storage, used only for preview in the upload form */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={existingImageUrl}
                        alt="Current image"
                        className="max-w-xs max-h-48 object-contain border border-gray-300 rounded"
                    />
                </div>
            )}

            {/* File input */}
            <div>
                <label
                    htmlFor="image-file-input"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Choose Image File
                </label>
                <input
                    id="image-file-input"
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_TYPES.join(',')}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    Choose File
                </button>
            </div>

            {/* Selected filename */}
            {selectedFile && (
                <div className="text-sm text-gray-600">
                    Selected:{' '}
                    <span className="font-medium">{selectedFile.name}</span>
                </div>
            )}

            {/* Preview image */}
            {previewUrl && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preview
                    </label>
                    {/* Suppress ESLint warning: Uses a blob URL from
                    URL.createObjectURL() which is a local browser object URL that
                    doesn't need Next.js optimization */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-xs max-h-48 object-contain border border-gray-300 rounded"
                    />
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                    {error}
                </div>
            )}

            {/* Upload progress */}
            {isUploading && (
                <div>
                    <div className="text-sm text-gray-600 mb-1">
                        Uploading... {uploadProgress}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                </button>

                {selectedFile && !isUploading && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}
