/**
 * User-Friendly Error Messages
 *
 * This module maps technical error types to user-friendly messages.
 * It helps prevent exposing technical details to end users while
 * providing helpful, actionable feedback.
 *
 * Usage:
 * ```typescript
 * import { getUserFriendlyErrorMessage, ErrorType } from '@/lib/errors/user-friendly';
 *
 * const message = getUserFriendlyErrorMessage('DATABASE_ERROR');
 * // Returns: "We're having trouble loading this content. Please try again in a moment."
 * ```
 */

/**
 * Standard error types used throughout the application
 */
export type ErrorType =
    | 'DATABASE_ERROR'
    | 'DATABASE_TIMEOUT'
    | 'NETWORK_ERROR'
    | 'PAYMENT_ERROR'
    | 'PAYMENT_DECLINED'
    | 'VALIDATION_ERROR'
    | 'AUTHENTICATION_ERROR'
    | 'AUTHORIZATION_ERROR'
    | 'NOT_FOUND'
    | 'UPLOAD_ERROR'
    | 'EMAIL_ERROR'
    | 'WEBHOOK_ERROR'
    | 'RATE_LIMIT_ERROR'
    | 'UNKNOWN_ERROR';

/**
 * Map of error types to user-friendly messages
 */
const errorMessages: Record<ErrorType, string> = {
    DATABASE_ERROR:
        "We're having trouble loading this content. Please try again in a moment.",
    DATABASE_TIMEOUT:
        'The page is taking longer than expected to load. Please refresh the page.',
    NETWORK_ERROR: 'Please check your internet connection and try again.',
    PAYMENT_ERROR:
        "We couldn't process your payment. Please check your information and try again.",
    PAYMENT_DECLINED:
        'Your payment was declined. Please check your card details or try a different payment method.',
    VALIDATION_ERROR: 'Please check the information you entered and try again.',
    AUTHENTICATION_ERROR: 'Please log in to continue.',
    AUTHORIZATION_ERROR: "You don't have permission to access this resource.",
    NOT_FOUND: "The content you're looking for could not be found.",
    UPLOAD_ERROR:
        "We couldn't upload your file. Please check the file size and format.",
    EMAIL_ERROR: "We couldn't send the email. Please try again later.",
    WEBHOOK_ERROR:
        "We're having trouble processing this request. Please try again.",
    RATE_LIMIT_ERROR:
        "You're making requests too quickly. Please wait a moment and try again.",
    UNKNOWN_ERROR: 'Something went wrong. Please try again.',
};

/**
 * Get a user-friendly error message for a given error type
 *
 * @param errorType - The type of error that occurred
 * @returns A user-friendly error message
 */
export function getUserFriendlyErrorMessage(errorType: ErrorType): string {
    return errorMessages[errorType] || errorMessages.UNKNOWN_ERROR;
}

/**
 * Standard API error response format
 *
 * This type represents the structure of error responses from API routes.
 * All API routes should return errors in this format for consistency.
 */
export interface ApiErrorResponse {
    error: {
        /** User-friendly error message (safe to display to users) */
        message: string;
        /** Error code for debugging and client-side handling */
        code: ErrorType;
        /** Optional additional details (only included in development) */
        details?: unknown;
    };
}

/**
 * Create a standardized API error response
 *
 * @param errorType - The type of error that occurred
 * @param details - Optional additional details (only included in development)
 * @returns A standardized API error response object
 *
 * @example
 * ```typescript
 * // In an API route
 * return NextResponse.json(
 *   createApiErrorResponse('DATABASE_ERROR', error.message),
 *   { status: 500 }
 * );
 * ```
 */
export function createApiErrorResponse(
    errorType: ErrorType,
    details?: unknown
): ApiErrorResponse {
    const response: ApiErrorResponse = {
        error: {
            message: getUserFriendlyErrorMessage(errorType),
            code: errorType,
        },
    };

    // Only include details in development
    if (process.env.NODE_ENV === 'development' && details !== undefined) {
        response.error.details = details;
    }

    return response;
}

/**
 * Check if an object is an API error response
 *
 * @param obj - The object to check
 * @returns True if the object matches the API error response format
 */
export function isApiErrorResponse(obj: unknown): obj is ApiErrorResponse {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'error' in obj &&
        typeof (obj as { error: unknown }).error === 'object' &&
        (obj as { error: unknown }).error !== null &&
        'message' in (obj as { error: { message?: unknown } }).error &&
        'code' in (obj as { error: { code?: unknown } }).error
    );
}
