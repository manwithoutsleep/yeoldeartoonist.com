import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '@/app/error';
import GlobalErrorBoundary from '@/app/global-error';

/**
 * Tests for Error Boundary Components
 *
 * These tests verify that error boundaries:
 * - Render correctly with error information
 * - Log errors appropriately in dev/prod environments
 * - Provide user-friendly recovery options
 * - Display error details only in development
 */

describe('Error Boundary (error.tsx)', () => {
    const mockReset = vi.fn();
    const mockError = new Error('Test error message');
    const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        consoleErrorSpy.mockClear();
    });

    it('should render error heading', () => {
        render(<ErrorBoundary error={mockError} reset={mockReset} />);
        expect(screen.getByText('Oops!')).toBeInTheDocument();
    });

    it('should render error description', () => {
        render(<ErrorBoundary error={mockError} reset={mockReset} />);
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(
            screen.getByText(/We encountered an unexpected error/i)
        ).toBeInTheDocument();
    });

    it('should render Try Again button', () => {
        render(<ErrorBoundary error={mockError} reset={mockReset} />);
        const tryAgainButton = screen.getByRole('button', {
            name: /try again/i,
        });
        expect(tryAgainButton).toBeInTheDocument();
    });

    it('should render Go Home link', () => {
        render(<ErrorBoundary error={mockError} reset={mockReset} />);
        const goHomeLink = screen.getByRole('link', { name: /go home/i });
        expect(goHomeLink).toBeInTheDocument();
        expect(goHomeLink.getAttribute('href')).toBe('/');
    });

    it('should call reset function when Try Again is clicked', () => {
        render(<ErrorBoundary error={mockError} reset={mockReset} />);
        const tryAgainButton = screen.getByRole('button', {
            name: /try again/i,
        });
        fireEvent.click(tryAgainButton);
        expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it('should log error to console in development mode', () => {
        vi.stubEnv('NODE_ENV', 'development');

        render(<ErrorBoundary error={mockError} reset={mockReset} />);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error boundary caught:',
            mockError
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error stack:',
            mockError.stack
        );

        vi.unstubAllEnvs();
    });

    it('should log minimal error info in production mode', () => {
        vi.stubEnv('NODE_ENV', 'production');

        render(<ErrorBoundary error={mockError} reset={mockReset} />);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Application error:',
            'Test error message'
        );

        vi.unstubAllEnvs();
    });

    it('should log error digest when present in development', () => {
        vi.stubEnv('NODE_ENV', 'development');

        const errorWithDigest = new Error('Test error') as Error & {
            digest?: string;
        };
        errorWithDigest.digest = 'abc123';

        render(<ErrorBoundary error={errorWithDigest} reset={mockReset} />);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error digest:', 'abc123');

        vi.unstubAllEnvs();
    });

    it('should log error digest when present in production', () => {
        vi.stubEnv('NODE_ENV', 'production');

        const errorWithDigest = new Error('Test error') as Error & {
            digest?: string;
        };
        errorWithDigest.digest = 'abc123';

        render(<ErrorBoundary error={errorWithDigest} reset={mockReset} />);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error digest:', 'abc123');

        vi.unstubAllEnvs();
    });

    it('should display error message in development mode only', () => {
        vi.stubEnv('NODE_ENV', 'development');

        render(<ErrorBoundary error={mockError} reset={mockReset} />);

        expect(
            screen.getByText('Development Error Details:')
        ).toBeInTheDocument();
        expect(screen.getByText('Test error message')).toBeInTheDocument();

        vi.unstubAllEnvs();
    });

    it('should not display error message in production mode', () => {
        vi.stubEnv('NODE_ENV', 'production');

        const { container } = render(
            <ErrorBoundary error={mockError} reset={mockReset} />
        );

        expect(
            screen.queryByText('Development Error Details:')
        ).not.toBeInTheDocument();
        // Error message should not be visible in a dev-only section
        const errorDetailsDiv = container.querySelector('.bg-red-50');
        expect(errorDetailsDiv).not.toBeInTheDocument();

        vi.unstubAllEnvs();
    });

    it('should display error digest in development mode when present', () => {
        vi.stubEnv('NODE_ENV', 'development');

        const errorWithDigest = new Error('Test error') as Error & {
            digest?: string;
        };
        errorWithDigest.digest = 'digest-abc123';

        render(<ErrorBoundary error={errorWithDigest} reset={mockReset} />);

        expect(screen.getByText(/Digest: digest-abc123/i)).toBeInTheDocument();

        vi.unstubAllEnvs();
    });

    it('should render navigation links in footer', () => {
        render(<ErrorBoundary error={mockError} reset={mockReset} />);

        const galleryLink = screen.getByRole('link', { name: /gallery/i });
        const shoppeLink = screen.getByRole('link', { name: /shoppe/i });
        const aboutLink = screen.getByRole('link', { name: /about/i });
        const contactLink = screen.getByRole('link', { name: /contact/i });

        expect(galleryLink).toBeInTheDocument();
        expect(galleryLink.getAttribute('href')).toBe('/gallery');

        expect(shoppeLink).toBeInTheDocument();
        expect(shoppeLink.getAttribute('href')).toBe('/shoppe');

        expect(aboutLink).toBeInTheDocument();
        expect(aboutLink.getAttribute('href')).toBe('/about');

        expect(contactLink).toBeInTheDocument();
        expect(contactLink.getAttribute('href')).toBe('/contact');
    });

    it('should have proper styling classes', () => {
        const { container } = render(
            <ErrorBoundary error={mockError} reset={mockReset} />
        );

        const mainDiv = container.querySelector('.min-h-screen');
        expect(mainDiv).toBeInTheDocument();
    });
});

describe('Global Error Boundary (global-error.tsx)', () => {
    const mockReset = vi.fn();
    const mockError = new Error('Critical test error');
    const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        consoleErrorSpy.mockClear();
    });

    it('should render critical error heading', () => {
        render(<GlobalErrorBoundary error={mockError} reset={mockReset} />);
        expect(screen.getByText('Critical Error')).toBeInTheDocument();
    });

    it('should render error description', () => {
        render(<GlobalErrorBoundary error={mockError} reset={mockReset} />);
        expect(
            screen.getByText(/We encountered a critical error/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Something went seriously wrong/i)
        ).toBeInTheDocument();
    });

    it('should include html tag with lang attribute', () => {
        const { container } = render(
            <GlobalErrorBoundary error={mockError} reset={mockReset} />
        );
        const html = container.closest('html');
        expect(html).toBeInTheDocument();
        expect(html?.getAttribute('lang')).toBe('en');
    });

    it('should include head with meta tags', () => {
        render(<GlobalErrorBoundary error={mockError} reset={mockReset} />);
        const title = document.querySelector('title');
        expect(title?.textContent).toBe('Error - Ye Olde Artoonist');
    });

    it('should include body tag', () => {
        const { container } = render(
            <GlobalErrorBoundary error={mockError} reset={mockReset} />
        );
        const body = container.closest('body');
        expect(body).toBeInTheDocument();
    });

    it('should render Try Again button', () => {
        render(<GlobalErrorBoundary error={mockError} reset={mockReset} />);
        const buttons = screen.getAllByRole('button', { name: /try again/i });
        expect(buttons.length).toBeGreaterThan(0);
    });

    it('should render Go Home button', () => {
        render(<GlobalErrorBoundary error={mockError} reset={mockReset} />);
        const buttons = screen.getAllByRole('button', { name: /go home/i });
        expect(buttons.length).toBeGreaterThan(0);
    });

    it('should call reset function when Try Again is clicked', () => {
        render(<GlobalErrorBoundary error={mockError} reset={mockReset} />);
        const tryAgainButtons = screen.getAllByRole('button', {
            name: /try again/i,
        });
        fireEvent.click(tryAgainButtons[0]);
        expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it('should log error to console in development mode', () => {
        vi.stubEnv('NODE_ENV', 'development');

        render(<GlobalErrorBoundary error={mockError} reset={mockReset} />);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Global error boundary caught:',
            mockError
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error stack:',
            mockError.stack
        );

        vi.unstubAllEnvs();
    });

    it('should log minimal error info in production mode', () => {
        vi.stubEnv('NODE_ENV', 'production');

        render(<GlobalErrorBoundary error={mockError} reset={mockReset} />);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Critical application error:',
            'Critical test error'
        );

        vi.unstubAllEnvs();
    });

    it('should log error digest when present in development', () => {
        vi.stubEnv('NODE_ENV', 'development');

        const errorWithDigest = new Error('Critical test error') as Error & {
            digest?: string;
        };
        errorWithDigest.digest = 'xyz789';

        render(
            <GlobalErrorBoundary error={errorWithDigest} reset={mockReset} />
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error digest:', 'xyz789');

        vi.unstubAllEnvs();
    });

    it('should log error digest when present in production', () => {
        vi.stubEnv('NODE_ENV', 'production');

        const errorWithDigest = new Error('Critical test error') as Error & {
            digest?: string;
        };
        errorWithDigest.digest = 'xyz789';

        render(
            <GlobalErrorBoundary error={errorWithDigest} reset={mockReset} />
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error digest:', 'xyz789');

        vi.unstubAllEnvs();
    });

    it('should display error message in development mode only', () => {
        vi.stubEnv('NODE_ENV', 'development');

        render(<GlobalErrorBoundary error={mockError} reset={mockReset} />);

        expect(
            screen.getByText('Development Error Details:')
        ).toBeInTheDocument();
        expect(screen.getByText('Critical test error')).toBeInTheDocument();

        vi.unstubAllEnvs();
    });

    it('should not display error message in production mode', () => {
        vi.stubEnv('NODE_ENV', 'production');

        const { container } = render(
            <GlobalErrorBoundary error={mockError} reset={mockReset} />
        );

        expect(
            screen.queryByText('Development Error Details:')
        ).not.toBeInTheDocument();
        // Error details div should not exist in production
        const errorDetailsDiv = container.querySelector('.error-details');
        expect(errorDetailsDiv).not.toBeInTheDocument();

        vi.unstubAllEnvs();
    });

    it('should display error digest in development mode when present', () => {
        vi.stubEnv('NODE_ENV', 'development');

        const errorWithDigest = new Error('Critical test error') as Error & {
            digest?: string;
        };
        errorWithDigest.digest = 'digest-xyz789';

        render(
            <GlobalErrorBoundary error={errorWithDigest} reset={mockReset} />
        );

        expect(screen.getByText(/Digest: digest-xyz789/i)).toBeInTheDocument();

        vi.unstubAllEnvs();
    });

    it('should use inline styles (for when external CSS fails)', () => {
        render(<GlobalErrorBoundary error={mockError} reset={mockReset} />);

        // Check that style tag exists with inline CSS
        const styleTags = document.querySelectorAll('style');
        expect(styleTags.length).toBeGreaterThan(0);

        // Verify some critical inline styles are present
        const styleContent = Array.from(styleTags)
            .map((tag) => tag.textContent)
            .join('');
        expect(styleContent).toContain('body');
        expect(styleContent).toContain('button');
    });

    it('should have minimal, self-contained structure', () => {
        const { container } = render(
            <GlobalErrorBoundary error={mockError} reset={mockReset} />
        );

        // Should have html root
        const html = container.closest('html');
        expect(html).toBeInTheDocument();

        // Should have body
        const body = container.closest('body');
        expect(body).toBeInTheDocument();

        // Should have container div
        const containerDiv = container.querySelector('.container');
        expect(containerDiv).toBeInTheDocument();
    });
});
