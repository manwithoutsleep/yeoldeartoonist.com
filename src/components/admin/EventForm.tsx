'use client';

import { useForm, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventSchema, type EventFormData } from '@/lib/validation/events';
import { useState } from 'react';
import Link from 'next/link';
import ImageUploader from '@/components/admin/ImageUploader';
import { z } from 'zod';

// Use the input type which has all fields as optional before defaults are applied
type EventFormInput = z.input<typeof eventSchema>;

interface EventFormProps {
    initialData?: Partial<EventFormData>;
    onSubmit?: (data: EventFormData) => Promise<void> | void;
}

export default function EventForm({ initialData, onSubmit }: EventFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | undefined>(
        initialData?.image_url || undefined
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<EventFormInput>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            title: initialData?.title || '',
            slug: initialData?.slug || '',
            description: initialData?.description || '',
            start_date: initialData?.start_date || '',
            end_date: initialData?.end_date || '',
            location: initialData?.location || '',
            venue_name: initialData?.venue_name || '',
            booth_number: initialData?.booth_number || '',
            convention_url: initialData?.convention_url || '',
            is_published: initialData?.is_published || false,
        },
    });

    const handleFormSubmit = async (formData: FieldValues) => {
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            if (onSubmit) {
                const submissionData: EventFormData = {
                    ...(formData as EventFormData),
                    image_url: imageUrl || null,
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
                    Event Image
                </h3>
                <ImageUploader
                    onUploadComplete={(urls) => setImageUrl(urls.image_url)}
                    existingImageUrl={imageUrl}
                    maxSizeMB={10}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Title */}
                <div className="md:col-span-2 space-y-2">
                    <label htmlFor="title" className="admin-label">
                        Title
                    </label>
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

                {/* Slug */}
                <div className="md:col-span-2 space-y-2">
                    <label htmlFor="slug" className="admin-label">
                        Slug
                    </label>
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

                {/* Description */}
                <div className="md:col-span-2 space-y-2">
                    <label htmlFor="description" className="admin-label">
                        Description
                    </label>
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

                {/* Start Date */}
                <div className="space-y-2">
                    <label htmlFor="start_date" className="admin-label">
                        Start Date
                    </label>
                    <input
                        id="start_date"
                        type="date"
                        {...register('start_date')}
                        className="admin-input"
                    />
                    {errors.start_date && (
                        <p className="admin-error">
                            {errors.start_date.message}
                        </p>
                    )}
                </div>

                {/* End Date */}
                <div className="space-y-2">
                    <label htmlFor="end_date" className="admin-label">
                        End Date
                    </label>
                    <input
                        id="end_date"
                        type="date"
                        {...register('end_date')}
                        className="admin-input"
                    />
                    {errors.end_date && (
                        <p className="admin-error">{errors.end_date.message}</p>
                    )}
                </div>

                {/* Location */}
                <div className="md:col-span-2 space-y-2">
                    <label htmlFor="location" className="admin-label">
                        Location
                    </label>
                    <input
                        id="location"
                        type="text"
                        {...register('location')}
                        className="admin-input"
                    />
                    {errors.location && (
                        <p className="admin-error">{errors.location.message}</p>
                    )}
                </div>

                {/* Venue Name */}
                <div className="space-y-2">
                    <label htmlFor="venue_name" className="admin-label">
                        Venue Name
                    </label>
                    <input
                        id="venue_name"
                        type="text"
                        {...register('venue_name')}
                        className="admin-input"
                    />
                    {errors.venue_name && (
                        <p className="admin-error">
                            {errors.venue_name.message}
                        </p>
                    )}
                </div>

                {/* Booth Number */}
                <div className="space-y-2">
                    <label htmlFor="booth_number" className="admin-label">
                        Booth Number
                    </label>
                    <input
                        id="booth_number"
                        type="text"
                        {...register('booth_number')}
                        className="admin-input"
                    />
                    {errors.booth_number && (
                        <p className="admin-error">
                            {errors.booth_number.message}
                        </p>
                    )}
                </div>

                {/* Convention URL */}
                <div className="md:col-span-2 space-y-2">
                    <label htmlFor="convention_url" className="admin-label">
                        Convention URL
                    </label>
                    <input
                        id="convention_url"
                        type="url"
                        {...register('convention_url')}
                        className="admin-input"
                        placeholder="https://"
                    />
                    {errors.convention_url && (
                        <p className="admin-error">
                            {errors.convention_url.message}
                        </p>
                    )}
                </div>

                {/* Published Status */}
                <div className="md:col-span-2 space-y-2">
                    <label className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            {...register('is_published')}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            Published
                        </span>
                    </label>
                    {errors.is_published && (
                        <p className="admin-error">
                            {errors.is_published.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {isSubmitting ? 'Saving...' : 'Save Event'}
                </button>
                <Link
                    href="/admin/events"
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
}
