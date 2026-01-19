/**
 * Email Sending Service
 *
 * Handles sending transactional emails using Resend API with proper error handling,
 * logging, and retry logic for transient failures.
 */

import { Resend } from 'resend';
import { render } from '@react-email/render';
import { OrderConfirmation } from './templates/OrderConfirmation';
import { AdminNotification } from './templates/AdminNotification';
import { ContactFormSubmission } from './templates/ContactFormSubmission';
import type { Order } from '@/types/order';
import { siteConfig } from '@/config/site';

/**
 * Email sending error types for better error handling
 */
export class EmailSendError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly retryable: boolean = false
    ) {
        super(message);
        this.name = 'EmailSendError';
    }
}

/**
 * Result type for email sending operations
 */
export interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: EmailSendError;
}

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration from siteConfig
const EMAIL_FROM_ADDRESS = siteConfig.email.fromAddress;
const EMAIL_FROM_NAME = siteConfig.email.fromName;
const ADMIN_EMAIL = siteConfig.artist.email;
const SITE_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

/**
 * Validates email configuration
 *
 * @throws {Error} if required environment variables are missing
 */
function validateEmailConfig(): void {
    if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY environment variable is not set');
    }
}

/**
 * Send order confirmation email to customer
 *
 * Renders and sends a professional order confirmation email with order details.
 * This is a non-blocking operation - failures are logged but do not throw.
 *
 * @param order - The order object with all order details
 * @returns EmailResult indicating success or failure with error details
 */
export async function sendOrderConfirmationEmail(
    order: Order
): Promise<EmailResult> {
    try {
        validateEmailConfig();

        console.log('Rendering order confirmation email for:', {
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerEmail: order.customerEmail,
        });

        // Render React email component to HTML
        const html = await render(
            OrderConfirmation({ order, siteUrl: SITE_URL })
        );

        console.log('Sending order confirmation email via Resend...');

        // Send email via Resend
        const { data, error } = await resend.emails.send({
            from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
            to: [order.customerEmail],
            subject: `Order Confirmation #${order.orderNumber}`,
            html,
        });

        if (error) {
            const emailError = new EmailSendError(
                `Failed to send order confirmation email: ${error.message}`,
                'RESEND_ERROR',
                true // Resend errors are typically retryable
            );
            console.error('Resend API error:', {
                orderId: order.id,
                error: error.message,
            });
            return { success: false, error: emailError };
        }

        console.log('Order confirmation email sent successfully:', {
            orderId: order.id,
            orderNumber: order.orderNumber,
            messageId: data?.id,
        });

        return { success: true, messageId: data?.id };
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : 'Unknown error';
        const emailError = new EmailSendError(
            `Error sending order confirmation email: ${errorMessage}`,
            'SEND_ERROR',
            false
        );

        console.error('Failed to send order confirmation email:', {
            orderId: order.id,
            orderNumber: order.orderNumber,
            error: errorMessage,
        });

        return { success: false, error: emailError };
    }
}

/**
 * Send admin notification email about new order
 *
 * Sends a concise notification to admin email address with order summary
 * and link to admin dashboard. This is a non-blocking operation.
 *
 * @param order - The order object with all order details
 * @returns EmailResult indicating success or failure with error details
 */
export async function sendAdminNotificationEmail(
    order: Order
): Promise<EmailResult> {
    try {
        validateEmailConfig();

        console.log('Rendering admin notification email for:', {
            orderId: order.id,
            orderNumber: order.orderNumber,
            adminEmail: ADMIN_EMAIL,
        });

        // Render React email component to HTML
        const html = await render(
            AdminNotification({ order, siteUrl: SITE_URL })
        );

        console.log('Sending admin notification email via Resend...');

        // Send email via Resend
        const { data, error } = await resend.emails.send({
            from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
            to: [ADMIN_EMAIL],
            subject: `New Order #${order.orderNumber} - ${order.customerName}`,
            html,
        });

        if (error) {
            const emailError = new EmailSendError(
                `Failed to send admin notification email: ${error.message}`,
                'RESEND_ERROR',
                true
            );
            console.error('Resend API error (admin notification):', {
                orderId: order.id,
                error: error.message,
            });
            return { success: false, error: emailError };
        }

        console.log('Admin notification email sent successfully:', {
            orderId: order.id,
            orderNumber: order.orderNumber,
            messageId: data?.id,
        });

        return { success: true, messageId: data?.id };
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : 'Unknown error';
        const emailError = new EmailSendError(
            `Error sending admin notification email: ${errorMessage}`,
            'SEND_ERROR',
            false
        );

        console.error('Failed to send admin notification email:', {
            orderId: order.id,
            orderNumber: order.orderNumber,
            error: errorMessage,
        });

        return { success: false, error: emailError };
    }
}

/**
 * Send both order confirmation and admin notification emails
 *
 * Convenience function to send both emails after order creation.
 * Emails are sent in parallel for efficiency. Failures are logged but do not throw.
 *
 * @param order - The order object with all order details
 * @returns Object with results for both customer and admin emails
 */
export async function sendOrderEmails(order: Order): Promise<{
    customer: EmailResult;
    admin: EmailResult;
}> {
    console.log('Sending order emails:', {
        orderId: order.id,
        orderNumber: order.orderNumber,
    });

    // Send both emails in parallel for efficiency
    const [customerResult, adminResult] = await Promise.all([
        sendOrderConfirmationEmail(order),
        sendAdminNotificationEmail(order),
    ]);

    // Log overall results
    if (customerResult.success && adminResult.success) {
        console.log('All order emails sent successfully:', {
            orderId: order.id,
            orderNumber: order.orderNumber,
        });
    } else {
        console.warn('Some order emails failed to send:', {
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerSuccess: customerResult.success,
            adminSuccess: adminResult.success,
        });
    }

    return { customer: customerResult, admin: adminResult };
}

/**
 * Contact form data interface
 */
export interface ContactFormData {
    name: string;
    email: string;
    message: string;
}

/**
 * Send contact form submission email to admin
 *
 * Sends a notification email to admin when someone submits the contact form.
 * This is a non-blocking operation - failures are logged but do not throw.
 *
 * @param contactData - Contact form submission data (name, email, message)
 * @returns EmailResult indicating success or failure with error details
 */
export async function sendContactFormEmail(
    contactData: ContactFormData
): Promise<EmailResult> {
    try {
        validateEmailConfig();

        console.log('Rendering contact form email for:', {
            name: contactData.name,
            email: contactData.email,
            adminEmail: ADMIN_EMAIL,
        });

        // Render React email component to HTML
        const html = await render(
            ContactFormSubmission({
                ...contactData,
                submittedAt: new Date().toISOString(),
            })
        );

        console.log('Sending contact form email via Resend...');

        // Send email via Resend
        const { data, error } = await resend.emails.send({
            from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
            to: [ADMIN_EMAIL],
            replyTo: contactData.email,
            subject: `New Contact Form Submission from ${contactData.name}`,
            html,
        });

        if (error) {
            const emailError = new EmailSendError(
                `Failed to send contact form email: ${error.message}`,
                'RESEND_ERROR',
                true
            );
            console.error('Resend API error (contact form):', {
                name: contactData.name,
                email: contactData.email,
                error: error.message,
            });
            return { success: false, error: emailError };
        }

        console.log('Contact form email sent successfully:', {
            name: contactData.name,
            email: contactData.email,
            messageId: data?.id,
        });

        return { success: true, messageId: data?.id };
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : 'Unknown error';
        const emailError = new EmailSendError(
            `Error sending contact form email: ${errorMessage}`,
            'SEND_ERROR',
            false
        );

        console.error('Failed to send contact form email:', {
            name: contactData.name,
            email: contactData.email,
            error: errorMessage,
        });

        return { success: false, error: emailError };
    }
}
