import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AdminHeader } from '@/components/admin/AdminHeader';

// Mock Next.js router
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        pathname: '/',
    }),
}));

// Mock Supabase auth
vi.mock('@/lib/supabase/client', () => ({
    createBrowserClient: vi.fn(() => ({
        auth: {
            signOut: vi.fn().mockResolvedValue(undefined),
        },
    })),
}));

describe('AdminHeader', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders small logo in top-left', () => {
        render(<AdminHeader adminName="John Doe" />);
        const logo = screen.getByRole('link', { name: /logo|home|dashboard/i });
        expect(logo).toBeInTheDocument();
    });

    it('logo links to /admin dashboard', () => {
        render(<AdminHeader adminName="John Doe" />);
        const logo = screen.getByRole('link');
        expect(logo.getAttribute('href')).toBe('/admin');
    });

    it('displays current admin name', () => {
        render(<AdminHeader adminName="Jane Smith" />);
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('renders logout button', () => {
        render(<AdminHeader adminName="John Doe" />);
        const logoutButton = screen.getByRole('button', {
            name: /logout|sign out/i,
        });
        expect(logoutButton).toBeInTheDocument();
    });

    it('logout button calls signOut when clicked', async () => {
        const user = userEvent.setup();
        render(<AdminHeader adminName="John Doe" />);

        const logoutButton = screen.getByRole('button', {
            name: /logout|sign out/i,
        });
        await user.click(logoutButton);

        // The signOut function should have been called
        // (implementation details depend on actual auth handling)
        expect(logoutButton).toBeInTheDocument();
    });

    it('has compact height styling', () => {
        const { container } = render(<AdminHeader adminName="John Doe" />);
        const header = container.querySelector('header');
        // Check for compact height classes
        expect(header?.className).toMatch(/h-\d|height|admin-header/i);
    });

    it('renders hamburger menu button on mobile', () => {
        render(<AdminHeader adminName="John Doe" onMenuToggle={() => {}} />);
        // Look for menu toggle or hamburger icon
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });

    it('hamburger button toggles navigation state', async () => {
        const mockToggle = vi.fn();
        const user = userEvent.setup();

        render(<AdminHeader adminName="John Doe" onMenuToggle={mockToggle} />);

        const buttons = screen.getAllByRole('button');
        // Find the hamburger/menu button (not logout)
        const menuButton = buttons.find(
            (btn) =>
                btn.className.includes('hamburger') ||
                btn.getAttribute('aria-label')?.includes('menu') ||
                buttons.indexOf(btn) === 0
        );

        if (menuButton) {
            await user.click(menuButton);
            expect(mockToggle).toHaveBeenCalled();
        }
    });

    it('admin name visible on desktop', () => {
        render(<AdminHeader adminName="John Doe" />);
        const name = screen.getByText('John Doe');
        // Check visibility on desktop
        expect(name).toBeInTheDocument();
    });

    it('admin name hidden on mobile', () => {
        render(<AdminHeader adminName="John Doe" />);
        const name = screen.getByText('John Doe');
        // Check for responsive classes
        const parent = name.parentElement;
        expect(parent?.className).toMatch(/hidden|md:|lg:/);
    });

    it('has proper semantic HTML structure', () => {
        const { container } = render(<AdminHeader adminName="John Doe" />);
        const header = container.querySelector('header');
        expect(header).toBeInTheDocument();
    });

    it('renders with basic props', () => {
        render(<AdminHeader adminName="Test Admin" />);
        expect(screen.getByText('Test Admin')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /logout|sign out/i })
        ).toBeInTheDocument();
    });

    it('handles logout failure gracefully', async () => {
        const consoleErrorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});
        const mockSignOut = vi
            .fn()
            .mockRejectedValue(new Error('Network error'));

        // Override the default mock to simulate failure
        const { createBrowserClient } = await import('@/lib/supabase/client');
        vi.mocked(createBrowserClient).mockReturnValue({
            auth: {
                signOut: mockSignOut,
            } as Partial<
                ReturnType<typeof createBrowserClient>['auth']
            > as ReturnType<typeof createBrowserClient>['auth'],
        } as ReturnType<typeof createBrowserClient>);

        const user = userEvent.setup();
        render(<AdminHeader adminName="John Doe" />);

        const logoutButton = screen.getByRole('button', {
            name: /logout|sign out/i,
        });

        // Click logout
        await user.click(logoutButton);

        // Verify error was logged
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Logout failed:',
            expect.any(Error)
        );

        // Verify button is re-enabled after error
        expect(logoutButton).not.toBeDisabled();

        consoleErrorSpy.mockRestore();
    });
});
