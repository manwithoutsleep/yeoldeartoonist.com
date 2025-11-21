'use client';

import { useForm, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { artworkSchema, type ArtworkFormData } from '@/lib/validation/artwork';
import { useState } from 'react';

interface ArtworkFormProps {
    initialData?: Partial<ArtworkFormData>;
    onSubmit?: (data: ArtworkFormData) => Promise<void> | void;
}

export default function ArtworkForm({
    initialData,
    onSubmit,
}: ArtworkFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ArtworkFormData>({
        resolver: zodResolver(artworkSchema),
        defaultValues: {
            title: '',
            slug: '',
            description: '',
            price: '',
            inventory_count: 0,
            is_published: false,
            is_featured: false,
            is_limited_edition: false,
            medium: '',
            dimensions: '',
            year_created: new Date().getFullYear(),
            display_order: 0,
            ...initialData,
        },
    });

    const handleFormSubmit = async (data: FieldValues) => {
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            if (onSubmit) {
                await onSubmit(data as ArtworkFormData);
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

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        {...register('title')}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.title && (
                        <p className="text-sm text-red-600">
                            {errors.title.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="slug"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Slug
                    </label>
                    <input
                        id="slug"
                        type="text"
                        {...register('slug')}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.slug && (
                        <p className="text-sm text-red-600">
                            {errors.slug.message}
                        </p>
                    )}
                </div>

                <div className="col-span-2 space-y-2">
                    <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Description
                    </label>
                    <textarea
                        id="description"
                        rows={4}
                        {...register('description')}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.description && (
                        <p className="text-sm text-red-600">
                            {errors.description.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Price
                    </label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            id="price"
                            type="text"
                            {...register('price')}
                            className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="0.00"
                        />
                    </div>
                    {errors.price && (
                        <p className="text-sm text-red-600">
                            {errors.price.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="inventory_count"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Inventory Count
                    </label>
                    <input
                        id="inventory_count"
                        type="number"
                        {...register('inventory_count', {
                            valueAsNumber: true,
                        })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.inventory_count && (
                        <p className="text-sm text-red-600">
                            {errors.inventory_count.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="medium"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Medium
                    </label>
                    <input
                        id="medium"
                        type="text"
                        {...register('medium')}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="dimensions"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Dimensions
                    </label>
                    <input
                        id="dimensions"
                        type="text"
                        {...register('dimensions')}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="year_created"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Year Created
                    </label>
                    <input
                        id="year_created"
                        type="number"
                        {...register('year_created', { valueAsNumber: true })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="display_order"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Display Order
                    </label>
                    <input
                        id="display_order"
                        type="number"
                        {...register('display_order', { valueAsNumber: true })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                    <label
                        htmlFor="is_published"
                        className="ml-2 block text-sm text-gray-900"
                    >
                        Published (visible to public)
                    </label>
                </div>

                <div className="flex items-center">
                    <input
                        id="is_featured"
                        type="checkbox"
                        {...register('is_featured')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                        htmlFor="is_featured"
                        className="ml-2 block text-sm text-gray-900"
                    >
                        Featured (highlighted on home page)
                    </label>
                </div>

                <div className="flex items-center">
                    <input
                        id="is_limited_edition"
                        type="checkbox"
                        {...register('is_limited_edition')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                        htmlFor="is_limited_edition"
                        className="ml-2 block text-sm text-gray-900"
                    >
                        Limited Edition
                    </label>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {isSubmitting ? 'Saving...' : 'Save Artwork'}
                </button>
            </div>
        </form>
    );
}
