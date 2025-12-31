/**
 * Tests for email sending service
 *
 * These tests verify:
 * - Email service functions are properly exported
 * - Functions have correct signatures
 * - Error handling works correctly
 * - Email configuration validation
 */

import {
    sendOrderConfirmationEmail,
    sendAdminNotificationEmail,
    sendOrderEmails,
    EmailSendError,
} from '@/lib/email/send';
import type { Order } from '@/types/order';

// Mock order data for testing
const mockOrder: Order = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    orderNumber: 'ORD-20250101-ABCD',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    shippingAddress: {
        line1: '123 Main St',
        line2: 'Apt 4B',
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
        country: 'US',
    },
    billingAddress: {
        line1: '123 Main St',
        line2: 'Apt 4B',
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
        country: 'US',
    },
    orderNotes: 'Please handle with care',
    subtotal: 100.0,
    shippingCost: 10.0,
    taxAmount: 8.25,
    total: 118.25,
    status: 'paid',
    paymentStatus: 'succeeded',
    paymentIntentId: 'pi_test_12345',
    items: [
        {
            id: 'item-1',
            artworkId: 'artwork-1',
            quantity: 2,
            priceAtPurchase: 50.0,
            lineSubtotal: 100.0,
            title: 'Test Artwork',
            imageUrl: 'https://example.com/image.jpg',
        },
    ],
    createdAt: '2025-01-01T12:00:00Z',
    updatedAt: '2025-01-01T12:00:00Z',
};

describe('Email Service', () => {
    describe('function exports', () => {
        it('should export sendOrderConfirmationEmail as a function', () => {
            expect(typeof sendOrderConfirmationEmail).toBe('function');
        });

        it('should export sendAdminNotificationEmail as a function', () => {
            expect(typeof sendAdminNotificationEmail).toBe('function');
        });

        it('should export sendOrderEmails as a function', () => {
            expect(typeof sendOrderEmails).toBe('function');
        });

        it('should export EmailSendError as a class', () => {
            expect(typeof EmailSendError).toBe('function');
            expect(EmailSendError.prototype).toBeInstanceOf(Error);
        });
    });

    describe('function signatures', () => {
        it('sendOrderConfirmationEmail should accept an order parameter', () => {
            expect(sendOrderConfirmationEmail.length).toBe(1);
        });

        it('sendAdminNotificationEmail should accept an order parameter', () => {
            expect(sendAdminNotificationEmail.length).toBe(1);
        });

        it('sendOrderEmails should accept an order parameter', () => {
            expect(sendOrderEmails.length).toBe(1);
        });
    });

    describe('return types', () => {
        it('sendOrderConfirmationEmail should return a Promise', () => {
            const result = sendOrderConfirmationEmail(mockOrder);
            expect(result).toBeInstanceOf(Promise);
        });

        it('sendAdminNotificationEmail should return a Promise', () => {
            const result = sendAdminNotificationEmail(mockOrder);
            expect(result).toBeInstanceOf(Promise);
        });

        it('sendOrderEmails should return a Promise', () => {
            const result = sendOrderEmails(mockOrder);
            expect(result).toBeInstanceOf(Promise);
        });
    });

    describe('EmailSendError', () => {
        it('should create an error with correct properties', () => {
            const error = new EmailSendError('Test error', 'TEST_ERROR', true);
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Test error');
            expect(error.code).toBe('TEST_ERROR');
            expect(error.retryable).toBe(true);
            expect(error.name).toBe('EmailSendError');
        });

        it('should default retryable to false if not provided', () => {
            const error = new EmailSendError('Test error', 'TEST_ERROR');
            expect(error.retryable).toBe(false);
        });
    });

    describe('error handling', () => {
        const originalEnv = process.env;

        beforeEach(() => {
            // Reset environment before each test
            process.env = { ...originalEnv };
        });

        afterAll(() => {
            // Restore original environment after all tests
            process.env = originalEnv;
        });

        it('should handle missing RESEND_API_KEY gracefully', async () => {
            // Remove API key to simulate missing configuration
            delete process.env.RESEND_API_KEY;

            const result = await sendOrderConfirmationEmail(mockOrder);

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error?.message).toContain('RESEND_API_KEY');
        });

        it('should handle missing ADMIN_EMAIL gracefully', async () => {
            // Set required API key but remove admin email
            process.env.RESEND_API_KEY = 'test-key';
            delete process.env.ADMIN_EMAIL;

            const result = await sendAdminNotificationEmail(mockOrder);

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error?.code).toBe('CONFIG_ERROR');
        });

        it('sendOrderEmails should return results for both emails', async () => {
            const result = await sendOrderEmails(mockOrder);

            expect(result).toHaveProperty('customer');
            expect(result).toHaveProperty('admin');
            expect(result.customer).toHaveProperty('success');
            expect(result.admin).toHaveProperty('success');
        });
    });
});
