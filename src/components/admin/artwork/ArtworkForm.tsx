'use client';

import { useForm, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { artworkSchema, type ArtworkFormData } from '@/lib/validation/artwork';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import ImageUploader from '@/components/admin/ImageUploader';
import { InfoBalloon } from '@/components/ui/InfoBalloon';

/**
 * Converts an array of tags to a comma-separated string
 */
function tagsToString(tags: string[] | null | undefined): string {
    if (!tags || tags.length === 0) return '';
    return tags.join(', ');
}

/**
 * Converts a comma-separated string to an array of tags
 */
function stringToTags(str: string): string[] | null {
    if (!str || str.trim() === '') return null;
    return str
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
}

interface ArtworkFormProps {
    initialData?: Partial<ArtworkFormData>;
    onSubmit?: (data: ArtworkFormData) => Promise<void> | void;
}

// Form schema with tags as string instead of array
const formSchema = artworkSchema.extend({
    tags: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const fieldDescriptions = {
    title: 'The title of the artwork.',
    slug: 'The URL-friendly version of the title. No spaces allowed. Usually the title with spaces replaced by dashes and filler words removed.',
    description: 'A detailed description of the artwork.',
    price: 'The price of the artwork in dollars.',
    original_price: 'The original price of the artwork, if it is on sale.',
    sku: 'The Stock Keeping Unit for inventory tracking.',
    inventory_count: 'The number of items available for sale.',
    is_published: 'Whether the artwork is visible to the public.',
    is_featured:
        'Whether the artwork is featured on the home page. (Not currenltly used)',
    is_limited_edition: 'Whether the artwork is a limited edition.',
    medium: 'The materials used to create the artwork (e.g., oil on canvas).',
    dimensions: 'The dimensions of the artwork (e.g., 24" x 36").',
    year_created: 'The year the artwork was created.',
    display_order: 'The order in which the artwork appears in lists.',
    alt_text: 'Descriptive text for screen readers and search engines.',
    seo_title: 'A custom title for search engine results.',
    seo_description: 'A custom description for search engine results.',
    tags: 'A comma-separated list of tags for categorization.',
};

export default function ArtworkForm({
    initialData,
    onSubmit,
}: ArtworkFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [imageUrls, setImageUrls] = useState<{
        image_thumbnail_url?: string;
        image_url?: string;
        image_large_url?: string;
    }>({
        image_thumbnail_url: initialData?.image_thumbnail_url || undefined,
        image_url: initialData?.image_url || undefined,
        image_large_url: initialData?.image_large_url || undefined,
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title || '',
            slug: initialData?.slug || '',
            description: initialData?.description || '',
            price: initialData?.price || '',
            original_price: initialData?.original_price || '',
            sku: initialData?.sku || '',
            inventory_count: initialData?.inventory_count || 0,
            is_published: initialData?.is_published || false,
            is_featured: initialData?.is_featured || false,
            is_limited_edition: initialData?.is_limited_edition || false,
            medium: initialData?.medium || '',
            dimensions: initialData?.dimensions || '',
            year_created: initialData?.year_created || new Date().getFullYear(),
            display_order: initialData?.display_order || 0,
            alt_text: initialData?.alt_text || '',
            seo_title: initialData?.seo_title || '',
            seo_description: initialData?.seo_description || '',
            tags: tagsToString(initialData?.tags),
        },
    });

    const handleFormSubmit = async (formData: FieldValues) => {
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            if (onSubmit) {
                // Convert tags string to array and include image URLs
                const data = formData as FormValues;
                const submissionData: ArtworkFormData = {
                    ...data,
                    tags: stringToTags(data.tags || ''),
                    ...imageUrls, // Include uploaded image URLs
                };
                await onSubmit(submissionData);
            }
        } catch (error) {
            setSubmitError(
                error instanceof Error ? error.message : 'An error occurred'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-6 bg-white p-6 rounded-lg shadow"
        >
            {submitError && (
                <div className="p-4 text-red-500 bg-red-50 rounded-lg">
                    {submitError}
                </div>
            )}

            {/* Image Upload Section */}
            <div className="pb-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Artwork Image
                </h3>
                <ImageUploader
                    onUploadComplete={(urls) => setImageUrls(urls)}
                    existingImageUrl={
                        imageUrls.image_url ||
                        initialData?.image_url ||
                        undefined
                    }
                    maxSizeMB={10}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2 space-y-2">
                    <div className="flex items-center">
                        <label htmlFor="title" className="admin-label">
                            Title
                        </label>
                        <InfoBalloon text={fieldDescriptions.title} />
                    </div>
                    <input
                        id="title"
                        type="text"
                        {...register('title')}
                        className="admin-input"
                    />
                    {errors.title && (
                        <p className="admin-error">{errors.title.message}</p>
                    )}
                </div>

                <div className="md:col-span-2 space-y-2">
                    <div className="flex items-center">
                        <label htmlFor="slug" className="admin-label">
                            Slug
                        </label>
                        <InfoBalloon text={fieldDescriptions.slug} />
                    </div>
                    <input
                        id="slug"
                        type="text"
                        {...register('slug')}
                        className="admin-input"
                    />
                    {errors.slug && (
                        <p className="admin-error">{errors.slug.message}</p>
                    )}
                </div>

                <div className="md:col-span-2 space-y-2">
                    <div className="flex items-center">
                        <label htmlFor="description" className="admin-label">
                            Description
                        </label>
                        <InfoBalloon text={fieldDescriptions.description} />
                    </div>
                    <textarea
                        id="description"
                        rows={4}
                        {...register('description')}
                        className="admin-input"
                    />
                    {errors.description && (
                        <p className="admin-error">
                            {errors.description.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center">
                        <label htmlFor="price" className="admin-label">
                            Price
                        </label>
                        <InfoBalloon text={fieldDescriptions.price} />
                    </div>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            id="price"
                            type="text"
                            {...register('price', {
                                setValueAs: (v) => (v === '' ? '' : String(v)),
                            })}
                            className="admin-input !pl-6"
                            placeholder="0.00"
                        />
                    </div>
                    {errors.price && (
                        <p className="admin-error">{errors.price.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center">
                        <label htmlFor="original_price" className="admin-label">
                            Original Price
                        </label>
                        <InfoBalloon text={fieldDescriptions.original_price} />
                    </div>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            id="original_price"
                            type="text"
                            {...register('original_price', {
                                setValueAs: (v) =>
                                    v === ''
                                        ? ''
                                        : v === null
                                          ? null
                                          : String(v),
                            })}
                            className="admin-input !pl-6"
                            placeholder="0.00"
                        />
                    </div>
                    {errors.original_price && (
                        <p className="admin-error">
                            {errors.original_price.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center">
                        <label htmlFor="sku" className="admin-label">
                            SKU
                        </label>
                        <InfoBalloon text={fieldDescriptions.sku} />
                    </div>
                    <input
                        id="sku"
                        type="text"
                        {...register('sku')}
                        className="admin-input"
                    />
                    {errors.sku && (
                        <p className="admin-error">{errors.sku.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center">
                        <label
                            htmlFor="inventory_count"
                            className="admin-label"
                        >
                            Inventory Count
                        </label>
                        <InfoBalloon text={fieldDescriptions.inventory_count} />
                    </div>
                    <input
                        id="inventory_count"
                        type="number"
                        {...register('inventory_count', {
                            valueAsNumber: true,
                        })}
                        className="admin-input"
                    />
                    {errors.inventory_count && (
                        <p className="admin-error">
                            {errors.inventory_count.message}
                        </p>
                    )}
                </div>

                <div className="md:col-span-2 space-y-2">
                    <div className="flex items-center">
                        <label htmlFor="medium" className="admin-label">
                            Medium
                        </label>
                        <InfoBalloon text={fieldDescriptions.medium} />
                    </div>
                    <input
                        id="medium"
                        type="text"
                        {...register('medium')}
                        className="admin-input"
                    />
                </div>

                <div className="md:col-span-2 space-y-2">
                    <div className="flex items-center">
                        <label htmlFor="dimensions" className="admin-label">
                            Dimensions
                        </label>
                        <InfoBalloon text={fieldDescriptions.dimensions} />
                    </div>
                    <input
                        id="dimensions"
                        type="text"
                        {...register('dimensions')}
                        className="admin-input"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center">
                        <label htmlFor="year_created" className="admin-label">
                            Year Created
                        </label>
                        <InfoBalloon text={fieldDescriptions.year_created} />
                    </div>
                    <input
                        id="year_created"
                        type="number"
                        {...register('year_created', { valueAsNumber: true })}
                        className="admin-input"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center">
                        <label htmlFor="display_order" className="admin-label">
                            Display Order
                        </label>
                        <InfoBalloon text={fieldDescriptions.display_order} />
                    </div>
                    <input
                        id="display_order"
                        type="number"
                        {...register('display_order', { valueAsNumber: true })}
                        className="admin-input"
                    />
                </div>
            </div>

            <div className="space-y-4 border-t border-gray-200 pt-4">
                <div className="flex items-center">
                    <input
                        id="is_published"
                        type="checkbox"
                        {...register('is_published')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <div className="flex items-center ml-2">
                        <label
                            htmlFor="is_published"
                            className="block text-sm font-medium text-gray-900"
                        >
                            Published
                        </label>
                        <InfoBalloon text={fieldDescriptions.is_published} />
                    </div>
                </div>

                <div className="flex items-center">
                    <input
                        id="is_featured"
                        type="checkbox"
                        {...register('is_featured')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <div className="flex items-center ml-2">
                        <label
                            htmlFor="is_featured"
                            className="block text-sm font-medium text-gray-900"
                        >
                            Featured
                        </label>
                        <InfoBalloon text={fieldDescriptions.is_featured} />
                    </div>
                </div>

                <div className="flex items-center">
                    <input
                        id="is_limited_edition"
                        type="checkbox"
                        {...register('is_limited_edition')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <div className="flex items-center ml-2">
                        <label
                            htmlFor="is_limited_edition"
                            className="block text-sm font-medium text-gray-900"
                        >
                            Limited Edition
                        </label>
                        <InfoBalloon
                            text={fieldDescriptions.is_limited_edition}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 border-t border-gray-200 pt-6">
                <div className="col-span-2 space-y-2">
                    <div className="flex items-center">
                        <label htmlFor="alt_text" className="admin-label">
                            Alt Text
                        </label>
                        <InfoBalloon text={fieldDescriptions.alt_text} />
                    </div>
                    <input
                        id="alt_text"
                        type="text"
                        {...register('alt_text')}
                        className="admin-input"
                        placeholder="Descriptive text for screen readers"
                    />
                    {errors.alt_text && (
                        <p className="admin-error">{errors.alt_text.message}</p>
                    )}
                </div>

                <div className="col-span-2 space-y-2">
                    <div className="flex items-center">
                        <label htmlFor="tags" className="admin-label">
                            Tags
                        </label>
                        <InfoBalloon text={fieldDescriptions.tags} />
                    </div>
                    <input
                        id="tags"
                        type="text"
                        {...register('tags')}
                        className="admin-input"
                        placeholder="Enter tags separated by commas"
                    />
                    {errors.tags && (
                        <p className="admin-error">{errors.tags.message}</p>
                    )}
                </div>

                <div className="col-span-2 space-y-2">
                    <div className="flex items-center">
                        <label htmlFor="seo_title" className="admin-label">
                            SEO Title
                        </label>
                        <InfoBalloon text={fieldDescriptions.seo_title} />
                    </div>
                    <input
                        id="seo_title"
                        type="text"
                        {...register('seo_title')}
                        className="admin-input"
                    />
                    {errors.seo_title && (
                        <p className="admin-error">
                            {errors.seo_title.message}
                        </p>
                    )}
                </div>

                <div className="col-span-2 space-y-2">
                    <div className="flex items-center">
                        <label
                            htmlFor="seo_description"
                            className="admin-label"
                        >
                            SEO Description
                        </label>
                        <InfoBalloon text={fieldDescriptions.seo_description} />
                    </div>
                    <textarea
                        id="seo_description"
                        rows={3}
                        {...register('seo_description')}
                        className="admin-input"
                    />
                    {errors.seo_description && (
                        <p className="admin-error">
                            {errors.seo_description.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <Link
                    href="/admin/artwork"
                    className="text-sm text-gray-600 hover:text-gray-900"
                >
                    ← Back to Artwork List
                </Link>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Artwork'}
                    </button>
                </div>
            </div>
        </form>
    );
}
