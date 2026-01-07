/**
 * Shared constants for artwork detail components (Gallery and Shoppe).
 *
 * These constants define visual affordances and keyboard navigation
 * for click-to-enlarge image functionality with lightbox modal.
 */

// Visual affordance constants
export const ZOOM_ICON_SIZE = 'w-12 h-12'; // 48x48px magnifying glass icon
export const OVERLAY_OPACITY = 'bg-black/50'; // 50% black overlay for hover state
export const ICON_BACKGROUND = 'bg-white/90'; // 90% white background for icon
export const FOCUS_RING =
    'focus:ring-4 focus:ring-blue-500 focus:ring-offset-2'; // WCAG AA compliant focus indicator

// Keyboard navigation keys
export const KEYBOARD_TRIGGER_KEYS = ['Enter', ' '] as const; // Space key requires literal space character
