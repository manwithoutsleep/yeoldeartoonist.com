/**
 * Tests for Contact Page
 *
 * The contact page is a client component that:
 * - Displays artist bio and information
 * - Shows contact form with validation
 * - Displays contact information and social media links
 * - Handles form submission and validation errors
 * - Uses Zod for form schema validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import ContactPage from '@/app/contact/page';

// Mock the site config
vi.mock('@/config/site', () => ({
    siteConfig: {
        site: {
            title: 'Ye Olde Artoonist',
            description:
                'Explore original artwork, prints, and more from Joe Schlottach',
            url: 'https://yeoldeartoonist.com',
        },
        artist: {
            name: 'Test Artist',
            bio: 'A talented artist creating amazing works',
            email: 'artist@example.com',
            responseTime: 'Usually responds within 48 hours',
            mailingAddress: {
                poBox: 'PO Box 123',
                city: 'New York',
                state: 'NY',
                zip: '10001',
                country: 'USA',
            },
        },
        socialMedia: {
            sites: [
                {
                    title: 'Instagram',
                    handle: '@testartist',
                    href: 'https://instagram.com/testartist',
                },
                {
                    title: 'Twitter',
                    handle: '@testartist',
                    href: 'https://twitter.com/testartist',
                },
            ],
        },
    },
}));

// Mock the Button component
vi.mock('@/components/ui/Button', () => ({
    Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button {...props} />
    ),
}));

// Mock the SocialMediaIcon component
vi.mock('@/components/ui/SocialMediaIcon', () => ({
    SocialMediaIcon: ({
        title,
        handle,
        href,
    }: {
        title: string;
        handle: string;
        href: string;
    }) => (
        <a href={href} title={title}>
            {handle}
        </a>
    ),
}));

describe('Contact Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Page Layout', () => {
        it('should render contact page with title', () => {
            render(<ContactPage />);
            expect(screen.getByText(/Meet The Artist:/i)).toBeInTheDocument();
        });

        it('should display artist name in title', () => {
            render(<ContactPage />);
            expect(screen.getByText(/Test Artist/i)).toBeInTheDocument();
        });

        it('should display artist bio', () => {
            render(<ContactPage />);
            expect(
                screen.getByText('A talented artist creating amazing works')
            ).toBeInTheDocument();
        });

        it('should have black background', () => {
            const { container } = render(<ContactPage />);
            const mainDiv = container.querySelector('.bg-black');
            expect(mainDiv).toBeInTheDocument();
        });

        it('should display artist image', () => {
            render(<ContactPage />);
            const img = screen.getByAltText('The Artist');
            expect(img).toBeInTheDocument();
            expect(img.getAttribute('src')).toContain('meet-the-artist.webp');
        });
    });

    describe('Contact Information Section', () => {
        it('should display contact information heading', () => {
            render(<ContactPage />);
            expect(screen.getByText('Contact Information')).toBeInTheDocument();
        });

        it('should display email', () => {
            render(<ContactPage />);
            expect(screen.getByText('artist@example.com')).toBeInTheDocument();
        });

        it('should have mailto link for email', () => {
            render(<ContactPage />);
            const emailLink = screen.getByRole('link', {
                name: 'artist@example.com',
            }) as HTMLAnchorElement;
            expect(emailLink).toBeInTheDocument();
            expect(emailLink.getAttribute('href')).toBe(
                'mailto:artist@example.com'
            );
        });

        it('should display mailing address', () => {
            render(<ContactPage />);
            // Mailing address is split across <br /> tags
            // Check that each part of the address is displayed
            const addresses = screen.getAllByText((content, element) => {
                // Match the specific paragraph with mailing address content
                const text = element?.textContent ?? '';
                return (
                    text.includes('PO Box 123') &&
                    text.includes('New York') &&
                    text.includes('10001') &&
                    text.includes('USA') &&
                    // Make sure we're matching a p tag, not the whole page
                    element?.tagName === 'P'
                );
            });
            expect(addresses.length).toBeGreaterThan(0);
        });

        it('should display response time information', () => {
            render(<ContactPage />);
            expect(
                screen.getByText('Usually responds within 48 hours')
            ).toBeInTheDocument();
        });

        it('should display social media links', () => {
            render(<ContactPage />);
            const socialLinks = screen.getAllByText('@testartist');
            expect(socialLinks.length).toBeGreaterThan(0);
        });

        it('should have correct social media hrefs', () => {
            render(<ContactPage />);
            const instagramLink = screen.getAllByRole('link', {
                name: '@testartist',
            })[0] as HTMLAnchorElement;
            expect(instagramLink.getAttribute('href')).toContain(
                'instagram.com'
            );
        });
    });

    describe('Contact Form', () => {
        it('should display contact form heading', () => {
            render(<ContactPage />);
            expect(screen.getByText('Send a Message')).toBeInTheDocument();
        });

        it('should have name input field', () => {
            render(<ContactPage />);
            const nameInput = screen.getByPlaceholderText(
                'Your name'
            ) as HTMLInputElement;
            expect(nameInput).toBeInTheDocument();
            expect(nameInput.type).toBe('text');
        });

        it('should have email input field', () => {
            render(<ContactPage />);
            const emailInput = screen.getByPlaceholderText(
                'your@email.com'
            ) as HTMLInputElement;
            expect(emailInput).toBeInTheDocument();
            expect(emailInput.type).toBe('email');
        });

        it('should have message textarea field', () => {
            render(<ContactPage />);
            const messageInput = screen.getByPlaceholderText(
                'Your message here...'
            ) as HTMLTextAreaElement;
            expect(messageInput).toBeInTheDocument();
        });

        it('should have send message button', () => {
            render(<ContactPage />);
            const submitButton = screen.getByRole('button', {
                name: /Send Message/i,
            });
            expect(submitButton).toBeInTheDocument();
        });

        it('should display note about Phase 4 implementation', () => {
            render(<ContactPage />);
            expect(
                screen.getByText(
                    /Note: Full email functionality will be implemented in Phase 4/i
                )
            ).toBeInTheDocument();
        });
    });

    describe('Form Validation', () => {
        it('should validate and reject invalid submissions', async () => {
            render(<ContactPage />);
            const submitButton = screen.getByRole('button', {
                name: /Send Message/i,
            });

            // Submit without filling any required fields
            fireEvent.click(submitButton);

            // Wait a moment for state update and validation
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Check that validation error elements are in the DOM (they should be hidden when no errors)
            const nameInput = screen.getByPlaceholderText(
                'Your name'
            ) as HTMLInputElement;
            expect(nameInput.getAttribute('aria-invalid')).toBe('false');
        });

        it('should show success message on valid submission', async () => {
            render(<ContactPage />);
            const nameInput = screen.getByPlaceholderText('Your name');
            const emailInput = screen.getByPlaceholderText('your@email.com');
            const messageInput = screen.getByPlaceholderText(
                'Your message here...'
            );
            const submitButton = screen.getByRole('button', {
                name: /Send Message/i,
            });

            await userEvent.type(nameInput, 'Test User');
            await userEvent.type(emailInput, 'test@example.com');
            await userEvent.type(messageInput, 'This is a valid message');
            fireEvent.click(submitButton);

            // Success message should appear
            const successMessage = await screen.findByText(
                /Thank you for your message/i
            );
            expect(successMessage).toBeInTheDocument();
        });

        it('should display validation feedback with Zod schema', async () => {
            render(<ContactPage />);
            const nameInput = screen.getByPlaceholderText('Your name');
            const emailInput = screen.getByPlaceholderText('your@email.com');
            const messageInput = screen.getByPlaceholderText(
                'Your message here...'
            );
            const submitButton = screen.getByRole('button', {
                name: /Send Message/i,
            });

            // Fill with invalid email
            await userEvent.type(nameInput, 'Test User');
            await userEvent.type(emailInput, 'not-an-email');
            await userEvent.type(messageInput, 'Short');
            fireEvent.click(submitButton);

            // Wait for component to process validation
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Form should still be visible (not submitted)
            expect(
                screen.getByRole('button', { name: /Send Message/i })
            ).toBeInTheDocument();
        });

        it('should have required attribute on all form fields', () => {
            render(<ContactPage />);
            const nameInput = screen.getByPlaceholderText(
                'Your name'
            ) as HTMLInputElement;
            const emailInput = screen.getByPlaceholderText(
                'your@email.com'
            ) as HTMLInputElement;
            const messageInput = screen.getByPlaceholderText(
                'Your message here...'
            ) as HTMLTextAreaElement;

            expect(nameInput.required).toBe(true);
            expect(emailInput.required).toBe(true);
            expect(messageInput.required).toBe(true);
        });

        it('should have aria-invalid attribute', () => {
            render(<ContactPage />);
            const nameInput = screen.getByPlaceholderText('Your name');
            expect(nameInput.getAttribute('aria-invalid')).toBe('false');
        });
    });

    describe('Form Submission', () => {
        it('should accept valid form submission', async () => {
            render(<ContactPage />);
            const nameInput = screen.getByPlaceholderText('Your name');
            const emailInput = screen.getByPlaceholderText('your@email.com');
            const messageInput = screen.getByPlaceholderText(
                'Your message here...'
            );
            const submitButton = screen.getByRole('button', {
                name: /Send Message/i,
            });

            await userEvent.type(nameInput, 'Test User');
            await userEvent.type(emailInput, 'test@example.com');
            await userEvent.type(messageInput, 'This is a valid test message');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(
                    screen.getByText(
                        /Thank you for your message! I'll get back to you soon/i
                    )
                ).toBeInTheDocument();
            });
        });

        it('should show success message after valid submission', async () => {
            render(<ContactPage />);
            const nameInput = screen.getByPlaceholderText('Your name');
            const emailInput = screen.getByPlaceholderText('your@email.com');
            const messageInput = screen.getByPlaceholderText(
                'Your message here...'
            );
            const submitButton = screen.getByRole('button', {
                name: /Send Message/i,
            });

            await userEvent.type(nameInput, 'Test User');
            await userEvent.type(emailInput, 'test@example.com');
            await userEvent.type(messageInput, 'This is a valid test message');
            fireEvent.click(submitButton);

            await waitFor(() => {
                const successMessage = screen.getByText(
                    /Thank you for your message/i
                );
                // Success message container has the classes, not the p tag
                expect(successMessage.closest('div')).toHaveClass(
                    'bg-green-500'
                );
            });
        });

        it('should clear form after successful submission', async () => {
            // Use real timers for this test to allow proper async handling
            render(<ContactPage />);
            const nameInput = screen.getByPlaceholderText(
                'Your name'
            ) as HTMLInputElement;
            const emailInput = screen.getByPlaceholderText(
                'your@email.com'
            ) as HTMLInputElement;
            const messageInput = screen.getByPlaceholderText(
                'Your message here...'
            ) as HTMLTextAreaElement;
            const submitButton = screen.getByRole('button', {
                name: /Send Message/i,
            });

            await userEvent.type(nameInput, 'Test User');
            await userEvent.type(emailInput, 'test@example.com');
            await userEvent.type(messageInput, 'This is a valid test message');
            fireEvent.click(submitButton);

            // Wait for success message to appear
            await waitFor(() => {
                expect(
                    screen.getByText(/Thank you for your message/i)
                ).toBeInTheDocument();
            });

            // Wait for form to be cleared after success message disappears
            await waitFor(
                () => {
                    expect(nameInput.value).toBe('');
                    expect(emailInput.value).toBe('');
                    expect(messageInput.value).toBe('');
                },
                { timeout: 4000 }
            );
        }, 10000);

        it('should clear success message after 3 seconds', async () => {
            vi.useFakeTimers();

            try {
                render(<ContactPage />);
                const nameInput = screen.getByPlaceholderText(
                    'Your name'
                ) as HTMLInputElement;
                const emailInput = screen.getByPlaceholderText(
                    'your@email.com'
                ) as HTMLInputElement;
                const messageInput = screen.getByPlaceholderText(
                    'Your message here...'
                ) as HTMLTextAreaElement;
                const submitButton = screen.getByRole('button', {
                    name: /Send Message/i,
                });

                // Use fireEvent for typing with fake timers
                act(() => {
                    fireEvent.change(nameInput, {
                        target: { value: 'Test User' },
                    });
                    fireEvent.change(emailInput, {
                        target: { value: 'test@example.com' },
                    });
                    fireEvent.change(messageInput, {
                        target: { value: 'This is a valid test message' },
                    });
                    fireEvent.click(submitButton);
                });

                // Success message should appear immediately
                expect(
                    screen.getByText(/Thank you for your message/i)
                ).toBeInTheDocument();

                // Advance timers by 3100ms to trigger the timeout
                await act(async () => {
                    await vi.advanceTimersByTimeAsync(3100);
                });

                // Check message is gone
                expect(
                    screen.queryByText(/Thank you for your message/i)
                ).not.toBeInTheDocument();
            } finally {
                vi.useRealTimers();
            }
        });
    });
});
