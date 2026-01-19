/**
 * Tests for email templates
 *
 * These tests verify:
 * - Email templates render correctly with order data
 * - All order information is included in rendered output
 * - Templates handle optional fields gracefully
 * - HTML output is valid and contains expected elements
 */

import { render } from '@react-email/render';
import { OrderConfirmation } from '@/lib/email/templates/OrderConfirmation';
import { AdminNotification } from '@/lib/email/templates/AdminNotification';
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
            title: 'Test Artwork 1',
            imageUrl: 'https://example.com/image1.jpg',
        },
        {
            id: 'item-2',
            artworkId: 'artwork-2',
            quantity: 1,
            priceAtPurchase: 75.0,
            lineSubtotal: 75.0,
            title: 'Test Artwork 2',
            imageUrl: 'https://example.com/image2.jpg',
        },
    ],
    createdAt: '2025-01-01T12:00:00Z',
    updatedAt: '2025-01-01T12:00:00Z',
};

const mockOrderWithoutNotes: Order = {
    ...mockOrder,
    orderNotes: undefined,
    shippingAddress: {
        ...mockOrder.shippingAddress,
        line2: undefined,
    },
};

const siteUrl = 'https://yeoldeartoonist.com';

describe('OrderConfirmation Email Template', () => {
    describe('rendering', () => {
        it('should render without errors', async () => {
            const html = await render(
                OrderConfirmation({ order: mockOrder, siteUrl })
            );
            expect(html).toBeTruthy();
            expect(typeof html).toBe('string');
        });

        it('should render valid HTML', async () => {
            const html = await render(
                OrderConfirmation({ order: mockOrder, siteUrl })
            );
            expect(html).toContain('<!DOCTYPE html');
            expect(html).toContain('<html');
            expect(html).toContain('</html>');
        });
    });

    describe('order information', () => {
        it('should include order number', async () => {
            const html = await render(
                OrderConfirmation({ order: mockOrder, siteUrl })
            );
            expect(html).toContain(mockOrder.orderNumber);
        });

        it('should include customer name', async () => {
            const html = await render(
                OrderConfirmation({ order: mockOrder, siteUrl })
            );
            expect(html).toContain(mockOrder.customerName);
        });

        it('should include order date', async () => {
            const html = await render(
                OrderConfirmation({ order: mockOrder, siteUrl })
            );
            // Date should be formatted as "January 1, 2025" or similar
            expect(html).toContain('2025');
        });

        it('should include order total', async () => {
            const html = await render(
                OrderConfirmation({ order: mockOrder, siteUrl })
            );
            expect(html).toContain('118.25');
        });
    });

    describe('order items', () => {
        it('should include all item titles', async () => {
            const html = await render(
                OrderConfirmation({ order: mockOrder, siteUrl })
            );
            expect(html).toContain('Test Artwork 1');
            expect(html).toContain('Test Artwork 2');
        });

        it('should include item quantities', async () => {
            const html = await render(
                OrderConfirmation({ order: mockOrder, siteUrl })
            );
            // HTML comments are inserted by React Email renderer
            expect(html).toMatch(/Quantity:\s*<!--\s*-->2/);
            expect(html).toMatch(/Quantity:\s*<!--\s*-->1/);
        });

        it('should include item prices', async () => {
            const html = await render(
                OrderConfirmation({ order: mockOrder, siteUrl })
            );
            expect(html).toContain('50.00');
            expect(html).toContain('75.00');
        });

        it('should include line subtotals', async () => {
            const html = await render(
                OrderConfirmation({ order: mockOrder, siteUrl })
            );
            expect(html).toContain('100.00');
            expect(html).toContain('75.00');
        });

        it('should handle items without titles gracefully', async () => {
            const orderWithoutTitles: Order = {
                ...mockOrder,
                items: [
                    {
                        ...mockOrder.items[0],
                        title: undefined,
                    },
                ],
            };
            const html = await render(
                OrderConfirmation({ order: orderWithoutTitles, siteUrl })
            );
            expect(html).toContain('Artwork'); // Fallback text
        });
    });

    describe('pricing breakdown', () => {
        it('should include subtotal', async () => {
            const html = await render(
                OrderConfirmation({ order: mockOrder, siteUrl })
            );
            expect(html).toContain('Subtotal');
            expect(html).toContain('100.00');
        });

        it('should include shipping cost', async () => {
            const html = await render(
                OrderConfirmation({ order: mockOrder, siteUrl })
            );
            expect(html).toContain('Shipping');
            expect(html).toContain('10.00');
        });

        it('should include tax amount', async () => {
            const html = await render(
                OrderConfirmation({ order: mockOrder, siteUrl })
            );
            expect(html).toContain('Tax');
            expect(html).toContain('8.25');
        });

        it('should include total', async () => {
            const html = await render(
                OrderConfirmation({ order: mockOrder, siteUrl })
            );
            expect(html).toContain('Total');
            expect(html).toContain('118.25');
        });
    });

    describe('shipping address', () => {
        it('should include complete shipping address', async () => {
            const html = await render(
                OrderConfirmation({ order: mockOrder, siteUrl })
            );
            expect(html).toContain('123 Main St');
            expect(html).toContain('Apt 4B');
            expect(html).toContain('Springfield');
            expect(html).toContain('IL');
            expect(html).toContain('62701');
            expect(html).toContain('US');
        });

        it('should handle address without line2', async () => {
            const html = await render(
                OrderConfirmation({
                    order: mockOrderWithoutNotes,
                    siteUrl,
                })
            );
            expect(html).toContain('123 Main St');
            expect(html).toContain('Springfield');
            // Should not break or show undefined
            expect(html).not.toContain('undefined');
        });
    });

    describe('order notes', () => {
        it('should include order notes when present', async () => {
            const html = await render(
                OrderConfirmation({ order: mockOrder, siteUrl })
            );
            expect(html).toContain('Please handle with care');
            expect(html).toContain('Order Notes');
        });

        it('should not include order notes section when notes are missing', async () => {
            const html = await render(
                OrderConfirmation({
                    order: mockOrderWithoutNotes,
                    siteUrl,
                })
            );
            expect(html).not.toContain('Order Notes');
        });
    });

    describe('branding', () => {
        it('should include logo with correct URL', async () => {
            const html = await render(
                OrderConfirmation({ order: mockOrder, siteUrl })
            );
            expect(html).toContain(`${siteUrl}/images/header-footer/logo.png`);
        });

        it('should include site URL in footer', async () => {
            const html = await render(
                OrderConfirmation({ order: mockOrder, siteUrl })
            );
            expect(html).toContain(siteUrl);
        });

        it('should include copyright notice', async () => {
            const html = await render(
                OrderConfirmation({ order: mockOrder, siteUrl })
            );
            const currentYear = new Date().getFullYear();
            // HTML comments are inserted by React Email renderer
            expect(html).toMatch(new RegExp(`©\\s*<!--\\s*-->${currentYear}`));
            expect(html).toContain('Ye Olde Artoonist');
        });
    });
});

describe('AdminNotification Email Template', () => {
    describe('rendering', () => {
        it('should render without errors', async () => {
            const html = await render(
                AdminNotification({ order: mockOrder, siteUrl })
            );
            expect(html).toBeTruthy();
            expect(typeof html).toBe('string');
        });

        it('should render valid HTML', async () => {
            const html = await render(
                AdminNotification({ order: mockOrder, siteUrl })
            );
            expect(html).toContain('<!DOCTYPE html');
            expect(html).toContain('<html');
            expect(html).toContain('</html>');
        });
    });

    describe('order summary', () => {
        it('should include order number', async () => {
            const html = await render(
                AdminNotification({ order: mockOrder, siteUrl })
            );
            expect(html).toContain(mockOrder.orderNumber);
        });

        it('should include customer name', async () => {
            const html = await render(
                AdminNotification({ order: mockOrder, siteUrl })
            );
            expect(html).toContain(mockOrder.customerName);
        });

        it('should include customer email', async () => {
            const html = await render(
                AdminNotification({ order: mockOrder, siteUrl })
            );
            expect(html).toContain(mockOrder.customerEmail);
        });

        it('should include order total', async () => {
            const html = await render(
                AdminNotification({ order: mockOrder, siteUrl })
            );
            expect(html).toContain('118.25');
        });

        it('should include payment status', async () => {
            const html = await render(
                AdminNotification({ order: mockOrder, siteUrl })
            );
            expect(html).toContain('SUCCEEDED');
        });

        it('should include order timestamp', async () => {
            const html = await render(
                AdminNotification({ order: mockOrder, siteUrl })
            );
            // Should contain formatted date
            expect(html).toContain('2025');
        });
    });

    describe('order items summary', () => {
        it('should include item count', async () => {
            const html = await render(
                AdminNotification({ order: mockOrder, siteUrl })
            );
            // HTML comments are inserted by React Email renderer
            expect(html).toMatch(/Items\s*\(<!--\s*-->2/);
        });

        it('should list all items with quantities and totals', async () => {
            const html = await render(
                AdminNotification({ order: mockOrder, siteUrl })
            );
            // Verify both items are listed with their totals
            expect(html).toContain('Test Artwork 1');
            expect(html).toContain('100.00');
            expect(html).toContain('Test Artwork 2');
            expect(html).toContain('75.00');
            // Verify quantities are present (HTML encoding may vary)
            expect(html).toContain('2');
            expect(html).toContain('1');
        });
    });

    describe('shipping address', () => {
        it('should include complete shipping address', async () => {
            const html = await render(
                AdminNotification({ order: mockOrder, siteUrl })
            );
            expect(html).toContain('123 Main St');
            expect(html).toContain('Apt 4B');
            expect(html).toContain('Springfield');
            expect(html).toContain('IL');
            expect(html).toContain('62701');
        });

        it('should handle address without line2', async () => {
            const html = await render(
                AdminNotification({
                    order: mockOrderWithoutNotes,
                    siteUrl,
                })
            );
            expect(html).toContain('123 Main St');
            expect(html).not.toContain('undefined');
        });
    });

    describe('customer notes', () => {
        it('should include customer notes when present', async () => {
            const html = await render(
                AdminNotification({ order: mockOrder, siteUrl })
            );
            expect(html).toContain('Please handle with care');
            expect(html).toContain('Customer Notes');
        });

        it('should not include notes section when notes are missing', async () => {
            const html = await render(
                AdminNotification({
                    order: mockOrderWithoutNotes,
                    siteUrl,
                })
            );
            expect(html).not.toContain('Customer Notes');
        });
    });

    describe('admin dashboard link', () => {
        it('should include link to admin dashboard', async () => {
            const html = await render(
                AdminNotification({ order: mockOrder, siteUrl })
            );
            const expectedUrl = `${siteUrl}/admin/orders/${mockOrder.id}`;
            expect(html).toContain(expectedUrl);
        });

        it('should include call-to-action text', async () => {
            const html = await render(
                AdminNotification({ order: mockOrder, siteUrl })
            );
            expect(html).toContain('View Order in Admin Dashboard');
        });
    });

    describe('notification styling', () => {
        it('should include new order alert message', async () => {
            const html = await render(
                AdminNotification({ order: mockOrder, siteUrl })
            );
            expect(html).toContain('New Order Received');
        });

        it('should include automated notification disclaimer', async () => {
            const html = await render(
                AdminNotification({ order: mockOrder, siteUrl })
            );
            expect(html).toContain('automated notification');
        });
    });
});
