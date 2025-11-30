'use client';

import { useForm, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, type ProjectFormData } from '@/lib/validation/projects';
import { useState } from 'react';
import Link from 'next/link';
import ImageUploader from '@/components/admin/ImageUploader';
import { z } from 'zod';
import { InfoBalloon } from '@/components/ui/InfoBalloon';

// Use the input type which has all fields as optional before defaults are applied
type ProjectFormInput = z.input<typeof projectSchema>;

interface ProjectFormProps {
    initialData?: Partial<ProjectFormData>;
    onSubmit?: (data: ProjectFormData) => Promise<void> | void;
}

const fieldDescriptions = {
    title: 'The title of the project.',
    slug: 'The URL-friendly version of the title. Usually auto-generated from the title.',
    description: 'A detailed description of the project.',
    status: 'The current status of the project.',
    progress_percentage: 'The progress of the project, as a percentage.',
    expected_completion_date:
        'The estimated date of completion for the project.',
    is_published: 'Whether the project is visible to the public.',
    display_order: 'The order in which the project appears in lists.',
};

export default function ProjectForm({
    initialData,
    onSubmit,
}: ProjectFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | undefined>(
        initialData?.image_url || undefined
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProjectFormInput>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            title: initialData?.title || '',
            slug: initialData?.slug || '',
            description: initialData?.description || '',
            status: initialData?.status || 'planning',
            progress_percentage: initialData?.progress_percentage || 0,
            expected_completion_date:
                initialData?.expected_completion_date || null,
            is_published: initialData?.is_published || false,
            display_order: initialData?.display_order || 0,
        },
    });

    const handleFormSubmit = async (formData: FieldValues) => {
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            if (onSubmit) {
                const submissionData: ProjectFormData = {
                    ...(formData as ProjectFormData),
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
                    Project Image
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

                {/* Slug */}
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

                {/* Description */}
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

                {/* Status */}
                <div className="space-y-2">
                    <div className="flex items-center">
                        <label htmlFor="status" className="admin-label">
                            Status
                        </label>
                        <InfoBalloon text={fieldDescriptions.status} />
                    </div>
                    <select
                        id="status"
                        {...register('status')}
                        className="admin-input"
                    >
                        <option value="planning">Planning</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="archived">Archived</option>
                    </select>
                    {errors.status && (
                        <p className="admin-error">{errors.status.message}</p>
                    )}
                </div>

                {/* Progress Percentage */}
                <div className="space-y-2">
                    <div className="flex items-center">
                        <label
                            htmlFor="progress_percentage"
                            className="admin-label"
                        >
                            Progress (%)
                        </label>
                        <InfoBalloon
                            text={fieldDescriptions.progress_percentage}
                        />
                    </div>
                    <input
                        id="progress_percentage"
                        type="number"
                        min="0"
                        max="100"
                        {...register('progress_percentage', {
                            valueAsNumber: true,
                        })}
                        className="admin-input"
                    />
                    {errors.progress_percentage && (
                        <p className="admin-error">
                            {errors.progress_percentage.message}
                        </p>
                    )}
                </div>

                {/* Expected Completion Date */}
                <div className="space-y-2">
                    <div className="flex items-center">
                        <label
                            htmlFor="expected_completion_date"
                            className="admin-label"
                        >
                            Expected Completion Date
                        </label>
                        <InfoBalloon
                            text={fieldDescriptions.expected_completion_date}
                        />
                    </div>
                    <input
                        id="expected_completion_date"
                        type="date"
                        {...register('expected_completion_date')}
                        className="admin-input"
                    />
                    {errors.expected_completion_date && (
                        <p className="admin-error">
                            {errors.expected_completion_date.message}
                        </p>
                    )}
                </div>

                {/* Display Order */}
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
                    {errors.display_order && (
                        <p className="admin-error">
                            {errors.display_order.message}
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
                        <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-700">
                                Published
                            </span>
                            <InfoBalloon
                                text={fieldDescriptions.is_published}
                            />
                        </div>
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
                    {isSubmitting ? 'Saving...' : 'Save Project'}
                </button>
                <Link
                    href="/admin/projects"
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
}
