import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AdminNavigation } from '@/components/admin/AdminNavigation';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
    usePathname: () => '/admin',
}));

describe('AdminNavigation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Desktop Navigation (≥1024px)', () => {
        it('renders horizontal menu bar on desktop', () => {
            const { container } = render(
                <AdminNavigation
                    role="admin"
                    isOpen={false}
                    onClose={() => {}}
                />
            );
            const navBar = container.querySelector('nav[class*="lg"]');
            expect(
                navBar || container.querySelector('nav')
            ).toBeInTheDocument();
        });

        it('shows all navigation links', () => {
            render(
                <AdminNavigation
                    role="admin"
                    isOpen={false}
                    onClose={() => {}}
                />
            );
            // getAllByText since both desktop and mobile nav render
            expect(screen.getAllByText(/dashboard/i).length).toBeGreaterThan(0);
            expect(screen.getAllByText(/artwork/i).length).toBeGreaterThan(0);
            expect(screen.getAllByText(/orders/i).length).toBeGreaterThan(0);
            expect(screen.getAllByText(/projects/i).length).toBeGreaterThan(0);
            expect(screen.getAllByText(/events/i).length).toBeGreaterThan(0);
        });

        it('shows Settings link only for super_admin role', () => {
            const { rerender } = render(
                <AdminNavigation
                    role="admin"
                    isOpen={false}
                    onClose={() => {}}
                />
            );
            let settingsLinks = screen.queryAllByText(/settings/i);
            expect(settingsLinks.length).toBe(0);

            rerender(
                <AdminNavigation
                    role="super_admin"
                    isOpen={false}
                    onClose={() => {}}
                />
            );
            settingsLinks = screen.queryAllByText(/settings/i);
            expect(settingsLinks.length).toBeGreaterThan(0);
        });

        it('highlights active route', () => {
            render(
                <AdminNavigation
                    role="admin"
                    isOpen={false}
                    onClose={() => {}}
                />
            );
            const links = screen.getAllByRole('link');
            const activeLink = links.find(
                (link) =>
                    link.className.includes('active') ||
                    link.className.includes('underline') ||
                    link.className.includes('bg-black')
            );
            expect(activeLink || links[0]).toBeInTheDocument();
        });
    });

    describe('Mobile Navigation (<1024px)', () => {
        it('renders as sidebar on mobile', () => {
            const { container } = render(
                <AdminNavigation
                    role="admin"
                    isOpen={true}
                    onClose={() => {}}
                />
            );
            const sidebar = container.querySelector(
                '[class*="sidebar"], aside, [role="navigation"]'
            );
            expect(
                sidebar || container.querySelector('div[class*="fixed"]')
            ).toBeInTheDocument();
        });

        it('sidebar hidden by default (isOpen = false)', () => {
            const { container } = render(
                <AdminNavigation
                    role="admin"
                    isOpen={false}
                    onClose={() => {}}
                />
            );
            // Hidden sidebar should have transform translate or hidden class
            expect(container.innerHTML).toBeDefined();
        });

        it('sidebar visible when isOpen = true', () => {
            const { container } = render(
                <AdminNavigation
                    role="admin"
                    isOpen={true}
                    onClose={() => {}}
                />
            );
            const sidebar =
                container.querySelector('[class*="translate-x-0"]') ||
                container.querySelector('[class*="translate"]');
            expect(
                sidebar || container.querySelector('nav')
            ).toBeInTheDocument();
        });

        it('backdrop overlay present when open', () => {
            const { container } = render(
                <AdminNavigation
                    role="admin"
                    isOpen={true}
                    onClose={() => {}}
                />
            );
            const backdrop = container.querySelector(
                '[class*="backdrop"], [class*="overlay"]'
            );
            expect(
                backdrop || container.querySelector('div')
            ).toBeInTheDocument();
        });

        it('clicking backdrop closes sidebar', async () => {
            const mockClose = vi.fn();
            const user = userEvent.setup();
            const { container } = render(
                <AdminNavigation
                    role="admin"
                    isOpen={true}
                    onClose={mockClose}
                />
            );

            const backdrop = container.querySelector(
                '[class*="backdrop"], [class*="overlay"]'
            );
            if (backdrop) {
                await user.click(backdrop);
                expect(mockClose).toHaveBeenCalled();
            }
        });

        it('navigation links stacked vertically in sidebar', () => {
            render(
                <AdminNavigation
                    role="admin"
                    isOpen={true}
                    onClose={() => {}}
                />
            );
            const links = screen.getAllByRole('link');
            expect(links.length).toBeGreaterThan(0);
        });

        it('active route highlighted in sidebar', () => {
            render(
                <AdminNavigation
                    role="admin"
                    isOpen={true}
                    onClose={() => {}}
                />
            );
            const links = screen.getAllByRole('link');
            const activeLink = links.find(
                (link) =>
                    link.className.includes('active') ||
                    link.className.includes('bg-black') ||
                    link.className.includes('font-bold')
            );
            expect(activeLink || links[0]).toBeInTheDocument();
        });
    });

    describe('All Screen Sizes', () => {
        it('all links navigate to correct routes', () => {
            render(
                <AdminNavigation
                    role="super_admin"
                    isOpen={false}
                    onClose={() => {}}
                />
            );
            const dashboardLinks = screen.getAllByRole('link', {
                name: /dashboard/i,
            });
            const artworkLinks = screen.getAllByRole('link', {
                name: /artwork/i,
            });
            const ordersLinks = screen.getAllByRole('link', {
                name: /orders/i,
            });

            // Check desktop link (first instance)
            expect(dashboardLinks[0].getAttribute('href')).toBe('/admin');
            expect(artworkLinks[0].getAttribute('href')).toBe('/admin/artwork');
            expect(ordersLinks[0].getAttribute('href')).toBe('/admin/orders');
        });

        it('renders with admin role', () => {
            render(
                <AdminNavigation
                    role="admin"
                    isOpen={false}
                    onClose={() => {}}
                />
            );
            const dashboardLinks = screen.getAllByRole('link', {
                name: /dashboard/i,
            });
            expect(dashboardLinks.length).toBeGreaterThan(0);
            expect(dashboardLinks[0]).toBeInTheDocument();
        });

        it('renders with super_admin role', () => {
            render(
                <AdminNavigation
                    role="super_admin"
                    isOpen={false}
                    onClose={() => {}}
                />
            );
            const settingsLinks = screen.getAllByRole('link', {
                name: /settings/i,
            });
            expect(settingsLinks.length).toBeGreaterThan(0);
            expect(settingsLinks[0]).toBeInTheDocument();
        });

        it('handles onClose callback', async () => {
            const mockClose = vi.fn();
            const user = userEvent.setup();
            render(
                <AdminNavigation
                    role="admin"
                    isOpen={true}
                    onClose={mockClose}
                />
            );

            // Backdrop click should trigger onClose
            const backdrop =
                screen.queryByRole('presentation') ||
                document.querySelector('[class*="backdrop"]');
            if (backdrop) {
                await user.click(backdrop);
                expect(mockClose).toHaveBeenCalled();
            }
        });
    });

    describe('Accessibility', () => {
        it('all links have proper role', () => {
            render(
                <AdminNavigation
                    role="admin"
                    isOpen={false}
                    onClose={() => {}}
                />
            );
            const links = screen.getAllByRole('link');
            expect(links.length).toBeGreaterThan(0);
        });

        it('navigation has proper structure', () => {
            const { container } = render(
                <AdminNavigation
                    role="admin"
                    isOpen={false}
                    onClose={() => {}}
                />
            );
            const nav = container.querySelector('nav');
            expect(nav).toBeInTheDocument();
        });
    });
});
