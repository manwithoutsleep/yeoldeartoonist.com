/**
 * Tests for ContactFormSubmission email template
 *
 * These tests verify:
 * - Template renders correctly with contact form data
 * - All contact information is included in rendered output
 * - Templates handle edge cases gracefully (special characters, long messages)
 * - HTML output is valid and contains expected elements
 * - XSS prevention through proper escaping
 */

import { render } from '@react-email/render';
import { ContactFormSubmission } from '@/lib/email/templates/ContactFormSubmission';

// Mock contact form data for testing
const mockContactData = {
    name: 'John Doe',
    email: 'john@example.com',
    message:
        'I would like to inquire about commissioning a custom artwork piece.',
    submittedAt: '2025-01-17T12:00:00Z',
};

const mockContactWithSpecialChars = {
    name: "O'Connor & Sons <Test>",
    email: 'test+tag@example.com',
    message:
        'Test message with <script>alert("xss")</script> and special chars: & < > " \'',
    submittedAt: '2025-01-17T14:30:00Z',
};

const mockContactWithLongMessage = {
    name: 'Jane Smith',
    email: 'jane.smith@verylongdomainname.example.com',
    message:
        'This is a very long message that contains multiple paragraphs and detailed information about the inquiry. '.repeat(
            20
        ),
    submittedAt: '2025-01-17T16:45:00Z',
};

describe('ContactFormSubmission Email Template', () => {
    describe('rendering', () => {
        it('should render without errors', async () => {
            const html = await render(ContactFormSubmission(mockContactData));
            expect(html).toBeTruthy();
            expect(typeof html).toBe('string');
        });

        it('should render valid HTML', async () => {
            const html = await render(ContactFormSubmission(mockContactData));
            expect(html).toContain('<!DOCTYPE html');
            expect(html).toContain('<html');
            expect(html).toContain('</html>');
        });
    });

    describe('contact information', () => {
        it('should include sender name', async () => {
            const html = await render(ContactFormSubmission(mockContactData));
            expect(html).toContain(mockContactData.name);
        });

        it('should include sender email', async () => {
            const html = await render(ContactFormSubmission(mockContactData));
            expect(html).toContain(mockContactData.email);
        });

        it('should include message content', async () => {
            const html = await render(ContactFormSubmission(mockContactData));
            expect(html).toContain(mockContactData.message);
        });

        it('should include submission timestamp', async () => {
            const html = await render(ContactFormSubmission(mockContactData));
            // Should contain formatted date
            expect(html).toContain('2025');
        });
    });

    describe('XSS prevention', () => {
        it('should properly escape HTML in name field', async () => {
            const html = await render(
                ContactFormSubmission(mockContactWithSpecialChars)
            );
            // React Email should escape these, so raw tags should not appear
            expect(html).not.toContain('<Test>');
            // The escaped version should be present
            expect(html).toContain('O&#x27;Connor &amp; Sons');
        });

        it('should properly escape HTML in message field', async () => {
            const html = await render(
                ContactFormSubmission(mockContactWithSpecialChars)
            );
            // Should not contain raw script tag
            expect(html).not.toContain('<script>alert("xss")</script>');
            // Should contain escaped version
            expect(html).toContain('&lt;script&gt;');
        });

        it('should handle special characters in email addresses', async () => {
            const html = await render(
                ContactFormSubmission(mockContactWithSpecialChars)
            );
            expect(html).toContain('test+tag@example.com');
        });
    });

    describe('edge cases', () => {
        it('should handle very long messages', async () => {
            const html = await render(
                ContactFormSubmission(mockContactWithLongMessage)
            );
            expect(html).toContain(mockContactWithLongMessage.message);
            expect(html).toBeTruthy();
        });

        it('should handle very long email addresses', async () => {
            const html = await render(
                ContactFormSubmission(mockContactWithLongMessage)
            );
            expect(html).toContain('jane.smith@verylongdomainname.example.com');
        });

        it('should handle ampersands and special characters', async () => {
            const html = await render(
                ContactFormSubmission(mockContactWithSpecialChars)
            );
            // Ampersands should be properly escaped
            expect(html).toContain('&amp;');
        });
    });

    describe('template structure', () => {
        it('should have a clear subject/header', async () => {
            const html = await render(ContactFormSubmission(mockContactData));
            expect(html).toContain('Contact Form');
        });

        it('should include footer with site information', async () => {
            const html = await render(ContactFormSubmission(mockContactData));
            expect(html).toContain('Ye Olde Artoonist');
        });

        it('should include copyright notice', async () => {
            const html = await render(ContactFormSubmission(mockContactData));
            const currentYear = new Date().getFullYear();
            expect(html).toMatch(new RegExp(`©\\s*<!--\\s*-->${currentYear}`));
        });
    });

    describe('admin-friendly display', () => {
        it('should clearly label all contact fields', async () => {
            const html = await render(ContactFormSubmission(mockContactData));
            expect(html).toContain('Name');
            expect(html).toContain('Email');
            expect(html).toContain('Message');
        });

        it('should format timestamp in readable format', async () => {
            const html = await render(ContactFormSubmission(mockContactData));
            // Should include month and year in formatted date
            expect(html).toMatch(/Jan|January/);
            expect(html).toContain('2025');
        });
    });

    describe('consistency with other email templates', () => {
        it('should use similar styling patterns as AdminNotification', async () => {
            const html = await render(ContactFormSubmission(mockContactData));
            // Should contain similar structure
            expect(html).toContain('<!DOCTYPE html');
            expect(html).toContain('<body');
            // Should have proper container structure
            expect(html).toBeTruthy();
        });
    });
});
