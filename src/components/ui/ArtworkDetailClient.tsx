'use client';

/**
 * ArtworkDetailClient Component (Shared Base)
 *
 * Client-side interactive component for artwork detail pages (Gallery and Shoppe).
 * Handles image display, lightbox state, and user interactions.
 *
 * Features:
 * - Displays 800px image for main view (image_url)
 * - Opens lightbox with 1600px image on click (image_large_url)
 * - Visual affordances: "Click to enlarge" text hint + zoom icon overlay
 * - Keyboard navigation: Enter/Space keys to open lightbox
 * - Accessibility: ARIA attributes, focus indicators, WCAG AA compliant
 */

import { useState } from 'react';
import Image from 'next/image';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import type { Database } from '@/types/database';
import {
    ZOOM_ICON_SIZE,
    OVERLAY_OPACITY,
    ICON_BACKGROUND,
    FOCUS_RING,
    KEYBOARD_TRIGGER_KEYS,
} from './artworkDetailConstants';

type ArtworkRow = Database['public']['Tables']['artwork']['Row'];

interface ArtworkDetailClientProps {
    /** The artwork record to display with image URLs and metadata */
    artwork: ArtworkRow;
}

/**
 * Gets the appropriate alt text for an artwork image.
 * Prefers explicit alt_text, falls back to title for accessibility.
 *
 * @param artwork - The artwork record
 * @returns Alt text string for image accessibility
 */
function getArtworkAltText(artwork: ArtworkRow): string {
    return artwork.alt_text || artwork.title;
}

/**
 * Client-side interactive artwork detail component.
 *
 * Displays artwork with click-to-enlarge functionality using a lightbox modal.
 * Uses appropriate image resolutions:
 * - Main display: 800px (image_url) for optimal page load
 * - Lightbox: 1600px (image_large_url) for full-detail viewing
 *
 * Accessibility features:
 * - Keyboard navigation (Enter/Space keys)
 * - WCAG AA compliant focus indicators and color contrast
 * - ARIA attributes for screen readers
 * - Clear visual affordances (zoom icon overlay, text hint)
 *
 * @param props - Component props
 * @param props.artwork - The artwork record to display
 * @returns Interactive artwork detail component with lightbox
 */
export function ArtworkDetailClient({ artwork }: ArtworkDetailClientProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);

    // Image resolution strategy: 800px for main display, 1600px for lightbox
    const mainImageUrl = artwork.image_url;
    const lightboxImageUrl = artwork.image_large_url || artwork.image_url;
    const imageAlt = getArtworkAltText(artwork);

    /**
     * Handle keyboard navigation for opening lightbox.
     * Supports Enter and Space keys for accessibility (WCAG 2.1 requirement).
     *
     * @param e - Keyboard event
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (
            KEYBOARD_TRIGGER_KEYS.includes(
                e.key as (typeof KEYBOARD_TRIGGER_KEYS)[number]
            )
        ) {
            e.preventDefault();
            setLightboxOpen(true);
        }
    };

    return (
        <>
            {/* Image Container with Click-to-Enlarge Functionality */}
            <div className="flex flex-col items-center justify-center">
                {/* Main Image Display */}
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setLightboxOpen(true)}
                    onKeyDown={handleKeyDown}
                    className={`relative bg-gray-100 rounded border-2 border-black p-4 aspect-square w-full cursor-pointer group focus:outline-none ${FOCUS_RING}`}
                    aria-label="Click to view full-size image"
                >
                    {mainImageUrl ? (
                        <>
                            {/* Image */}
                            <div className="relative w-full h-full">
                                <Image
                                    src={mainImageUrl}
                                    alt={imageAlt}
                                    fill
                                    className="object-contain"
                                />
                            </div>

                            {/* Zoom Icon Overlay (visible on hover and focus) */}
                            <div
                                className={`absolute inset-0 flex items-center justify-center ${OVERLAY_OPACITY} opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200`}
                            >
                                <div
                                    className={`${ICON_BACKGROUND} rounded-full p-4`}
                                >
                                    {/* Magnifying Glass Icon */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className={`${ZOOM_ICON_SIZE} text-black`}
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-gray-400 text-center">
                            No image available
                        </div>
                    )}
                </div>

                {/* "Click image to enlarge" Text Hint (always visible, WCAG AA compliant) */}
                {mainImageUrl && (
                    <p className="mt-4 text-sm text-gray-700 font-semibold text-center">
                        Click image to enlarge
                    </p>
                )}
            </div>

            {/* Lightbox Component */}
            {lightboxImageUrl && (
                <ImageLightbox
                    isOpen={lightboxOpen}
                    onClose={() => setLightboxOpen(false)}
                    imageSrc={lightboxImageUrl}
                    imageAlt={imageAlt}
                    imageTitle={artwork.title}
                />
            )}
        </>
    );
}
