'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getAllProjects } from '@/lib/db/projects';
import { getUpcomingEvents } from '@/lib/db/events';
import type { Database } from '@/types/database';

/**
 * In The Works page - Display projects and upcoming events
 *
 * Features:
 * - White background with black text
 * - Projects section with title, description, image
 * - Events section with date range, location
 * - Upcoming events sorted first
 */

export default function InTheWorksPage() {
    const [projects, setProjects] = useState<
        Database['public']['Tables']['projects']['Row'][]
    >([]);
    const [events, setEvents] = useState<
        Database['public']['Tables']['events']['Row'][]
    >([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadContent = async () => {
            try {
                const [projectsRes, eventsRes] = await Promise.all([
                    getAllProjects(),
                    getUpcomingEvents(),
                ]);

                if (projectsRes.error) {
                    setError(projectsRes.error.message);
                } else if (projectsRes.data) {
                    setProjects(projectsRes.data);
                }

                if (eventsRes.error) {
                    setError(eventsRes.error.message);
                } else if (eventsRes.data) {
                    setEvents(eventsRes.data);
                }
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load projects and events'
                );
            } finally {
                setIsLoading(false);
            }
        };
        loadContent();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white text-black min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl font-semibold">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white text-black">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-5xl font-bold text-center mb-4">
                    In The Works
                </h1>
                <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                    Discover upcoming projects and convention appearances
                </p>

                {error && (
                    <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded mb-8">
                        <p>Error loading content: {error}</p>
                    </div>
                )}

                {/* Projects Section */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold mb-8 border-b-4 border-black pb-4">
                        Projects
                    </h2>

                    {projects.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">
                                No projects at the moment
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="border-2 border-black rounded overflow-hidden"
                                >
                                    {project.image_url && (
                                        <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                                            <Image
                                                src={project.image_url}
                                                alt={project.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="p-6">
                                        <h3 className="text-2xl font-bold mb-2">
                                            {project.title}
                                        </h3>

                                        <p className="text-gray-600 mb-4">
                                            {project.description}
                                        </p>

                                        {project.status && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-semibold">
                                                    Status:
                                                </span>
                                                <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded text-sm font-semibold capitalize">
                                                    {project.status.replace(
                                                        '_',
                                                        ' '
                                                    )}
                                                </span>
                                            </div>
                                        )}

                                        {project.expected_completion_date && (
                                            <p className="text-sm text-gray-600">
                                                <span className="font-semibold">
                                                    Expected completion:
                                                </span>{' '}
                                                {new Date(
                                                    project.expected_completion_date
                                                ).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Events Section */}
                <section>
                    <h2 className="text-3xl font-bold mb-8 border-b-4 border-black pb-4">
                        Upcoming Events
                    </h2>

                    {events.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">
                                No upcoming events at the moment
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {events.map((event) => (
                                <div
                                    key={event.id}
                                    className="border-2 border-black rounded overflow-hidden"
                                >
                                    {event.image_url && (
                                        <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                                            <Image
                                                src={event.image_url}
                                                alt={event.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="p-6">
                                        <h3 className="text-2xl font-bold mb-2">
                                            {event.title}
                                        </h3>

                                        {event.description && (
                                            <p className="text-gray-600 mb-4">
                                                {event.description}
                                            </p>
                                        )}

                                        <div className="space-y-2 text-sm border-t border-gray-300 pt-4">
                                            <div>
                                                <span className="font-semibold">
                                                    Dates:
                                                </span>{' '}
                                                {new Date(
                                                    event.start_date
                                                ).toLocaleDateString()}{' '}
                                                -{' '}
                                                {new Date(
                                                    event.end_date
                                                ).toLocaleDateString()}
                                            </div>

                                            <div>
                                                <span className="font-semibold">
                                                    Location:
                                                </span>{' '}
                                                {event.location}
                                            </div>

                                            {event.venue_name && (
                                                <div>
                                                    <span className="font-semibold">
                                                        Venue:
                                                    </span>{' '}
                                                    {event.venue_name}
                                                </div>
                                            )}

                                            {event.booth_number && (
                                                <div>
                                                    <span className="font-semibold">
                                                        Booth:
                                                    </span>{' '}
                                                    {event.booth_number}
                                                </div>
                                            )}

                                            {event.convention_url && (
                                                <div>
                                                    <a
                                                        href={
                                                            event.convention_url
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        Visit Event Website →
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
