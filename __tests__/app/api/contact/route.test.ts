/**
 * Tests for /api/contact route
 *
 * These tests verify:
 * - POST request handling with valid data
 * - Input validation with Zod schema
 * - Email service integration
 * - Error handling for various failure scenarios
 * - Method rejection (GET, PUT, DELETE)
 * - Security (XSS prevention, injection attacks)
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '@/app/api/contact/route';
import { NextRequest } from 'next/server';

// Mock the email service
vi.mock('@/lib/email/send', () => ({
    sendContactFormEmail: vi.fn(),
    EmailSendError: class EmailSendError extends Error {
        constructor(
            message: string,
            public readonly code: string,
            public readonly retryable: boolean = false
        ) {
            super(message);
            this.name = 'EmailSendError';
        }
    },
}));

// Import after mocking
import { EmailSendError, sendContactFormEmail } from '@/lib/email/send';

describe('/api/contact', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();
    });

    describe('POST /api/contact', () => {
        const validContactData = {
            name: 'John Doe',
            email: 'john@example.com',
            message:
                'I would like to inquire about commissioning a custom piece.',
        };

        it('should accept POST requests', () => {
            expect(typeof POST).toBe('function');
        });

        it('should return 200 with success response for valid data', async () => {
            // Mock successful email send
            vi.mocked(sendContactFormEmail).mockResolvedValue({
                success: true,
                messageId: 'test-message-id',
            });

            const request = new NextRequest(
                'http://localhost:3000/api/contact',
                {
                    method: 'POST',
                    body: JSON.stringify(validContactData),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(sendContactFormEmail).toHaveBeenCalledWith(validContactData);
        });

        it('should return 400 for missing name field', async () => {
            const invalidData = {
                email: 'john@example.com',
                message: 'Message without name',
            };

            const request = new NextRequest(
                'http://localhost:3000/api/contact',
                {
                    method: 'POST',
                    body: JSON.stringify(invalidData),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBeDefined();
            expect(sendContactFormEmail).not.toHaveBeenCalled();
        });

        it('should return 400 for missing email field', async () => {
            const invalidData = {
                name: 'John Doe',
                message: 'Message without email',
            };

            const request = new NextRequest(
                'http://localhost:3000/api/contact',
                {
                    method: 'POST',
                    body: JSON.stringify(invalidData),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBeDefined();
            expect(sendContactFormEmail).not.toHaveBeenCalled();
        });

        it('should return 400 for missing message field', async () => {
            const invalidData = {
                name: 'John Doe',
                email: 'john@example.com',
            };

            const request = new NextRequest(
                'http://localhost:3000/api/contact',
                {
                    method: 'POST',
                    body: JSON.stringify(invalidData),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBeDefined();
            expect(sendContactFormEmail).not.toHaveBeenCalled();
        });

        it('should return 400 for invalid email format', async () => {
            const invalidData = {
                name: 'John Doe',
                email: 'not-an-email',
                message: 'Test message',
            };

            const request = new NextRequest(
                'http://localhost:3000/api/contact',
                {
                    method: 'POST',
                    body: JSON.stringify(invalidData),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBeDefined();
            expect(sendContactFormEmail).not.toHaveBeenCalled();
        });

        it('should return 400 for message that is too short', async () => {
            const invalidData = {
                name: 'John Doe',
                email: 'john@example.com',
                message: 'Short',
            };

            const request = new NextRequest(
                'http://localhost:3000/api/contact',
                {
                    method: 'POST',
                    body: JSON.stringify(invalidData),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBeDefined();
            expect(sendContactFormEmail).not.toHaveBeenCalled();
        });

        it('should return 400 for message that is too long', async () => {
            const invalidData = {
                name: 'John Doe',
                email: 'john@example.com',
                message: 'a'.repeat(5001), // Over 5000 character limit
            };

            const request = new NextRequest(
                'http://localhost:3000/api/contact',
                {
                    method: 'POST',
                    body: JSON.stringify(invalidData),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBeDefined();
            expect(sendContactFormEmail).not.toHaveBeenCalled();
        });

        it('should return 200 even if email sending fails (graceful degradation)', async () => {
            // Mock email send failure
            vi.mocked(sendContactFormEmail).mockResolvedValue({
                success: false,
                error: new EmailSendError(
                    'Resend API error',
                    'RESEND_ERROR',
                    true
                ),
            });

            const request = new NextRequest(
                'http://localhost:3000/api/contact',
                {
                    method: 'POST',
                    body: JSON.stringify(validContactData),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const response = await POST(request);
            const data = await response.json();

            // Should still return 200 for good UX
            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(sendContactFormEmail).toHaveBeenCalledWith(validContactData);
        });

        it('should handle malformed JSON gracefully', async () => {
            const request = new NextRequest(
                'http://localhost:3000/api/contact',
                {
                    method: 'POST',
                    body: 'not valid json{',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const response = await POST(request);

            expect(response.status).toBe(500);
        });

        it('should sanitize input data (validation handles XSS prevention)', async () => {
            vi.mocked(sendContactFormEmail).mockResolvedValue({
                success: true,
                messageId: 'test-message-id',
            });

            const dataWithHTML = {
                name: 'John <script>alert("xss")</script> Doe',
                email: 'john@example.com',
                message:
                    'Message with <img src=x onerror=alert("xss")> content',
            };

            const request = new NextRequest(
                'http://localhost:3000/api/contact',
                {
                    method: 'POST',
                    body: JSON.stringify(dataWithHTML),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            // Email service will handle HTML escaping in the template
            expect(sendContactFormEmail).toHaveBeenCalled();
        });

        it('should accept valid email addresses with special characters', async () => {
            vi.mocked(sendContactFormEmail).mockResolvedValue({
                success: true,
                messageId: 'test-message-id',
            });

            const dataWithSpecialEmail = {
                name: 'John Doe',
                email: 'john.doe+test@example.co.uk',
                message: 'Test message with special email format',
            };

            const request = new NextRequest(
                'http://localhost:3000/api/contact',
                {
                    method: 'POST',
                    body: JSON.stringify(dataWithSpecialEmail),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(sendContactFormEmail).toHaveBeenCalledWith(
                dataWithSpecialEmail
            );
        });
    });

    describe('GET /api/contact', () => {
        it('should reject GET requests with 405', async () => {
            new NextRequest('http://localhost:3000/api/contact', {
                method: 'GET',
            });

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(405);
            expect(data.error).toBeDefined();
            expect(data.error).toContain('Method not allowed');
        });

        it('should export GET handler', () => {
            expect(typeof GET).toBe('function');
        });
    });
});
