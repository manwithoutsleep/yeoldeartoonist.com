import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PublicLayoutWrapper } from '@/components/layout/PublicLayoutWrapper';

// Create a mock function that we can control
const mockUsePathname = vi.fn();

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
    usePathname: () => mockUsePathname(),
}));

// Mock layout components
vi.mock('@/components/layout/Header', () => ({
    Header: () => <header data-testid="header">Header</header>,
}));

vi.mock('@/components/layout/Navigation', () => ({
    Navigation: () => <nav data-testid="navigation">Navigation</nav>,
}));

vi.mock('@/components/layout/Footer', () => ({
    Footer: () => <footer data-testid="footer">Footer</footer>,
}));

describe('PublicLayoutWrapper', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Admin pages', () => {
        it('should render children without public layout on /admin', () => {
            mockUsePathname.mockReturnValue('/admin');

            render(
                <PublicLayoutWrapper>
                    <div data-testid="child">Admin Content</div>
                </PublicLayoutWrapper>
            );

            // Children should be rendered
            expect(screen.getByTestId('child')).toBeInTheDocument();

            // Public layout components should NOT be rendered
            expect(screen.queryByTestId('header')).not.toBeInTheDocument();
            expect(screen.queryByTestId('navigation')).not.toBeInTheDocument();
            expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
        });

        it('should render children without public layout on /admin/login', () => {
            mockUsePathname.mockReturnValue('/admin/login');

            render(
                <PublicLayoutWrapper>
                    <div data-testid="child">Login Content</div>
                </PublicLayoutWrapper>
            );

            expect(screen.getByTestId('child')).toBeInTheDocument();
            expect(screen.queryByTestId('header')).not.toBeInTheDocument();
            expect(screen.queryByTestId('navigation')).not.toBeInTheDocument();
            expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
        });

        it('should render children without public layout on nested admin paths', () => {
            mockUsePathname.mockReturnValue('/admin/products/123/edit');

            render(
                <PublicLayoutWrapper>
                    <div data-testid="child">Edit Product</div>
                </PublicLayoutWrapper>
            );

            expect(screen.getByTestId('child')).toBeInTheDocument();
            expect(screen.queryByTestId('header')).not.toBeInTheDocument();
            expect(screen.queryByTestId('navigation')).not.toBeInTheDocument();
            expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
        });

        it('should not render main tag wrapper on admin pages', () => {
            mockUsePathname.mockReturnValue('/admin');

            const { container } = render(
                <PublicLayoutWrapper>
                    <div data-testid="child">Content</div>
                </PublicLayoutWrapper>
            );

            expect(container.querySelector('main')).not.toBeInTheDocument();
        });

        it('should not render public-layout class on admin pages', () => {
            mockUsePathname.mockReturnValue('/admin');

            const { container } = render(
                <PublicLayoutWrapper>
                    <div>Content</div>
                </PublicLayoutWrapper>
            );

            expect(
                container.querySelector('.public-layout')
            ).not.toBeInTheDocument();
        });
    });

    describe('Public pages', () => {
        it('should render Header, Navigation, and Footer on root path', () => {
            mockUsePathname.mockReturnValue('/');

            render(
                <PublicLayoutWrapper>
                    <div data-testid="child">Home Content</div>
                </PublicLayoutWrapper>
            );

            expect(screen.getByTestId('header')).toBeInTheDocument();
            expect(screen.getByTestId('navigation')).toBeInTheDocument();
            expect(screen.getByTestId('footer')).toBeInTheDocument();
            expect(screen.getByTestId('child')).toBeInTheDocument();
        });

        it('should render Header, Navigation, and Footer on /gallery', () => {
            mockUsePathname.mockReturnValue('/gallery');

            render(
                <PublicLayoutWrapper>
                    <div data-testid="child">Gallery Content</div>
                </PublicLayoutWrapper>
            );

            expect(screen.getByTestId('header')).toBeInTheDocument();
            expect(screen.getByTestId('navigation')).toBeInTheDocument();
            expect(screen.getByTestId('footer')).toBeInTheDocument();
            expect(screen.getByTestId('child')).toBeInTheDocument();
        });

        it('should wrap children in main tag', () => {
            mockUsePathname.mockReturnValue('/');

            render(
                <PublicLayoutWrapper>
                    <div data-testid="child">Content</div>
                </PublicLayoutWrapper>
            );

            const main = screen.getByRole('main');
            expect(main).toBeInTheDocument();
            expect(main).toContainElement(screen.getByTestId('child'));
        });

        it('should apply public-layout class to wrapper', () => {
            mockUsePathname.mockReturnValue('/');

            const { container } = render(
                <PublicLayoutWrapper>
                    <div>Content</div>
                </PublicLayoutWrapper>
            );

            expect(
                container.querySelector('.public-layout')
            ).toBeInTheDocument();
        });

        it('should render components in correct order (Header, Navigation, main, Footer)', () => {
            mockUsePathname.mockReturnValue('/');

            const { container } = render(
                <PublicLayoutWrapper>
                    <div data-testid="child">Content</div>
                </PublicLayoutWrapper>
            );

            const wrapper = container.querySelector('.public-layout');
            expect(wrapper).toBeInTheDocument();

            const children = wrapper!.children;
            expect(children).toHaveLength(4);

            // Check order
            expect(children[0].tagName).toBe('HEADER');
            expect(children[1].tagName).toBe('NAV');
            expect(children[2].tagName).toBe('MAIN');
            expect(children[3].tagName).toBe('FOOTER');
        });
    });

    describe('Edge cases', () => {
        it('should handle paths that contain "admin" but do not start with /admin', () => {
            mockUsePathname.mockReturnValue('/user/administrator');

            render(
                <PublicLayoutWrapper>
                    <div data-testid="child">User Content</div>
                </PublicLayoutWrapper>
            );

            // Should be treated as public page
            expect(screen.getByTestId('header')).toBeInTheDocument();
            expect(screen.getByTestId('navigation')).toBeInTheDocument();
            expect(screen.getByTestId('footer')).toBeInTheDocument();
        });

        it('should handle null pathname gracefully', () => {
            mockUsePathname.mockReturnValue(null);

            render(
                <PublicLayoutWrapper>
                    <div data-testid="child">Content</div>
                </PublicLayoutWrapper>
            );

            // Should treat as public page when pathname is null
            expect(screen.getByTestId('header')).toBeInTheDocument();
            expect(screen.getByTestId('navigation')).toBeInTheDocument();
            expect(screen.getByTestId('footer')).toBeInTheDocument();
            expect(screen.getByTestId('child')).toBeInTheDocument();
        });

        it('should handle undefined pathname gracefully', () => {
            mockUsePathname.mockReturnValue(undefined as unknown as string);

            render(
                <PublicLayoutWrapper>
                    <div data-testid="child">Content</div>
                </PublicLayoutWrapper>
            );

            // Should treat as public page when pathname is undefined
            expect(screen.getByTestId('header')).toBeInTheDocument();
            expect(screen.getByTestId('navigation')).toBeInTheDocument();
            expect(screen.getByTestId('footer')).toBeInTheDocument();
            expect(screen.getByTestId('child')).toBeInTheDocument();
        });

        it('should always render children regardless of path type', () => {
            const testCases = [
                '/admin',
                '/admin/products',
                '/',
                '/gallery',
                '/about',
            ];

            testCases.forEach((path) => {
                mockUsePathname.mockReturnValue(path);

                const { unmount } = render(
                    <PublicLayoutWrapper>
                        <div data-testid="child">Test Content</div>
                    </PublicLayoutWrapper>
                );

                expect(screen.getByTestId('child')).toBeInTheDocument();
                expect(screen.getByText('Test Content')).toBeInTheDocument();

                unmount();
            });
        });

        it('should handle complex children correctly', () => {
            mockUsePathname.mockReturnValue('/');

            render(
                <PublicLayoutWrapper>
                    <div>
                        <h1>Title</h1>
                        <p>Paragraph</p>
                        <button>Click me</button>
                    </div>
                </PublicLayoutWrapper>
            );

            expect(screen.getByText('Title')).toBeInTheDocument();
            expect(screen.getByText('Paragraph')).toBeInTheDocument();
            expect(screen.getByText('Click me')).toBeInTheDocument();
        });
    });
});
