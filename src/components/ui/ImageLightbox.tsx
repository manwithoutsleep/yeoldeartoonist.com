'use client';

/**
 * ImageLightbox Component
 *
 * Full-screen image viewer with modal overlay.
 *
 * Features:
 * - Dark overlay backdrop for better image viewing
 * - Full-size responsive image display
 * - Close via overlay click, Escape key, or close button
 * - Focus trap for accessibility
 * - Body scroll lock when open
 * - WCAG 2.1 AA compliant
 */

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

/**
 * Props for the ImageLightbox component
 */
export interface ImageLightboxProps {
    /** Whether the lightbox is currently open */
    isOpen: boolean;
    /** Callback function to close the lightbox */
    onClose: () => void;
    /** URL of the image to display in the lightbox */
    imageSrc: string;
    /** Alt text for the image (required for accessibility) */
    imageAlt: string;
    /** Optional title for the image (used for aria-labelledby) */
    imageTitle?: string;
}

/**
 * Constants for ID generation and focus management
 */
const RANDOM_PREFIX_LENGTH = 2; // Length of '0.' prefix to skip
const RANDOM_ID_LENGTH = 7; // Number of random characters to generate
const FOCUSABLE_ELEMENTS_SELECTOR =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function ImageLightbox({
    isOpen,
    onClose,
    imageSrc,
    imageAlt,
    imageTitle,
}: ImageLightboxProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    /**
     * Generate unique ID for aria-labelledby attribute.
     * Using useState initializer ensures ID remains stable across renders.
     */
    const [titleId] = useState(() => {
        const randomStr = Math.random()
            .toString(36)
            .substring(RANDOM_PREFIX_LENGTH);
        const randomId = randomStr.substring(0, RANDOM_ID_LENGTH);
        return `lightbox-title-${randomId}`;
    });

    /**
     * Effect: Handle Escape key to close lightbox
     * Listens for keydown events at document level when lightbox is open.
     */
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    /**
     * Effect: Implement focus trap within lightbox
     * Ensures keyboard navigation (Tab/Shift+Tab) stays within the dialog.
     * Focuses close button when lightbox opens for immediate keyboard access.
     */
    useEffect(() => {
        if (!isOpen || !dialogRef.current) return;

        const dialog = dialogRef.current;
        const focusableElements = dialog.querySelectorAll(
            FOCUSABLE_ELEMENTS_SELECTOR
        );

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
            focusableElements.length - 1
        ] as HTMLElement;

        // Focus close button when lightbox opens
        closeButtonRef.current?.focus();

        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement?.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement?.focus();
            }
        };

        dialog.addEventListener('keydown', handleTab);
        return () => dialog.removeEventListener('keydown', handleTab);
    }, [isOpen]);

    /**
     * Effect: Prevent body scroll when lightbox is open
     * Disables page scrolling to keep focus on lightbox content.
     * Restores original overflow style on cleanup.
     */
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    /**
     * Handle click on overlay background.
     * Only closes lightbox if clicking directly on overlay, not on dialog or image.
     */
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            onClick={handleOverlayClick}
            className="fixed inset-0 bg-black/80 z-40 flex items-center justify-center p-4"
        >
            {/* Lightbox Dialog */}
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={imageTitle ? titleId : undefined}
                aria-label={imageTitle ? undefined : imageAlt}
                className="relative max-w-7xl max-h-full w-full h-full flex flex-col items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button - positioned top-right with focus ring for accessibility */}
                <button
                    ref={closeButtonRef}
                    onClick={onClose}
                    aria-label="Close lightbox"
                    className="absolute top-4 right-4 z-10 p-2 text-white bg-black/50 hover:bg-black/70 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                >
                    {/* X icon - 24x24 SVG */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-6 h-6"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>

                {/* Image Title (visually hidden if no title provided) */}
                {imageTitle && (
                    <h2 id={titleId} className="sr-only">
                        {imageTitle}
                    </h2>
                )}

                {/* Image Container */}
                <div className="relative w-full h-full flex items-center justify-center">
                    <div className="relative w-full h-full">
                        <Image
                            src={imageSrc}
                            alt={imageAlt}
                            fill
                            className="object-contain"
                            sizes="100vw"
                            priority
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
