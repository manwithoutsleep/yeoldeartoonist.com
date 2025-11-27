import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';

// Mock AdminHeader component
vi.mock('@/components/admin/AdminHeader', () => ({
    AdminHeader: ({
        adminName,
        onMenuToggle,
    }: {
        adminName: string;
        onMenuToggle?: () => void;
    }) => (
        <header data-testid="admin-header">
            <span>{adminName}</span>
            {onMenuToggle && (
                <button onClick={onMenuToggle} aria-label="Toggle menu">
                    Menu
                </button>
            )}
        </header>
    ),
}));

// Mock AdminNavigation component
vi.mock('@/components/admin/AdminNavigation', () => ({
    AdminNavigation: ({
        role,
        isOpen,
        onClose,
    }: {
        role: string;
        isOpen: boolean;
        onClose: () => void;
    }) => (
        <nav data-testid="admin-navigation" data-role={role} data-open={isOpen}>
            <span>Navigation for {role}</span>
            <button onClick={onClose} aria-label="Close menu">
                Close
            </button>
        </nav>
    ),
}));

describe('AdminLayoutClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders with all required components', () => {
            render(
                <AdminLayoutClient adminName="John Doe" role="admin">
                    <div>Test Content</div>
                </AdminLayoutClient>
            );

            expect(screen.getByTestId('admin-header')).toBeInTheDocument();
            expect(screen.getByTestId('admin-navigation')).toBeInTheDocument();
            expect(screen.getByText('Test Content')).toBeInTheDocument();
        });

        it('renders children in main content area', () => {
            render(
                <AdminLayoutClient adminName="John Doe" role="admin">
                    <div data-testid="child-content">Child Component</div>
                </AdminLayoutClient>
            );

            const childContent = screen.getByTestId('child-content');
            expect(childContent).toBeInTheDocument();

            // Verify it's inside a main element
            const mainElement = childContent.closest('main');
            expect(mainElement).toBeInTheDocument();
        });

        it('applies correct layout classes', () => {
            const { container } = render(
                <AdminLayoutClient adminName="John Doe" role="admin">
                    <div>Content</div>
                </AdminLayoutClient>
            );

            const layoutDiv = container.querySelector('.admin-layout');
            expect(layoutDiv).toBeInTheDocument();
            expect(layoutDiv?.className).toMatch(/flex/);
            expect(layoutDiv?.className).toMatch(/flex-col/);
            expect(layoutDiv?.className).toMatch(/min-h-screen/);
        });

        it('has proper semantic HTML structure', () => {
            const { container } = render(
                <AdminLayoutClient adminName="John Doe" role="admin">
                    <div>Content</div>
                </AdminLayoutClient>
            );

            // Check for main content wrapper
            const main = container.querySelector('main');
            expect(main).toBeInTheDocument();
            expect(main?.className).toMatch(/flex-1/);
        });
    });

    describe('Mobile Menu State Management', () => {
        it('starts with mobile menu closed', () => {
            render(
                <AdminLayoutClient adminName="John Doe" role="admin">
                    <div>Content</div>
                </AdminLayoutClient>
            );

            const nav = screen.getByTestId('admin-navigation');
            expect(nav.getAttribute('data-open')).toBe('false');
        });

        it('opens mobile menu when header toggle is clicked', async () => {
            const user = userEvent.setup();

            render(
                <AdminLayoutClient adminName="John Doe" role="admin">
                    <div>Content</div>
                </AdminLayoutClient>
            );

            const toggleButton = screen.getByRole('button', {
                name: /toggle menu/i,
            });
            const nav = screen.getByTestId('admin-navigation');

            // Initially closed
            expect(nav.getAttribute('data-open')).toBe('false');

            // Click to open
            await user.click(toggleButton);
            expect(nav.getAttribute('data-open')).toBe('true');
        });

        it('closes mobile menu when toggle is clicked again', async () => {
            const user = userEvent.setup();

            render(
                <AdminLayoutClient adminName="John Doe" role="admin">
                    <div>Content</div>
                </AdminLayoutClient>
            );

            const toggleButton = screen.getByRole('button', {
                name: /toggle menu/i,
            });
            const nav = screen.getByTestId('admin-navigation');

            // Open menu
            await user.click(toggleButton);
            expect(nav.getAttribute('data-open')).toBe('true');

            // Close menu
            await user.click(toggleButton);
            expect(nav.getAttribute('data-open')).toBe('false');
        });

        it('closes mobile menu when navigation close is triggered', async () => {
            const user = userEvent.setup();

            render(
                <AdminLayoutClient adminName="John Doe" role="admin">
                    <div>Content</div>
                </AdminLayoutClient>
            );

            const toggleButton = screen.getByRole('button', {
                name: /toggle menu/i,
            });
            const closeButton = screen.getByRole('button', {
                name: /close menu/i,
            });
            const nav = screen.getByTestId('admin-navigation');

            // Open menu first
            await user.click(toggleButton);
            expect(nav.getAttribute('data-open')).toBe('true');

            // Close via navigation close button
            await user.click(closeButton);
            expect(nav.getAttribute('data-open')).toBe('false');
        });

        it('toggles menu state multiple times correctly', async () => {
            const user = userEvent.setup();

            render(
                <AdminLayoutClient adminName="John Doe" role="admin">
                    <div>Content</div>
                </AdminLayoutClient>
            );

            const toggleButton = screen.getByRole('button', {
                name: /toggle menu/i,
            });
            const nav = screen.getByTestId('admin-navigation');

            // Toggle multiple times
            await user.click(toggleButton); // Open
            expect(nav.getAttribute('data-open')).toBe('true');

            await user.click(toggleButton); // Close
            expect(nav.getAttribute('data-open')).toBe('false');

            await user.click(toggleButton); // Open
            expect(nav.getAttribute('data-open')).toBe('true');

            await user.click(toggleButton); // Close
            expect(nav.getAttribute('data-open')).toBe('false');
        });
    });

    describe('Prop Passing', () => {
        it('passes adminName to AdminHeader', () => {
            render(
                <AdminLayoutClient adminName="Jane Smith" role="admin">
                    <div>Content</div>
                </AdminLayoutClient>
            );

            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });

        it('passes role to AdminNavigation', () => {
            render(
                <AdminLayoutClient adminName="John Doe" role="super_admin">
                    <div>Content</div>
                </AdminLayoutClient>
            );

            const nav = screen.getByTestId('admin-navigation');
            expect(nav.getAttribute('data-role')).toBe('super_admin');
        });

        it('passes correct isOpen state to AdminNavigation', async () => {
            const user = userEvent.setup();

            render(
                <AdminLayoutClient adminName="John Doe" role="admin">
                    <div>Content</div>
                </AdminLayoutClient>
            );

            const toggleButton = screen.getByRole('button', {
                name: /toggle menu/i,
            });
            const nav = screen.getByTestId('admin-navigation');

            // Check initial state
            expect(nav.getAttribute('data-open')).toBe('false');

            // Toggle and check state updates
            await user.click(toggleButton);
            expect(nav.getAttribute('data-open')).toBe('true');
        });

        it('passes onMenuToggle callback to AdminHeader', () => {
            render(
                <AdminLayoutClient adminName="John Doe" role="admin">
                    <div>Content</div>
                </AdminLayoutClient>
            );

            // Verify the toggle button exists (which means callback was passed)
            const toggleButton = screen.getByRole('button', {
                name: /toggle menu/i,
            });
            expect(toggleButton).toBeInTheDocument();
        });

        it('passes onClose callback to AdminNavigation', () => {
            render(
                <AdminLayoutClient adminName="John Doe" role="admin">
                    <div>Content</div>
                </AdminLayoutClient>
            );

            // Verify the close button exists (which means callback was passed)
            const closeButton = screen.getByRole('button', {
                name: /close menu/i,
            });
            expect(closeButton).toBeInTheDocument();
        });
    });

    describe('Role Variants', () => {
        it('works correctly with admin role', () => {
            render(
                <AdminLayoutClient adminName="Admin User" role="admin">
                    <div>Content</div>
                </AdminLayoutClient>
            );

            const nav = screen.getByTestId('admin-navigation');
            expect(nav.getAttribute('data-role')).toBe('admin');
            expect(
                screen.getByText('Navigation for admin')
            ).toBeInTheDocument();
        });

        it('works correctly with super_admin role', () => {
            render(
                <AdminLayoutClient adminName="Super Admin" role="super_admin">
                    <div>Content</div>
                </AdminLayoutClient>
            );

            const nav = screen.getByTestId('admin-navigation');
            expect(nav.getAttribute('data-role')).toBe('super_admin');
            expect(
                screen.getByText('Navigation for super_admin')
            ).toBeInTheDocument();
        });

        it('renders different admin names correctly', () => {
            const { rerender } = render(
                <AdminLayoutClient adminName="First Admin" role="admin">
                    <div>Content</div>
                </AdminLayoutClient>
            );

            expect(screen.getByText('First Admin')).toBeInTheDocument();

            rerender(
                <AdminLayoutClient adminName="Second Admin" role="admin">
                    <div>Content</div>
                </AdminLayoutClient>
            );

            expect(screen.getByText('Second Admin')).toBeInTheDocument();
            expect(screen.queryByText('First Admin')).not.toBeInTheDocument();
        });
    });

    describe('Children Rendering', () => {
        it('renders multiple child elements', () => {
            render(
                <AdminLayoutClient adminName="John Doe" role="admin">
                    <div>First Child</div>
                    <div>Second Child</div>
                    <div>Third Child</div>
                </AdminLayoutClient>
            );

            expect(screen.getByText('First Child')).toBeInTheDocument();
            expect(screen.getByText('Second Child')).toBeInTheDocument();
            expect(screen.getByText('Third Child')).toBeInTheDocument();
        });

        it('renders complex child components', () => {
            const ComplexChild = () => (
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome to the admin panel</p>
                    <button>Action</button>
                </div>
            );

            render(
                <AdminLayoutClient adminName="John Doe" role="admin">
                    <ComplexChild />
                </AdminLayoutClient>
            );

            expect(screen.getByText('Dashboard')).toBeInTheDocument();
            expect(
                screen.getByText('Welcome to the admin panel')
            ).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: 'Action' })
            ).toBeInTheDocument();
        });

        it('handles empty children', () => {
            render(
                <AdminLayoutClient adminName="John Doe" role="admin">
                    {null}
                </AdminLayoutClient>
            );

            // Layout should still render even with no children
            expect(screen.getByTestId('admin-header')).toBeInTheDocument();
            expect(screen.getByTestId('admin-navigation')).toBeInTheDocument();
        });
    });

    describe('Layout Structure', () => {
        it('applies responsive container classes to main content', () => {
            const { container } = render(
                <AdminLayoutClient adminName="John Doe" role="admin">
                    <div>Content</div>
                </AdminLayoutClient>
            );

            const contentDiv = container.querySelector('.max-w-7xl');
            expect(contentDiv).toBeInTheDocument();
            expect(contentDiv?.className).toMatch(/mx-auto/);
            expect(contentDiv?.className).toMatch(/w-full/);
        });

        it('applies overflow and spacing classes correctly', () => {
            const { container } = render(
                <AdminLayoutClient adminName="John Doe" role="admin">
                    <div>Content</div>
                </AdminLayoutClient>
            );

            const main = container.querySelector('main');
            expect(main?.className).toMatch(/overflow-auto/);

            const contentDiv = container.querySelector('.p-6');
            expect(contentDiv).toBeInTheDocument();
        });

        it('applies background color to layout', () => {
            const { container } = render(
                <AdminLayoutClient adminName="John Doe" role="admin">
                    <div>Content</div>
                </AdminLayoutClient>
            );

            const layoutDiv = container.querySelector('.admin-layout');
            expect(layoutDiv?.className).toMatch(/bg-gray-50/);
        });
    });
});
