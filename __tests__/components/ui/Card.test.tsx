import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';

/**
 * Tests for Card components
 *
 * Card and its sub-components (CardHeader, CardBody, CardFooter) should render
 * with correct styling and structure.
 */
describe('Card Component', () => {
    it('should render card container', () => {
        const { container } = render(<Card>Card content</Card>);
        const card = container.querySelector('.bg-white');
        expect(card).toBeInTheDocument();
        expect(card).toHaveClass('border-2', 'border-black', 'rounded', 'p-6');
    });

    it('should render children content', () => {
        render(<Card>Card content here</Card>);
        expect(screen.getByText('Card content here')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
        const { container } = render(
            <Card className="custom-class">Content</Card>
        );
        const card = container.querySelector('.bg-white');
        expect(card).toHaveClass('custom-class');
    });

    it('should accept HTML attributes', () => {
        const { container } = render(
            <Card data-testid="custom-card">Content</Card>
        );
        const card = container.querySelector('[data-testid="custom-card"]');
        expect(card).toBeInTheDocument();
    });
});

describe('CardHeader Component', () => {
    it('should render card header with border', () => {
        const { container } = render(<CardHeader>Header content</CardHeader>);
        const header = container.firstChild;
        expect(header).toHaveClass('mb-4', 'border-b', 'border-black', 'pb-4');
    });

    it('should render header children', () => {
        render(<CardHeader>Header text</CardHeader>);
        expect(screen.getByText('Header text')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
        const { container } = render(
            <CardHeader className="header-custom">Content</CardHeader>
        );
        const header = container.firstChild as HTMLElement;
        expect(header).toHaveClass('header-custom');
    });
});

describe('CardBody Component', () => {
    it('should render card body container', () => {
        const { container } = render(<CardBody>Body content</CardBody>);
        const body = container.firstChild;
        expect(body).toBeInTheDocument();
    });

    it('should render body children', () => {
        render(<CardBody>Body text</CardBody>);
        expect(screen.getByText('Body text')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
        const { container } = render(
            <CardBody className="body-custom">Content</CardBody>
        );
        const body = container.firstChild as HTMLElement;
        expect(body).toHaveClass('body-custom');
    });
});

describe('CardFooter Component', () => {
    it('should render card footer with border', () => {
        const { container } = render(<CardFooter>Footer content</CardFooter>);
        const footer = container.firstChild;
        expect(footer).toHaveClass('mt-4', 'border-t', 'border-black', 'pt-4');
    });

    it('should render footer children', () => {
        render(<CardFooter>Footer text</CardFooter>);
        expect(screen.getByText('Footer text')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
        const { container } = render(
            <CardFooter className="footer-custom">Content</CardFooter>
        );
        const footer = container.firstChild as HTMLElement;
        expect(footer).toHaveClass('footer-custom');
    });
});

describe('Card Composition', () => {
    it('should compose card with header, body, and footer', () => {
        render(
            <Card>
                <CardHeader>Header</CardHeader>
                <CardBody>Body</CardBody>
                <CardFooter>Footer</CardFooter>
            </Card>
        );

        expect(screen.getByText('Header')).toBeInTheDocument();
        expect(screen.getByText('Body')).toBeInTheDocument();
        expect(screen.getByText('Footer')).toBeInTheDocument();
    });

    it('should render complex card structure', () => {
        render(
            <Card>
                <CardHeader>
                    <h2>Title</h2>
                </CardHeader>
                <CardBody>
                    <p>Body content with multiple elements</p>
                </CardBody>
                <CardFooter>
                    <button>Action</button>
                </CardFooter>
            </Card>
        );

        expect(screen.getByText('Title')).toBeInTheDocument();
        expect(
            screen.getByText('Body content with multiple elements')
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Action' })
        ).toBeInTheDocument();
    });
});
