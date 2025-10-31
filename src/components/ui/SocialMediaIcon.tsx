'use client';

import Link from 'next/link';
import { useState } from 'react';

interface SocialMediaIconProps {
    title: string;
    handle: string;
    href: string;
    variant?: 'light' | 'dark';
}

export function SocialMediaIcon({
    title,
    handle,
    href,
    variant = 'dark',
}: SocialMediaIconProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    // Map social media platforms to their icon components
    const getIcon = (platform: string) => {
        const platformLower = platform.toLowerCase();

        if (platformLower.includes('instagram')) {
            return (
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="transition-transform duration-300"
                    style={{
                        transform: isFlipped ? 'scaleX(-1)' : 'scaleX(1)',
                    }}
                >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.646.069 4.85 0 3.204-.012 3.584-.07 4.85-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.015-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.322a1.44 1.44 0 110-2.881 1.44 1.44 0 010 2.881z" />
                </svg>
            );
        }

        // Default icon - can be extended for other platforms
        return (
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="transition-transform duration-300"
                style={{
                    transform: isFlipped ? 'scaleX(-1)' : 'scaleX(1)',
                }}
            >
                <circle cx="12" cy="12" r="10" />
            </svg>
        );
    };

    return (
        <Link
            href={href}
            target="_blank"
            className={`inline-flex items-center gap-2 transition-colors duration-300 ${
                variant === 'dark'
                    ? 'text-black hover:text-gray-600'
                    : 'text-white hover:text-gray-300'
            }`}
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
        >
            <span className="inline-block w-6 h-6 flex-shrink-0">
                {getIcon(title)}
            </span>
            <span className="text-sm font-medium">{handle}</span>
        </Link>
    );
}
