/**
 * Error Logging Utility
 *
 * This module provides a consistent logging interface for the application.
 * It handles logging differently in development vs. production environments.
 *
 * Development:
 * - Logs all errors to console with full details
 * - Includes stack traces
 * - Logs request/response details
 *
 * Production:
 * - Logs minimal info to console (visible in Vercel logs)
 * - Avoids logging sensitive data
 * - Includes error digests for tracking
 *
 * Future: Can be extended to integrate with error monitoring services
 * like Sentry, LogRocket, or Datadog.
 */

import type { ErrorType } from './user-friendly';

/**
 * Context information for error logs
 */
export interface ErrorContext {
    /** Where the error occurred (e.g., 'api/checkout', 'middleware', 'webhook') */
    location: string;
    /** The action being performed when the error occurred */
    action: string;
    /** User ID if available (should not include PII) */
    userId?: string;
    /** Request ID or trace ID for tracking */
    requestId?: string;
    /** Additional context data (should not include sensitive info) */
    metadata?: Record<string, unknown>;
}

/**
 * Log an error with context
 *
 * @param error - The error object or message
 * @param context - Additional context about where and when the error occurred
 * @param errorType - Optional error type classification
 *
 * @example
 * ```typescript
 * try {
 *   await processPayment(paymentData);
 * } catch (error) {
 *   logError(error, {
 *     location: 'api/checkout',
 *     action: 'processPayment',
 *     userId: session.userId,
 *     metadata: { amount: paymentData.amount }
 *   }, 'PAYMENT_ERROR');
 * }
 * ```
 */
export function logError(
    error: Error | unknown,
    context: ErrorContext,
    errorType?: ErrorType
): void {
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Build log message
    const logMessage = `[${context.location}] ${context.action} failed`;

    if (isDevelopment) {
        // Development: Log full details
        console.error('═══════════════════════════════════════════');
        console.error('ERROR:', logMessage);
        if (errorType) {
            console.error('Type:', errorType);
        }
        console.error('Context:', {
            location: context.location,
            action: context.action,
            userId: context.userId,
            requestId: context.requestId,
            metadata: context.metadata,
        });
        if (error instanceof Error) {
            console.error('Error:', error.message);
            console.error('Stack:', error.stack);
        } else {
            console.error('Error:', error);
        }
        console.error('═══════════════════════════════════════════');
    } else {
        // Production: Log minimal info
        console.error(logMessage, {
            type: errorType,
            location: context.location,
            action: context.action,
            requestId: context.requestId,
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

/**
 * Log a warning (non-critical issue)
 *
 * @param message - The warning message
 * @param context - Additional context
 *
 * @example
 * ```typescript
 * logWarning('Webhook signature verification took longer than expected', {
 *   location: 'api/checkout/webhook',
 *   action: 'verifySignature',
 *   metadata: { duration: verificationTime }
 * });
 * ```
 */
export function logWarning(message: string, context: ErrorContext): void {
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDevelopment) {
        console.warn('⚠️  WARNING:', message);
        console.warn('Context:', context);
    } else {
        console.warn(`[${context.location}] ${message}`, {
            location: context.location,
            action: context.action,
            requestId: context.requestId,
        });
    }
}

/**
 * Log an informational message (important events)
 *
 * @param message - The info message
 * @param context - Additional context
 *
 * @example
 * ```typescript
 * logInfo('Payment processed successfully', {
 *   location: 'api/checkout/webhook',
 *   action: 'handlePaymentSuccess',
 *   metadata: { orderId, amount }
 * });
 * ```
 */
export function logInfo(message: string, context: ErrorContext): void {
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDevelopment) {
        console.info('ℹ️  INFO:', message);
        console.info('Context:', context);
    } else {
        console.log(`[${context.location}] ${message}`, {
            location: context.location,
            action: context.action,
            requestId: context.requestId,
        });
    }
}

/**
 * Sanitize data before logging to remove sensitive information
 *
 * @param data - The data to sanitize
 * @returns Sanitized data safe for logging
 *
 * @example
 * ```typescript
 * const sanitized = sanitizeForLogging({
 *   email: 'user@example.com',
 *   password: 'secret123',
 *   cardNumber: '4242424242424242'
 * });
 * // Returns: { email: '[REDACTED]', password: '[REDACTED]', cardNumber: '[REDACTED]' }
 * ```
 */
export function sanitizeForLogging(
    data: Record<string, unknown>
): Record<string, unknown> {
    const sensitiveKeys = [
        'password',
        'token',
        'secret',
        'apikey',
        'api_key',
        'authorization',
        'cardnumber',
        'card_number',
        'cvv',
        'cvc',
        'ssn',
        'social_security',
    ];

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeForLogging(
                value as Record<string, unknown>
            );
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}
