/**
 * Tests for Login Layout (Server Component)
 *
 * The login layout is a minimal server component that:
 * - Bypasses the admin layout wrapper
 * - Renders children directly without authentication checks
 * - Allows unauthenticated access to the login page
 * - Does not check for admin_session cookie
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginLayout from '@/app/admin/login/layout';

describe('LoginLayout', () => {
    describe('Core Functionality', () => {
        it('should render children directly', () => {
            const layout = LoginLayout({
                children: <div data-testid="test-child">Login Form</div>,
            });
            render(layout);

            expect(screen.getByTestId('test-child')).toBeInTheDocument();
            expect(screen.getByText('Login Form')).toBeInTheDocument();
        });

        it('should render as a fragment without wrapper elements', () => {
            const layout = LoginLayout({
                children: <div>Test Content</div>,
            });
            const { container } = render(layout);

            // The layout should render only the children, no wrapper div
            // Container should have only the children elements
            const childElements = container.querySelectorAll('div');
            expect(childElements).toHaveLength(1);
            expect(childElements[0]).toHaveTextContent('Test Content');
        });

        it('should accept children prop', () => {
            const layout = LoginLayout({
                children: <p>Login page content</p>,
            });
            render(layout);

            expect(screen.getByText('Login page content')).toBeInTheDocument();
        });
    });

    describe('Children Rendering', () => {
        it('should render simple text children', () => {
            const layout = LoginLayout({
                children: 'Plain text child',
            });
            render(layout);

            expect(screen.getByText('Plain text child')).toBeInTheDocument();
        });

        it('should render complex JSX children', () => {
            const layout = LoginLayout({
                children: (
                    <div>
                        <h1>Login</h1>
                        <form>
                            <input type="email" placeholder="Email" />
                            <input type="password" placeholder="Password" />
                            <button type="submit">Submit</button>
                        </form>
                    </div>
                ),
            });
            render(layout);

            expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
                'Login'
            );
            expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: 'Submit' })
            ).toBeInTheDocument();
        });

        it('should render multiple children elements', () => {
            const layout = LoginLayout({
                children: (
                    <>
                        <header>Header</header>
                        <main>Main Content</main>
                        <footer>Footer</footer>
                    </>
                ),
            });
            render(layout);

            expect(screen.getByText('Header')).toBeInTheDocument();
            expect(screen.getByText('Main Content')).toBeInTheDocument();
            expect(screen.getByText('Footer')).toBeInTheDocument();
        });

        it('should render nested component children', () => {
            const NestedComponent = () => (
                <div>
                    <span>Nested</span>
                    <span>Component</span>
                </div>
            );

            const layout = LoginLayout({
                children: <NestedComponent />,
            });
            render(layout);

            expect(screen.getByText('Nested')).toBeInTheDocument();
            expect(screen.getByText('Component')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle null children gracefully', () => {
            const layout = LoginLayout({
                children: null,
            });
            const { container } = render(layout);

            // Should render without errors, container will be empty
            expect(container.innerHTML).toBe('');
        });

        it('should handle undefined children gracefully', () => {
            const layout = LoginLayout({
                children: undefined,
            });
            const { container } = render(layout);

            // Should render without errors, container will be empty
            expect(container.innerHTML).toBe('');
        });

        it('should handle empty fragment as children', () => {
            const layout = LoginLayout({
                children: <></>,
            });
            const { container } = render(layout);

            // Empty fragment should render without content
            expect(container.innerHTML).toBe('');
        });

        it('should handle children with special characters', () => {
            const layout = LoginLayout({
                children: <div>Special: &lt;&gt;&amp;&quot;&#39;</div>,
            });
            render(layout);

            expect(screen.getByText(/Special:/)).toBeInTheDocument();
        });

        it('should handle children with unicode characters', () => {
            const layout = LoginLayout({
                children: <div>Unicode: 你好 مرحبا здравствуйте</div>,
            });
            render(layout);

            expect(
                screen.getByText(/Unicode: 你好 مرحبا здравствуйте/)
            ).toBeInTheDocument();
        });

        it('should handle children with emojis', () => {
            const layout = LoginLayout({
                children: <div>Emojis: 😀 🎉 ✨</div>,
            });
            render(layout);

            expect(screen.getByText(/Emojis: 😀 🎉 ✨/)).toBeInTheDocument();
        });
    });

    describe('Layout Characteristics', () => {
        it('should not apply any wrapper classes or styles', () => {
            const layout = LoginLayout({
                children: <div data-testid="content">Content</div>,
            });
            const { container } = render(layout);

            // The container should only have the child element, no wrapper
            const testElement = screen.getByTestId('content');
            expect(testElement.parentElement).toBe(container);
        });

        it('should not add any admin layout components', () => {
            const layout = LoginLayout({
                children: <div>Login</div>,
            });
            const { container } = render(layout);

            // Should not contain any admin-specific elements
            expect(
                container.querySelector('[data-testid="admin-layout-client"]')
            ).not.toBeInTheDocument();
            expect(
                container.querySelector('[data-testid="admin-name"]')
            ).not.toBeInTheDocument();
            expect(
                container.querySelector('[data-testid="admin-role"]')
            ).not.toBeInTheDocument();
        });

        it('should not perform authentication checks', () => {
            // This test verifies the layout doesn't throw errors or redirect
            // when there's no session cookie (unlike the admin layout)
            const layout = LoginLayout({
                children: <div>Unauthenticated Access Allowed</div>,
            });

            // Should render without errors
            render(layout);
            expect(
                screen.getByText('Unauthenticated Access Allowed')
            ).toBeInTheDocument();
        });

        it('should allow public access without session validation', () => {
            const layout = LoginLayout({
                children: (
                    <div>
                        <h1>Public Login Page</h1>
                        <p>No authentication required</p>
                    </div>
                ),
            });
            render(layout);

            // Should render all content without authentication
            expect(
                screen.getByRole('heading', { name: 'Public Login Page' })
            ).toBeInTheDocument();
            expect(
                screen.getByText('No authentication required')
            ).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should preserve semantic HTML from children', () => {
            const layout = LoginLayout({
                children: (
                    <main>
                        <h1>Login</h1>
                        <form aria-label="Login form">
                            <input type="email" aria-label="Email address" />
                            <input type="password" aria-label="Password" />
                            <button type="submit">Log in</button>
                        </form>
                    </main>
                ),
            });
            render(layout);

            // Verify semantic elements are preserved
            expect(screen.getByRole('main')).toBeInTheDocument();
            expect(
                screen.getByRole('heading', { level: 1 })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('form', { name: 'Login form' })
            ).toBeInTheDocument();
            expect(screen.getByLabelText('Email address')).toBeInTheDocument();
            expect(screen.getByLabelText('Password')).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: 'Log in' })
            ).toBeInTheDocument();
        });

        it('should preserve ARIA attributes from children', () => {
            const layout = LoginLayout({
                children: (
                    <div
                        role="region"
                        aria-label="Login area"
                        aria-describedby="login-description"
                    >
                        <p id="login-description">
                            Enter your credentials to access the admin panel
                        </p>
                    </div>
                ),
            });
            render(layout);

            const region = screen.getByRole('region', { name: 'Login area' });
            expect(region).toBeInTheDocument();
            expect(region).toHaveAttribute(
                'aria-describedby',
                'login-description'
            );
            expect(
                screen.getByText(/Enter your credentials/)
            ).toBeInTheDocument();
        });

        it('should not interfere with child component focus management', () => {
            const layout = LoginLayout({
                children: (
                    <div>
                        <input data-testid="input-1" type="text" />
                        <input data-testid="input-2" type="text" />
                        <button data-testid="button-1">Click</button>
                    </div>
                ),
            });
            render(layout);

            // All interactive elements should be accessible
            expect(screen.getByTestId('input-1')).toBeInTheDocument();
            expect(screen.getByTestId('input-2')).toBeInTheDocument();
            expect(screen.getByTestId('button-1')).toBeInTheDocument();
        });
    });

    describe('TypeScript Type Compliance', () => {
        it('should accept React.ReactNode as children type', () => {
            // Test various valid React.ReactNode types
            const stringChild = LoginLayout({ children: 'string' });
            const numberChild = LoginLayout({ children: 123 });
            const elementChild = LoginLayout({ children: <div>element</div> });
            const fragmentChild = LoginLayout({
                children: (
                    <>
                        <div>fragment</div>
                    </>
                ),
            });

            render(stringChild);
            expect(screen.getByText('string')).toBeInTheDocument();

            render(numberChild);
            expect(screen.getByText('123')).toBeInTheDocument();

            render(elementChild);
            expect(screen.getByText('element')).toBeInTheDocument();

            render(fragmentChild);
            expect(screen.getByText('fragment')).toBeInTheDocument();
        });

        it('should work with array of children', () => {
            const layout = LoginLayout({
                children: [
                    <div key="1">Child 1</div>,
                    <div key="2">Child 2</div>,
                    <div key="3">Child 3</div>,
                ],
            });
            render(layout);

            expect(screen.getByText('Child 1')).toBeInTheDocument();
            expect(screen.getByText('Child 2')).toBeInTheDocument();
            expect(screen.getByText('Child 3')).toBeInTheDocument();
        });
    });

    describe('Comparison with Admin Layout', () => {
        it('should be simpler than admin layout (no session handling)', () => {
            // Admin layout requires session cookies and validation
            // Login layout should render without any session requirements
            const layout = LoginLayout({
                children: <div>No session required</div>,
            });
            render(layout);

            // Should render successfully without any session-related errors
            expect(screen.getByText('No session required')).toBeInTheDocument();
        });

        it('should not display session error messages', () => {
            const layout = LoginLayout({
                children: <div>Login Page</div>,
            });
            const { container } = render(layout);

            // Should not show any session-related error messages
            expect(
                screen.queryByText(/Session not found/i)
            ).not.toBeInTheDocument();
            expect(
                screen.queryByText(/Invalid session/i)
            ).not.toBeInTheDocument();
            expect(screen.queryByText(/log in/i)).not.toBeInTheDocument();
            expect(
                container.querySelector('.text-red-600')
            ).not.toBeInTheDocument();
        });

        it('should not render AdminLayoutClient component', () => {
            const layout = LoginLayout({
                children: <div>Content</div>,
            });
            const { container } = render(layout);

            // Should not contain AdminLayoutClient wrapper
            expect(
                container.querySelector('[data-testid="admin-layout-client"]')
            ).not.toBeInTheDocument();
        });
    });
});
