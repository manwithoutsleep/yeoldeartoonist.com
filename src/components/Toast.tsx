'use client';

/**
 * Toast Component
 *
 * Renders toast notifications in a fixed overlay position.
 * Toasts appear at the top-center of the viewport and stack vertically.
 *
 * Features:
 * - Fixed positioning (always visible, regardless of scroll)
 * - Slide-in animation from top
 * - Auto-dismisses after timeout
 * - Manual dismiss via close button
 * - Multiple toasts stack vertically
 */

import { useToast } from '@/context/ToastContext';

export function Toast() {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2"
            role="region"
            aria-live="polite"
            aria-label="Notifications"
        >
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="bg-black text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-slide-in"
                    role="alert"
                >
                    <span className="flex-1 font-semibold">
                        {toast.message}
                    </span>
                    <button
                        type="button"
                        onClick={() => removeToast(toast.id)}
                        className="text-white hover:text-gray-300 transition-colors"
                        aria-label="Close notification"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
}
