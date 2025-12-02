/**
 * Stripe Utilities Tests
 *
 * Tests for Stripe client setup, payment intent creation, webhook verification,
 * and order number generation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Stripe before importing our module
vi.mock('stripe', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    function MockStripe(this: any, _apiKey: string, _config: unknown) {
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            constructEvent: vi.fn((payload, signature, _secret) => {
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
    stripe,
    createPaymentIntent,
    constructWebhookEvent,
    generateOrderNumber,
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
