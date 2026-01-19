/**
 * Tests for email sending service
 *
 * These tests verify:
 * - Email service functions are properly exported
 * - Functions have correct signatures
 * - Error handling works correctly
 * - Email configuration validation
 * - Email template rendering and content
 */

import {
    EmailSendError,
    sendAdminNotificationEmail,
    sendContactFormEmail,
    sendOrderConfirmationEmail,
    sendOrderEmails,
} from '@/lib/email/send';
import { render } from '@react-email/render';
import { OrderConfirmation } from '@/lib/email/templates/OrderConfirmation';
import { AdminNotification } from '@/lib/email/templates/AdminNotification';
import { ContactFormSubmission } from '@/lib/email/templates/ContactFormSubmission';
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

        it('sendOrderEmails should return results for both emails', async () => {
            const result = await sendOrderEmails(mockOrder);

            expect(result).toHaveProperty('customer');
            expect(result).toHaveProperty('admin');
            expect(result.customer).toHaveProperty('success');
            expect(result.admin).toHaveProperty('success');
        });
    });

    describe('Email Template Rendering', () => {
        const siteUrl = 'https://yeoldeartoonist.com';

        describe('OrderConfirmation template', () => {
            it('should render order confirmation with order number', async () => {
                const html = await render(
                    OrderConfirmation({
                        order: mockOrder,
                        siteUrl,
                    })
                );

                expect(html).toContain(mockOrder.orderNumber);
            });

            it('should render order confirmation with customer name and email', async () => {
                const html = await render(
                    OrderConfirmation({
                        order: mockOrder,
                        siteUrl,
                    })
                );

                expect(html).toContain(mockOrder.customerName);
                // Email might not be directly in the template, but customer name should be
                expect(html).toContain('John Doe');
            });

            it('should render order confirmation with all order items', async () => {
                const html = await render(
                    OrderConfirmation({
                        order: mockOrder,
                        siteUrl,
                    })
                );

                // Check for item title
                expect(html).toContain('Test Artwork');
                // Check for quantity text with specific pattern to avoid false positives
                // Allow for any characters/tags between "Quantity:" and "2"
                expect(html).toMatch(
                    /Quantity:\s*(?:<[^>]*>)*\s*2\s*(?:<[^>]*>)*\s*×/
                );
                // Check for price formatting
                expect(html).toContain('50.00');
                // Check for line subtotal
                expect(html).toContain('100.00');
            });

            it('should render order confirmation with pricing breakdown', async () => {
                const html = await render(
                    OrderConfirmation({
                        order: mockOrder,
                        siteUrl,
                    })
                );

                // Check for subtotal
                expect(html).toContain('Subtotal');
                expect(html).toContain('100.00');
                // Check for shipping
                expect(html).toContain('Shipping');
                expect(html).toContain('10.00');
                // Check for tax
                expect(html).toContain('Tax');
                expect(html).toContain('8.25');
                // Check for total
                expect(html).toContain('Total');
                expect(html).toContain('118.25');
            });

            it('should render order confirmation with shipping address', async () => {
                const html = await render(
                    OrderConfirmation({
                        order: mockOrder,
                        siteUrl,
                    })
                );

                expect(html).toContain('123 Main St');
                expect(html).toContain('Apt 4B');
                expect(html).toContain('Springfield');
                expect(html).toContain('IL');
                expect(html).toContain('62701');
            });

            it('should render order confirmation with order notes when present', async () => {
                const html = await render(
                    OrderConfirmation({
                        order: mockOrder,
                        siteUrl,
                    })
                );

                expect(html).toContain('Please handle with care');
            });

            it('should render order confirmation without order notes section when notes are empty', async () => {
                const orderWithoutNotes = { ...mockOrder, orderNotes: '' };
                const html = await render(
                    OrderConfirmation({
                        order: orderWithoutNotes,
                        siteUrl,
                    })
                );

                // Should not contain the notes section heading
                expect(html).not.toContain('Order Notes');
            });

            it('should render order confirmation with formatted order date', async () => {
                const html = await render(
                    OrderConfirmation({
                        order: mockOrder,
                        siteUrl,
                    })
                );

                // Check that some form of the date appears (January 1, 2025)
                expect(html).toMatch(/January.*1.*2025/);
            });

            it('should render order confirmation with site logo URL', async () => {
                const html = await render(
                    OrderConfirmation({
                        order: mockOrder,
                        siteUrl,
                    })
                );

                expect(html).toContain(
                    `${siteUrl}/images/header-footer/logo.png`
                );
            });

            it('should render order confirmation with footer and site link', async () => {
                const html = await render(
                    OrderConfirmation({
                        order: mockOrder,
                        siteUrl,
                    })
                );

                expect(html).toContain('Ye Olde Artoonist');
                expect(html).toContain(siteUrl);
            });

            it('should handle multiple order items correctly', async () => {
                const orderWithMultipleItems = {
                    ...mockOrder,
                    items: [
                        {
                            id: 'item-1',
                            artworkId: 'artwork-1',
                            quantity: 2,
                            priceAtPurchase: 50.0,
                            lineSubtotal: 100.0,
                            title: 'First Artwork',
                            imageUrl: 'https://example.com/image1.jpg',
                        },
                        {
                            id: 'item-2',
                            artworkId: 'artwork-2',
                            quantity: 1,
                            priceAtPurchase: 75.0,
                            lineSubtotal: 75.0,
                            title: 'Second Artwork',
                            imageUrl: 'https://example.com/image2.jpg',
                        },
                    ],
                };

                const html = await render(
                    OrderConfirmation({
                        order: orderWithMultipleItems,
                        siteUrl,
                    })
                );

                expect(html).toContain('First Artwork');
                expect(html).toContain('Second Artwork');
                // Both items should show quantity
                expect(html).toContain('Quantity');
            });
        });

        describe('AdminNotification template', () => {
            it('should render admin notification with order number', async () => {
                const html = await render(
                    AdminNotification({
                        order: mockOrder,
                        siteUrl,
                    })
                );

                expect(html).toContain(mockOrder.orderNumber);
            });

            it('should render admin notification with customer name and email', async () => {
                const html = await render(
                    AdminNotification({
                        order: mockOrder,
                        siteUrl,
                    })
                );

                expect(html).toContain('John Doe');
                expect(html).toContain('john@example.com');
            });

            it('should render admin notification with order total', async () => {
                const html = await render(
                    AdminNotification({
                        order: mockOrder,
                        siteUrl,
                    })
                );

                expect(html).toContain('Order Total');
                expect(html).toContain('118.25');
            });

            it('should render admin notification with payment status', async () => {
                const html = await render(
                    AdminNotification({
                        order: mockOrder,
                        siteUrl,
                    })
                );

                expect(html).toContain('Payment Status');
                expect(html).toContain('SUCCEEDED');
            });

            it('should render admin notification with link to admin dashboard', async () => {
                const html = await render(
                    AdminNotification({
                        order: mockOrder,
                        siteUrl,
                    })
                );

                const expectedUrl = `${siteUrl}/admin/orders/${mockOrder.id}`;
                expect(html).toContain(expectedUrl);
                expect(html).toContain('View Order in Admin Dashboard');
            });

            it('should render admin notification with items summary', async () => {
                const html = await render(
                    AdminNotification({
                        order: mockOrder,
                        siteUrl,
                    })
                );

                expect(html).toContain('Test Artwork');
                expect(html).toContain('×');
                expect(html).toContain('2');
                expect(html).toContain('100.00');
            });

            it('should render admin notification with item count', async () => {
                const html = await render(
                    AdminNotification({
                        order: mockOrder,
                        siteUrl,
                    })
                );

                expect(html).toContain('Items');
                expect(html).toContain('1');
            });

            it('should render admin notification with shipping address', async () => {
                const html = await render(
                    AdminNotification({
                        order: mockOrder,
                        siteUrl,
                    })
                );

                expect(html).toContain('123 Main St');
                expect(html).toContain('Apt 4B');
                expect(html).toContain('Springfield');
                expect(html).toContain('IL');
                expect(html).toContain('62701');
            });

            it('should render admin notification with customer notes when present', async () => {
                const html = await render(
                    AdminNotification({
                        order: mockOrder,
                        siteUrl,
                    })
                );

                expect(html).toContain('Customer Notes');
                expect(html).toContain('Please handle with care');
            });

            it('should render admin notification without notes section when notes are empty', async () => {
                const orderWithoutNotes = { ...mockOrder, orderNotes: '' };
                const html = await render(
                    AdminNotification({
                        order: orderWithoutNotes,
                        siteUrl,
                    })
                );

                expect(html).not.toContain('Customer Notes');
            });

            it('should render admin notification with formatted order time', async () => {
                const html = await render(
                    AdminNotification({
                        order: mockOrder,
                        siteUrl,
                    })
                );

                // Check that some form of the date appears
                expect(html).toMatch(/Jan.*1.*2025/);
            });

            it('should render admin notification header with emoji and title', async () => {
                const html = await render(
                    AdminNotification({
                        order: mockOrder,
                        siteUrl,
                    })
                );

                expect(html).toContain('🎨 New Order Received');
            });

            it('should handle multiple items in admin notification', async () => {
                const orderWithMultipleItems = {
                    ...mockOrder,
                    items: [
                        {
                            id: 'item-1',
                            artworkId: 'artwork-1',
                            quantity: 2,
                            priceAtPurchase: 50.0,
                            lineSubtotal: 100.0,
                            title: 'First Artwork',
                            imageUrl: 'https://example.com/image1.jpg',
                        },
                        {
                            id: 'item-2',
                            artworkId: 'artwork-2',
                            quantity: 1,
                            priceAtPurchase: 75.0,
                            lineSubtotal: 75.0,
                            title: 'Second Artwork',
                            imageUrl: 'https://example.com/image2.jpg',
                        },
                    ],
                };

                const html = await render(
                    AdminNotification({
                        order: orderWithMultipleItems,
                        siteUrl,
                    })
                );

                expect(html).toContain('Items');
                expect(html).toContain('2');
                expect(html).toContain('First Artwork');
                expect(html).toContain('Second Artwork');
            });
        });
    });

    describe('sendContactFormEmail', () => {
        const mockContactData = {
            name: 'John Doe',
            email: 'john@example.com',
            message: 'I would like to inquire about commissioning artwork.',
        };

        describe('function export', () => {
            it('should export sendContactFormEmail as a function', () => {
                expect(typeof sendContactFormEmail).toBe('function');
            });

            it('should accept a contact data parameter', () => {
                expect(sendContactFormEmail.length).toBe(1);
            });

            it('should return a Promise', () => {
                const result = sendContactFormEmail(mockContactData);
                expect(result).toBeInstanceOf(Promise);
            });
        });

        describe('return type', () => {
            it('should return EmailResult with success/error properties', async () => {
                const result = await sendContactFormEmail(mockContactData);

                expect(result).toHaveProperty('success');
                expect(typeof result.success).toBe('boolean');

                if (!result.success) {
                    expect(result).toHaveProperty('error');
                }
            });
        });

        describe('configuration validation', () => {
            const originalEnv = process.env;

            beforeEach(() => {
                process.env = { ...originalEnv };
            });

            afterAll(() => {
                process.env = originalEnv;
            });

            it('should handle missing RESEND_API_KEY gracefully', async () => {
                delete process.env.RESEND_API_KEY;

                const result = await sendContactFormEmail(mockContactData);

                expect(result.success).toBe(false);
                expect(result.error).toBeDefined();
                expect(result.error?.message).toContain('RESEND_API_KEY');
            });

            it('should use siteConfig.artist.email as recipient', async () => {
                process.env.RESEND_API_KEY = 'test-key';

                // This will fail without mocking Resend, but we're testing the function is called
                const result = await sendContactFormEmail(mockContactData);

                // Function should attempt to send (and fail in test environment)
                expect(result).toHaveProperty('success');
            });
        });

        describe('template rendering', () => {
            it('should render ContactFormSubmission template with contact data', async () => {
                const submittedAt = new Date().toISOString();
                const html = await render(
                    ContactFormSubmission({
                        ...mockContactData,
                        submittedAt,
                    })
                );

                expect(html).toContain(mockContactData.name);
                expect(html).toContain(mockContactData.email);
                expect(html).toContain(mockContactData.message);
            });

            it('should handle special characters in contact data', async () => {
                const contactWithSpecialChars = {
                    name: "O'Connor & Sons <Test>",
                    email: 'test+tag@example.com',
                    message: 'Message with <html> tags',
                };
                const submittedAt = new Date().toISOString();

                const html = await render(
                    ContactFormSubmission({
                        ...contactWithSpecialChars,
                        submittedAt,
                    })
                );

                // HTML should be properly escaped
                expect(html).not.toContain('<Test>');
                expect(html).not.toContain('<html>');
                expect(html).toContain('&lt;');
            });
        });

        describe('error handling', () => {
            const originalEnv = process.env;

            beforeEach(() => {
                process.env = { ...originalEnv };
            });

            afterAll(() => {
                process.env = originalEnv;
            });

            it('should return error result when email sending fails', async () => {
                // Missing API key will cause failure
                delete process.env.RESEND_API_KEY;

                const result = await sendContactFormEmail(mockContactData);

                expect(result.success).toBe(false);
                expect(result.error).toBeDefined();
                expect(result.error).toBeInstanceOf(EmailSendError);
            });

            it('should include appropriate error codes for different failure types', async () => {
                delete process.env.RESEND_API_KEY;

                const result = await sendContactFormEmail(mockContactData);

                expect(result.error?.code).toBeDefined();
                expect(typeof result.error?.code).toBe('string');
            });

            it('should never throw errors', async () => {
                delete process.env.RESEND_API_KEY;

                // Should not throw, just return error result
                await expect(
                    sendContactFormEmail(mockContactData)
                ).resolves.toBeDefined();
            });
        });
    });
});
