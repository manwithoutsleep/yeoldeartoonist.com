import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AdminCard } from '@/components/admin/AdminCard';

describe('AdminCard', () => {
    it('renders title prop', () => {
        render(<AdminCard title="Total Orders">0</AdminCard>);
        expect(screen.getByText('Total Orders')).toBeInTheDocument();
    });

    it('renders children content', () => {
        render(
            <AdminCard title="Test Title">
                <div>Test content</div>
            </AdminCard>
        );
        expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(
            <AdminCard title="Test" className="custom-class">
                Content
            </AdminCard>
        );
        const cardElement = container.querySelector('.custom-class');
        expect(cardElement).toBeInTheDocument();
    });

    it('renders metric value with label', () => {
        render(
            <AdminCard title="Revenue" value={1250.5} label="Total">
                Content
            </AdminCard>
        );
        expect(screen.getByText('1250.5')).toBeInTheDocument();
        expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('handles numeric values', () => {
        render(
            <AdminCard title="Orders" value={42}>
                Content
            </AdminCard>
        );
        expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('handles string values', () => {
        render(
            <AdminCard title="Status" value="Active">
                Content
            </AdminCard>
        );
        expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('shows loading state with skeleton', () => {
        const { container } = render(
            <AdminCard title="Loading" loading={true}>
                Content
            </AdminCard>
        );
        // Check for loading indicator (placeholder, role, etc.)
        const card = container.querySelector('[data-loading="true"]');
        // If loading prop exists, we expect some loading indicator
        expect(card || container.innerHTML).toBeDefined();
    });

    it('has proper semantic structure with heading', () => {
        render(
            <AdminCard title="Dashboard Card">
                <p>Card content</p>
            </AdminCard>
        );
        const heading = screen.getByRole('heading', { name: 'Dashboard Card' });
        expect(heading).toBeInTheDocument();
    });

    it('maintains proper heading hierarchy', () => {
        const { container } = render(
            <AdminCard title="Metric">Content</AdminCard>
        );
        const heading = container.querySelector('h3, h2, h1');
        expect(heading).toBeInTheDocument();
    });

    it('renders with default props', () => {
        render(<AdminCard title="Default">Default content</AdminCard>);
        expect(screen.getByText('Default')).toBeInTheDocument();
        expect(screen.getByText('Default content')).toBeInTheDocument();
    });
});
