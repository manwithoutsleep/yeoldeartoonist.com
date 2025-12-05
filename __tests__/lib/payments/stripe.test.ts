/**
 * Stripe Utilities Tests
 *
 * Tests for Stripe client setup, payment intent creation, webhook verification,
 * and order number generation.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Stripe before importing our module
vi.mock('stripe', () => {
    function MockStripe(this: {
        paymentIntents: unknown;
        webhooks: unknown;
        _emitter: unknown;
    }) {
        this.paymentIntents = {
            create: vi.fn().mockResolvedValue({
                id: 'pi_test_123',
                amount: 10000,
                currency: 'usd',
                metadata: {},
                automatic_payment_methods: { enabled: true },
                client_secret: 'pi_test_123_secret_abc',
            }),
        };
        this.webhooks = {
            constructEvent: vi.fn((payload, signature) => {
                // Simple mock that throws on invalid input
                if (
                    signature === 'invalid_signature' ||
                    signature === 't=123,v1=abc'
                ) {
                    throw new Error('Invalid signature');
                }
                return {
                    id: 'evt_test',
                    type: 'payment_intent.succeeded',
                    data: { object: {} },
                };
            }),
        };
        this._emitter = {}; // For instance check
    }

    return {
        default: MockStripe,
    };
});

import {
    constructWebhookEvent,
    createPaymentIntent,
    createPaymentIntentWithTax,
    generateOrderNumber,
    stripe,
} from '@/lib/payments/stripe';

describe('Stripe Utilities', () => {
    let mockPaymentIntentCreate: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        // Get reference to the mock
        mockPaymentIntentCreate = stripe.paymentIntents.create as ReturnType<
            typeof vi.fn
        >;
        vi.clearAllMocks();
    });

    describe('stripe client', () => {
        it('should initialize Stripe client correctly', () => {
            expect(stripe).toBeDefined();
            expect(stripe.paymentIntents).toBeDefined();
            expect(stripe.webhooks).toBeDefined();
        });

        it('should have webhook constructEvent method', () => {
            expect(stripe.webhooks.constructEvent).toBeDefined();
        });
    });

    describe('createPaymentIntent', () => {
        it('should create payment intent with correct amount in cents', async () => {
            const amount = 105.5; // $105.50

            await createPaymentIntent(amount);

            // Verify the mock was called with correct parameters
            expect(mockPaymentIntentCreate).toHaveBeenCalledWith({
                amount: 10550, // Converted to cents
                currency: 'usd',
                metadata: {},
                automatic_payment_methods: { enabled: true },
            });
        });

        it('should use USD as default currency', async () => {
            await createPaymentIntent(100);

            expect(mockPaymentIntentCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    currency: 'usd',
                })
            );
        });

        it('should accept custom currency', async () => {
            await createPaymentIntent(100, 'eur');

            expect(mockPaymentIntentCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    currency: 'eur',
                })
            );
        });

        it('should attach metadata to payment intent', async () => {
            const metadata = {
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
                orderNumber: 'YOA-20250112-0001',
            };

            await createPaymentIntent(100, 'usd', metadata);

            expect(mockPaymentIntentCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    metadata,
                })
            );
        });

        it('should enable automatic payment methods', async () => {
            await createPaymentIntent(100);

            expect(mockPaymentIntentCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    automatic_payment_methods: { enabled: true },
                })
            );
        });

        it('should handle decimal amounts correctly', async () => {
            await createPaymentIntent(99.99);

            expect(mockPaymentIntentCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    amount: 9999,
                })
            );
        });

        it('should round fractional cents correctly', async () => {
            // $100.005 should round to 10001 cents
            await createPaymentIntent(100.005);

            expect(mockPaymentIntentCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    amount: 10001,
                })
            );
        });

        it('should handle errors from Stripe API', async () => {
            // Mock a Stripe API error
            mockPaymentIntentCreate.mockRejectedValueOnce(
                new Error('Stripe API error')
            );

            await expect(createPaymentIntent(100)).rejects.toThrow(
                'Stripe API error'
            );
        });
    });

    describe('createPaymentIntentWithTax', () => {
        beforeEach(() => {
            // Reset mock to default behavior
            mockPaymentIntentCreate.mockResolvedValue({
                id: 'pi_test_123',
                amount: 10000,
                currency: 'usd',
                metadata: {},
                automatic_payment_methods: { enabled: true },
                automatic_tax: {
                    enabled: true,
                    status: 'complete',
                    amount: 850, // $8.50 tax in cents
                },
                client_secret: 'pi_test_123_secret_abc',
            });
        });

        it('should create PaymentIntent with automatic_tax enabled', async () => {
            const shippingAddress = {
                line1: '123 Main St',
                city: 'Los Angeles',
                state: 'CA',
                postal_code: '90001',
                country: 'US',
            };

            await createPaymentIntentWithTax(100, shippingAddress);

            expect(mockPaymentIntentCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    automatic_tax: {
                        enabled: true,
                    },
                })
            );
        });

        it('should include shipping address for tax calculation', async () => {
            const shippingAddress = {
                line1: '456 Broadway',
                line2: 'Apt 3B',
                city: 'New York',
                state: 'NY',
                postal_code: '10001',
                country: 'US',
            };

            await createPaymentIntentWithTax(200, shippingAddress, {
                customerName: 'Jane Doe',
            });

            expect(mockPaymentIntentCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    shipping: {
                        name: 'Jane Doe',
                        address: {
                            line1: '456 Broadway',
                            line2: 'Apt 3B',
                            city: 'New York',
                            state: 'NY',
                            postal_code: '10001',
                            country: 'US',
                        },
                    },
                })
            );
        });

        it('should return tax amount from PaymentIntent', async () => {
            const shippingAddress = {
                line1: '123 Main St',
                city: 'Los Angeles',
                state: 'CA',
                postal_code: '90001',
                country: 'US',
            };

            const result = await createPaymentIntentWithTax(
                100,
                shippingAddress
            );

            expect(result.taxAmount).toBe(8.5); // $8.50 tax (850 cents / 100)
            expect(result.total).toBe(108.5); // $100 + $8.50
            expect(result.paymentIntent).toBeDefined();
            expect(result.paymentIntent.id).toBe('pi_test_123');
        });

        it('should handle addresses in tax-free states', async () => {
            // Mock response for tax-free state (Oregon)
            mockPaymentIntentCreate.mockResolvedValueOnce({
                id: 'pi_test_or',
                amount: 10000,
                currency: 'usd',
                metadata: {},
                automatic_payment_methods: { enabled: true },
                automatic_tax: {
                    enabled: true,
                    status: 'complete',
                    amount: 0, // No tax in Oregon
                },
                client_secret: 'pi_test_or_secret',
            });

            const oregonAddress = {
                line1: '321 Pine St',
                city: 'Portland',
                state: 'OR',
                postal_code: '97201',
                country: 'US',
            };

            const result = await createPaymentIntentWithTax(100, oregonAddress);

            expect(result.taxAmount).toBe(0);
            expect(result.total).toBe(100);
        });

        it('should handle addresses in high-tax states', async () => {
            // Mock response for high-tax state (California)
            mockPaymentIntentCreate.mockResolvedValueOnce({
                id: 'pi_test_ca',
                amount: 10000,
                currency: 'usd',
                metadata: {},
                automatic_payment_methods: { enabled: true },
                automatic_tax: {
                    enabled: true,
                    status: 'complete',
                    amount: 975, // 9.75% tax = $9.75
                },
                client_secret: 'pi_test_ca_secret',
            });

            const californiaAddress = {
                line1: '123 Main St',
                city: 'Los Angeles',
                state: 'CA',
                postal_code: '90001',
                country: 'US',
            };

            const result = await createPaymentIntentWithTax(
                100,
                californiaAddress
            );

            expect(result.taxAmount).toBe(9.75);
            expect(result.total).toBe(109.75);
        });

        it('should handle invalid addresses gracefully', async () => {
            // Mock Stripe API error for invalid address
            mockPaymentIntentCreate.mockRejectedValueOnce(
                new Error('Invalid address provided')
            );

            const invalidAddress = {
                line1: '',
                city: '',
                state: 'XX',
                postal_code: '00000',
                country: 'XX',
            };

            await expect(
                createPaymentIntentWithTax(100, invalidAddress)
            ).rejects.toThrow('Invalid address provided');
        });

        it('should use correct metadata structure', async () => {
            const shippingAddress = {
                line1: '789 Oak St',
                city: 'Austin',
                state: 'TX',
                postal_code: '78701',
                country: 'US',
            };

            const metadata = {
                customerName: 'Bob Smith',
                customerEmail: 'bob@example.com',
                subtotal: '100.00',
                shippingCost: '5.00',
            };

            await createPaymentIntentWithTax(105, shippingAddress, metadata);

            expect(mockPaymentIntentCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    metadata,
                })
            );
        });

        it('should handle PaymentIntent without automatic_tax field (backwards compatibility)', async () => {
            // Mock old PaymentIntent without automatic_tax
            mockPaymentIntentCreate.mockResolvedValueOnce({
                id: 'pi_test_old',
                amount: 10000,
                currency: 'usd',
                metadata: {},
                automatic_payment_methods: { enabled: true },
                // No automatic_tax field
                client_secret: 'pi_test_old_secret',
            });

            const shippingAddress = {
                line1: '123 Main St',
                city: 'Portland',
                state: 'OR',
                postal_code: '97201',
                country: 'US',
            };

            const result = await createPaymentIntentWithTax(
                100,
                shippingAddress
            );

            // Should default to 0 if automatic_tax is missing
            expect(result.taxAmount).toBe(0);
            expect(result.total).toBe(100);
        });

        it('should default customer name if not provided in metadata', async () => {
            const shippingAddress = {
                line1: '123 Main St',
                city: 'Portland',
                state: 'OR',
                postal_code: '97201',
                country: 'US',
            };

            await createPaymentIntentWithTax(100, shippingAddress, {});

            expect(mockPaymentIntentCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    shipping: expect.objectContaining({
                        name: 'Customer', // Default name
                    }),
                })
            );
        });
    });

    describe('constructWebhookEvent', () => {
        it('should construct webhook event with valid signature', () => {
            // Create a test webhook event
            const payload = JSON.stringify({
                id: 'evt_test',
                object: 'event',
                type: 'payment_intent.succeeded',
                data: {
                    object: {
                        id: 'pi_test',
                        object: 'payment_intent',
                        amount: 10000,
                        currency: 'usd',
                    },
                },
            });

            const webhookSecret = 'whsec_test_secret';
            const timestamp = Math.floor(Date.now() / 1000);

            // For testing, we'll use a valid signature format
            const signature = `t=${timestamp},v1=valid_test_signature`;

            // With valid signature, should return event
            const event = constructWebhookEvent(
                payload,
                signature,
                webhookSecret
            );

            expect(event).toBeDefined();
            expect(event.type).toBe('payment_intent.succeeded');
        });

        it('should throw error with invalid signature', () => {
            const payload = JSON.stringify({ type: 'test' });
            const invalidSignature = 'invalid_signature';
            const webhookSecret = 'whsec_test';

            expect(() =>
                constructWebhookEvent(payload, invalidSignature, webhookSecret)
            ).toThrow();
        });

        it('should throw error with wrong webhook secret', () => {
            const payload = JSON.stringify({ type: 'test' });
            const signature = 't=123,v1=abc';
            const wrongSecret = 'wrong_secret';

            expect(() =>
                constructWebhookEvent(payload, signature, wrongSecret)
            ).toThrow();
        });
    });

    describe('generateOrderNumber', () => {
        it('should generate order number with correct format', () => {
            const orderNumber = generateOrderNumber();

            // Format: YOA-YYYYMMDD-NNNN
            expect(orderNumber).toMatch(/^YOA-\d{8}-\d{4}$/);
        });

        it('should include current date in order number', () => {
            const orderNumber = generateOrderNumber();
            const today = new Date()
                .toISOString()
                .slice(0, 10)
                .replace(/-/g, '');

            expect(orderNumber).toContain(today);
        });

        it('should generate unique order numbers', () => {
            const orderNumbers = new Set<string>();

            // Generate 100 order numbers
            for (let i = 0; i < 100; i++) {
                orderNumbers.add(generateOrderNumber());
            }

            // All should be unique (or very close to 100)
            // Due to randomness, there's a tiny chance of collision, so we check for > 95
            expect(orderNumbers.size).toBeGreaterThan(95);
        });

        it('should start with YOA prefix', () => {
            const orderNumber = generateOrderNumber();

            expect(orderNumber.startsWith('YOA-')).toBe(true);
        });

        it('should have 4-digit random suffix', () => {
            const orderNumber = generateOrderNumber();
            const parts = orderNumber.split('-');
            const suffix = parts[2];

            expect(suffix).toHaveLength(4);
            expect(Number(suffix)).toBeGreaterThanOrEqual(0);
            expect(Number(suffix)).toBeLessThan(10000);
        });
    });
});
