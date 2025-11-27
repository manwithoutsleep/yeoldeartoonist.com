'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { ProjectRow } from '@/lib/db/admin/projects';
import { deleteProjectAction } from '@/app/admin/projects/actions';
import { useState } from 'react';

interface ProjectListProps {
    projects: ProjectRow[];
}

export default function ProjectList({ projects }: ProjectListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) {
            return;
        }

        setDeletingId(id);
        try {
            await deleteProjectAction(id);
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : 'Failed to delete project'
            );
            setDeletingId(null);
        }
    };

    if (!projects || projects.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
                <p>
                    No projects found. Create your first project to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                        >
                            Image
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                        >
                            Title
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                        >
                            Status
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                        >
                            Progress
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                        >
                            Published
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {projects.map((project) => (
                        <tr key={project.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="relative w-12 h-12">
                                    {project.image_url ? (
                                        <Image
                                            src={project.image_url}
                                            alt={project.title}
                                            fill
                                            className="object-cover rounded"
                                            sizes="48px"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded text-gray-400 text-xs">
                                            No Img
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                    {project.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {project.slug}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                    className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                        project.status === 'active'
                                            ? 'text-green-800 bg-green-100'
                                            : project.status === 'completed'
                                              ? 'text-blue-800 bg-blue-100'
                                              : project.status === 'planning'
                                                ? 'text-yellow-800 bg-yellow-100'
                                                : 'text-gray-800 bg-gray-100'
                                    }`}
                                >
                                    {project.status.charAt(0).toUpperCase() +
                                        project.status.slice(1)}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    {project.progress_percentage}%
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                    className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                        project.is_published
                                            ? 'text-green-800 bg-green-100'
                                            : 'text-yellow-800 bg-yellow-100'
                                    }`}
                                >
                                    {project.is_published
                                        ? 'Published'
                                        : 'Draft'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                <Link
                                    href={`/admin/projects/${project.id}/edit`}
                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                >
                                    Edit
                                </Link>
                                <button
                                    type="button"
                                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                    aria-label={`Delete ${project.title}`}
                                    disabled={deletingId === project.id}
                                    onClick={() =>
                                        handleDelete(project.id, project.title)
                                    }
                                >
                                    {deletingId === project.id
                                        ? 'Deleting...'
                                        : 'Delete'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
