/**
 * Contact Form API Route
 *
 * POST /api/contact
 *
 * Handles contact form submissions by:
 * - Validating form data server-side
 * - Sending email notification to admin
 * - Returning success to user (even if email fails - graceful degradation)
 *
 * This ensures a good user experience - if the email service is down,
 * the user still sees success (they can retry or email directly if needed).
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendContactFormEmail } from '@/lib/email/send';

/**
 * Zod schema for contact form validation
 *
 * Matches the validation on the client-side for consistency.
 */
const contactFormSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    email: z.string().email('Invalid email address'),
    message: z
        .string()
        .min(10, 'Message must be at least 10 characters')
        .max(5000, 'Message is too long'),
});

/**
 * POST handler for contact form submission
 *
 * @param request - Next.js request object
 * @returns JSON response with success status
 *
 * @example
 * ```typescript
 * // Request
 * POST /api/contact
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "message": "I would like to inquire about custom artwork."
 * }
 *
 * // Success Response (200)
 * {
 *   "success": true
 * }
 *
 * // Validation Error Response (400)
 * {
 *   "error": "Validation failed",
 *   "details": [...]
 * }
 * ```
 */
export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();

        // Validate with Zod schema
        const result = contactFormSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: result.error.issues,
                },
                { status: 400 }
            );
        }

        // Send email notification to admin
        const emailResult = await sendContactFormEmail(result.data);

        // Log failure but don't expose to user (graceful degradation)
        if (!emailResult.success) {
            console.error('Contact form email failed to send:', {
                name: result.data.name,
                email: result.data.email,
                error: emailResult.error?.message,
                code: emailResult.error?.code,
            });
            // Still return 200 to user - better UX than showing error
            // User can retry or contact directly if they don't hear back
        } else {
            console.log('Contact form email sent successfully:', {
                name: result.data.name,
                email: result.data.email,
                messageId: emailResult.messageId,
            });
        }

        // Always return success to user (graceful degradation)
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Contact form API error:', error);

        // Return generic error response
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET handler - reject GET requests
 *
 * Contact form only accepts POST requests.
 */
export async function GET() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
