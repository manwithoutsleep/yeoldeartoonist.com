/**
 * Tests for Admin Layout (Server Component)
 *
 * The admin layout is a server component that:
 * - Reads admin session from cookies
 * - Validates session data
 * - Passes session info to AdminLayoutClient
 * - Handles missing or invalid sessions gracefully
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminLayout from '@/app/admin/layout';
import { cookies } from 'next/headers';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

// Mock next/headers
vi.mock('next/headers', () => ({
    cookies: vi.fn(),
}));

// Mock AdminLayoutClient component
vi.mock('@/components/admin/AdminLayoutClient', () => ({
    AdminLayoutClient: ({
        adminName,
        role,
        children,
    }: {
        adminName: string;
        role: string;
        children: React.ReactNode;
    }) => (
        <div data-testid="admin-layout-client">
            <div data-testid="admin-name">{adminName}</div>
            <div data-testid="admin-role">{role}</div>
            <div data-testid="children">{children}</div>
        </div>
    ),
}));

const mockCookies = vi.mocked(cookies);

/**
 * Helper function to create a properly typed mock cookies object
 */
function createMockCookies(
    getReturnValue: ReturnType<ReadonlyRequestCookies['get']> | undefined | null
): ReadonlyRequestCookies {
    return {
        get: vi.fn().mockReturnValue(getReturnValue),
        getAll: vi.fn().mockReturnValue([]),
        has: vi.fn().mockReturnValue(false),
        set: vi.fn(),
        delete: vi.fn(),
        [Symbol.iterator]: vi.fn().mockReturnValue([][Symbol.iterator]()),
        size: 0,
    } as unknown as ReadonlyRequestCookies;
}

describe('AdminLayout', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Clear console.error mock between tests
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('Session Cookie Handling', () => {
        it('should render children when valid session cookie exists', async () => {
            const validSession = {
                userId: 'user-123',
                adminId: 'admin-456',
                name: 'John Admin',
                role: 'admin',
                expiresAt: Date.now() + 900000, // 15 minutes from now
            };

            mockCookies.mockResolvedValue(
                createMockCookies({
                    name: 'admin_session',
                    value: JSON.stringify(validSession),
                })
            );

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            render(layout);

            expect(
                screen.getByTestId('admin-layout-client')
            ).toBeInTheDocument();
            expect(screen.getByTestId('admin-name')).toHaveTextContent(
                'John Admin'
            );
            expect(screen.getByTestId('admin-role')).toHaveTextContent('admin');
            expect(screen.getByTestId('children')).toHaveTextContent(
                'Test Content'
            );
        });

        it('should show "Session not found" message when no cookie exists', async () => {
            mockCookies.mockResolvedValue(createMockCookies(undefined));

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            render(layout);

            expect(screen.getByText('Session not found')).toBeInTheDocument();
            expect(screen.getByText('log in')).toBeInTheDocument();
            expect(screen.getByText('log in')).toHaveAttribute(
                'href',
                '/admin/login'
            );
        });

        it('should show "Session not found" when cookie is null', async () => {
            mockCookies.mockResolvedValue(createMockCookies(null));

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            render(layout);

            expect(screen.getByText('Session not found')).toBeInTheDocument();
        });
    });

    describe('Session Validation', () => {
        it('should render successfully with all required session fields', async () => {
            const validSession = {
                userId: 'user-123',
                adminId: 'admin-456',
                name: 'Jane Admin',
                role: 'super_admin',
                expiresAt: Date.now() + 900000,
            };

            mockCookies.mockResolvedValue(
                createMockCookies({
                    name: 'admin_session',
                    value: JSON.stringify(validSession),
                })
            );

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            render(layout);

            expect(screen.getByTestId('admin-name')).toHaveTextContent(
                'Jane Admin'
            );
            expect(screen.getByTestId('admin-role')).toHaveTextContent(
                'super_admin'
            );
        });

        it('should show error when userId is missing', async () => {
            const invalidSession = {
                adminId: 'admin-456',
                name: 'John Admin',
                role: 'admin',
                expiresAt: Date.now() + 900000,
            };

            mockCookies.mockResolvedValue(
                createMockCookies({
                    name: 'admin_session',
                    value: JSON.stringify(invalidSession),
                })
            );

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            render(layout);

            expect(screen.getByText('Invalid session')).toBeInTheDocument();
            expect(screen.getByText('log in again')).toBeInTheDocument();
        });

        it('should show error when name is missing', async () => {
            const invalidSession = {
                userId: 'user-123',
                adminId: 'admin-456',
                role: 'admin',
                expiresAt: Date.now() + 900000,
            };

            mockCookies.mockResolvedValue(
                createMockCookies({
                    name: 'admin_session',
                    value: JSON.stringify(invalidSession),
                })
            );

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            render(layout);

            expect(screen.getByText('Invalid session')).toBeInTheDocument();
        });

        it('should show error when role is missing', async () => {
            const invalidSession = {
                userId: 'user-123',
                adminId: 'admin-456',
                name: 'John Admin',
                expiresAt: Date.now() + 900000,
            };

            mockCookies.mockResolvedValue(
                createMockCookies({
                    name: 'admin_session',
                    value: JSON.stringify(invalidSession),
                })
            );

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            render(layout);

            expect(screen.getByText('Invalid session')).toBeInTheDocument();
        });

        it('should show error when session has empty userId', async () => {
            const invalidSession = {
                userId: '',
                adminId: 'admin-456',
                name: 'John Admin',
                role: 'admin',
                expiresAt: Date.now() + 900000,
            };

            mockCookies.mockResolvedValue(
                createMockCookies({
                    name: 'admin_session',
                    value: JSON.stringify(invalidSession),
                })
            );

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            render(layout);

            expect(screen.getByText('Invalid session')).toBeInTheDocument();
        });

        it('should show error when session has empty name', async () => {
            const invalidSession = {
                userId: 'user-123',
                adminId: 'admin-456',
                name: '',
                role: 'admin',
                expiresAt: Date.now() + 900000,
            };

            mockCookies.mockResolvedValue(
                createMockCookies({
                    name: 'admin_session',
                    value: JSON.stringify(invalidSession),
                })
            );

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            render(layout);

            expect(screen.getByText('Invalid session')).toBeInTheDocument();
        });

        it('should show error when session has empty role', async () => {
            const invalidSession = {
                userId: 'user-123',
                adminId: 'admin-456',
                name: 'John Admin',
                role: '',
                expiresAt: Date.now() + 900000,
            };

            mockCookies.mockResolvedValue(
                createMockCookies({
                    name: 'admin_session',
                    value: JSON.stringify(invalidSession),
                })
            );

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            render(layout);

            expect(screen.getByText('Invalid session')).toBeInTheDocument();
        });
    });

    describe('Session Parsing Errors', () => {
        it('should show error when session JSON is malformed', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error');

            mockCookies.mockResolvedValue(
                createMockCookies({
                    name: 'admin_session',
                    value: 'invalid-json{',
                })
            );

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            render(layout);

            expect(screen.getByText('Invalid session')).toBeInTheDocument();
            expect(screen.getByText('log in again')).toBeInTheDocument();
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to parse admin session:',
                expect.any(Error)
            );
        });

        it('should show error when session is empty string', async () => {
            mockCookies.mockResolvedValue(
                createMockCookies({
                    name: 'admin_session',
                    value: '',
                })
            );

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            render(layout);

            expect(screen.getByText('Invalid session')).toBeInTheDocument();
        });

        it('should show error when session is not an object', async () => {
            mockCookies.mockResolvedValue(
                createMockCookies({
                    name: 'admin_session',
                    value: JSON.stringify('string-instead-of-object'),
                })
            );

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            render(layout);

            expect(screen.getByText('Invalid session')).toBeInTheDocument();
        });

        it('should show error when session is an array', async () => {
            mockCookies.mockResolvedValue(
                createMockCookies({
                    name: 'admin_session',
                    value: JSON.stringify(['array', 'instead', 'of', 'object']),
                })
            );

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            render(layout);

            expect(screen.getByText('Invalid session')).toBeInTheDocument();
        });
    });

    describe('Props Passing to AdminLayoutClient', () => {
        it('should correctly pass adminName from session', async () => {
            const validSession = {
                userId: 'user-123',
                adminId: 'admin-456',
                name: 'Alice Administrator',
                role: 'admin',
                expiresAt: Date.now() + 900000,
            };

            mockCookies.mockResolvedValue(
                createMockCookies({
                    name: 'admin_session',
                    value: JSON.stringify(validSession),
                })
            );

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            render(layout);

            expect(screen.getByTestId('admin-name')).toHaveTextContent(
                'Alice Administrator'
            );
        });

        it('should correctly pass role from session', async () => {
            const validSession = {
                userId: 'user-123',
                adminId: 'admin-456',
                name: 'Bob Admin',
                role: 'super_admin',
                expiresAt: Date.now() + 900000,
            };

            mockCookies.mockResolvedValue(
                createMockCookies({
                    name: 'admin_session',
                    value: JSON.stringify(validSession),
                })
            );

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            render(layout);

            expect(screen.getByTestId('admin-role')).toHaveTextContent(
                'super_admin'
            );
        });

        it('should correctly pass children to AdminLayoutClient', async () => {
            const validSession = {
                userId: 'user-123',
                adminId: 'admin-456',
                name: 'Charlie Admin',
                role: 'admin',
                expiresAt: Date.now() + 900000,
            };

            mockCookies.mockResolvedValue(
                createMockCookies({
                    name: 'admin_session',
                    value: JSON.stringify(validSession),
                })
            );

            const layout = await AdminLayout({
                children: (
                    <div>
                        <h1>Dashboard</h1>
                        <p>Welcome to admin panel</p>
                    </div>
                ),
            });
            render(layout);

            const childrenElement = screen.getByTestId('children');
            expect(childrenElement).toHaveTextContent('Dashboard');
            expect(childrenElement).toHaveTextContent('Welcome to admin panel');
        });
    });

    describe('Role Handling', () => {
        it('should handle admin role correctly', async () => {
            const adminSession = {
                userId: 'user-123',
                adminId: 'admin-456',
                name: 'Regular Admin',
                role: 'admin',
                expiresAt: Date.now() + 900000,
            };

            mockCookies.mockResolvedValue(
                createMockCookies({
                    name: 'admin_session',
                    value: JSON.stringify(adminSession),
                })
            );

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            render(layout);

            expect(screen.getByTestId('admin-role')).toHaveTextContent('admin');
        });

        it('should handle super_admin role correctly', async () => {
            const superAdminSession = {
                userId: 'user-123',
                adminId: 'admin-456',
                name: 'Super Admin',
                role: 'super_admin',
                expiresAt: Date.now() + 900000,
            };

            mockCookies.mockResolvedValue(
                createMockCookies({
                    name: 'admin_session',
                    value: JSON.stringify(superAdminSession),
                })
            );

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            render(layout);

            expect(screen.getByTestId('admin-role')).toHaveTextContent(
                'super_admin'
            );
        });
    });

    describe('Edge Cases', () => {
        it('should handle session with extra unexpected fields', async () => {
            const sessionWithExtraFields = {
                userId: 'user-123',
                adminId: 'admin-456',
                name: 'Extra Fields Admin',
                role: 'admin',
                expiresAt: Date.now() + 900000,
                extraField1: 'should be ignored',
                extraField2: 12345,
            };

            mockCookies.mockResolvedValue(
                createMockCookies({
                    name: 'admin_session',
                    value: JSON.stringify(sessionWithExtraFields),
                })
            );

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            render(layout);

            expect(
                screen.getByTestId('admin-layout-client')
            ).toBeInTheDocument();
            expect(screen.getByTestId('admin-name')).toHaveTextContent(
                'Extra Fields Admin'
            );
        });

        it('should handle session with numeric values', async () => {
            const validSession = {
                userId: 'user-123',
                adminId: 'admin-456',
                name: 'Number Test',
                role: 'admin',
                expiresAt: 1234567890000,
            };

            mockCookies.mockResolvedValue(
                createMockCookies({
                    name: 'admin_session',
                    value: JSON.stringify(validSession),
                })
            );

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            render(layout);

            expect(
                screen.getByTestId('admin-layout-client')
            ).toBeInTheDocument();
        });

        it('should handle session with special characters in name', async () => {
            const validSession = {
                userId: 'user-123',
                adminId: 'admin-456',
                name: "O'Brien-Smith Jr.",
                role: 'admin',
                expiresAt: Date.now() + 900000,
            };

            mockCookies.mockResolvedValue(
                createMockCookies({
                    name: 'admin_session',
                    value: JSON.stringify(validSession),
                })
            );

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            render(layout);

            expect(screen.getByTestId('admin-name')).toHaveTextContent(
                "O'Brien-Smith Jr."
            );
        });

        it('should handle session with unicode characters in name', async () => {
            const validSession = {
                userId: 'user-123',
                adminId: 'admin-456',
                name: 'José García 日本語',
                role: 'admin',
                expiresAt: Date.now() + 900000,
            };

            mockCookies.mockResolvedValue(
                createMockCookies({
                    name: 'admin_session',
                    value: JSON.stringify(validSession),
                })
            );

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            render(layout);

            expect(screen.getByTestId('admin-name')).toHaveTextContent(
                'José García 日本語'
            );
        });
    });

    describe('Error Message UI', () => {
        it('should display proper error UI structure for missing session', async () => {
            mockCookies.mockResolvedValue(createMockCookies(undefined));

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            const { container } = render(layout);

            const errorContainer = container.querySelector(
                '.flex.items-center.justify-center.min-h-screen'
            );
            expect(errorContainer).toBeInTheDocument();

            const textCenter = container.querySelector('.text-center');
            expect(textCenter).toBeInTheDocument();

            const redText = container.querySelector(
                '.text-red-600.font-semibold'
            );
            expect(redText).toBeInTheDocument();
            expect(redText).toHaveTextContent('Session not found');
        });

        it('should display proper error UI structure for invalid session', async () => {
            mockCookies.mockResolvedValue(
                createMockCookies({
                    name: 'admin_session',
                    value: 'invalid-json',
                })
            );

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            const { container } = render(layout);

            const errorContainer = container.querySelector(
                '.flex.items-center.justify-center.min-h-screen'
            );
            expect(errorContainer).toBeInTheDocument();

            const redText = container.querySelector(
                '.text-red-600.font-semibold'
            );
            expect(redText).toBeInTheDocument();
            expect(redText).toHaveTextContent('Invalid session');
        });

        it('should have clickable login link in error states', async () => {
            mockCookies.mockResolvedValue(createMockCookies(undefined));

            const layout = await AdminLayout({
                children: <div>Test Content</div>,
            });
            render(layout);

            const loginLink = screen.getByText('log in');
            expect(loginLink).toHaveAttribute('href', '/admin/login');
            expect(loginLink).toHaveClass('text-blue-600', 'underline');
        });
    });

    describe('Console Error Logging', () => {
        it('should log error to console when JSON parsing fails', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error');

            mockCookies.mockResolvedValue(
                createMockCookies({
                    name: 'admin_session',
                    value: 'invalid-json{',
                })
            );

            await AdminLayout({
                children: <div>Test Content</div>,
            });

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to parse admin session:',
                expect.any(Error)
            );
        });

        it('should not log error to console when session is valid', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error');

            const validSession = {
                userId: 'user-123',
                adminId: 'admin-456',
                name: 'Valid Admin',
                role: 'admin',
                expiresAt: Date.now() + 900000,
            };

            mockCookies.mockResolvedValue(
                createMockCookies({
                    name: 'admin_session',
                    value: JSON.stringify(validSession),
                })
            );

            await AdminLayout({
                children: <div>Test Content</div>,
            });

            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });
    });
});
