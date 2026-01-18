import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

/**
 * Tests for Button component
 *
 * Button supports multiple variants (primary, secondary, outline) and sizes (sm, md, lg).
 * It should render correctly with different styles and handle interactions.
 */
describe('Button Component', () => {
    it('should render button element', () => {
        render(<Button>Click me</Button>);
        const button = screen.getByRole('button', { name: 'Click me' });
        expect(button).toBeInTheDocument();
    });

    it('should render with default primary variant', () => {
        render(<Button>Primary Button</Button>);
        const button = screen.getByRole('button', { name: 'Primary Button' });
        expect(button).toHaveClass('bg-black', 'text-white', 'border-black');
    });

    it('should render with primary-dark variant for dark backgrounds', () => {
        render(<Button variant="primary-dark">Primary Dark Button</Button>);
        const button = screen.getByRole('button', {
            name: 'Primary Dark Button',
        });
        expect(button).toHaveClass('bg-black', 'text-white', 'border-white');
    });

    it('should render with secondary variant', () => {
        render(<Button variant="secondary">Secondary Button</Button>);
        const button = screen.getByRole('button', { name: 'Secondary Button' });
        expect(button).toHaveClass('bg-white', 'text-black');
    });

    it('should render with outline variant', () => {
        render(<Button variant="outline">Outline Button</Button>);
        const button = screen.getByRole('button', { name: 'Outline Button' });
        expect(button).toHaveClass('bg-transparent', 'text-black');
    });

    it('should render with small size', () => {
        render(<Button size="sm">Small</Button>);
        const button = screen.getByRole('button', { name: 'Small' });
        expect(button).toHaveClass('px-3', 'py-1', 'text-sm');
    });

    it('should render with medium size (default)', () => {
        render(<Button size="md">Medium</Button>);
        const button = screen.getByRole('button', { name: 'Medium' });
        expect(button).toHaveClass('px-4', 'py-2', 'text-base');
    });

    it('should render with large size', () => {
        render(<Button size="lg">Large</Button>);
        const button = screen.getByRole('button', { name: 'Large' });
        expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
    });

    it('should have base styles applied', () => {
        render(<Button>Styled Button</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('font-semibold', 'rounded', 'border-2');
    });

    it('should have transition and disabled styles', () => {
        render(<Button>Transition</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('transition-colors', 'disabled:opacity-50');
    });

    it('should be clickable', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Clickable</Button>);

        const button = screen.getByRole('button', { name: 'Clickable' });
        await user.click(button);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be disableable', () => {
        render(<Button disabled>Disabled</Button>);
        const button = screen.getByRole('button', { name: 'Disabled' });
        expect(button).toBeDisabled();
    });

    it('should not respond to click when disabled', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();
        render(
            <Button disabled onClick={handleClick}>
                Disabled
            </Button>
        );

        const button = screen.getByRole('button', { name: 'Disabled' });
        await user.click(button);

        expect(handleClick).not.toHaveBeenCalled();
    });

    it('should accept custom className', () => {
        render(<Button className="custom-class">Custom</Button>);
        const button = screen.getByRole('button', { name: 'Custom' });
        expect(button).toHaveClass('custom-class');
    });

    it('should accept all standard button attributes', () => {
        render(
            <Button
                type="submit"
                name="test-button"
                data-testid="custom-button"
                aria-label="Test Button"
            >
                Test
            </Button>
        );

        const button = screen.getByTestId('custom-button');
        expect(button).toHaveAttribute('type', 'submit');
        expect(button).toHaveAttribute('name', 'test-button');
        expect(button).toHaveAttribute('aria-label', 'Test Button');
    });

    it('should render with hover state styles', () => {
        render(<Button>Hover</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('hover:bg-gray-800');
    });

    it('should support different content types', () => {
        render(
            <Button>
                <span>Icon</span> Button Text
            </Button>
        );

        expect(screen.getByText('Icon')).toBeInTheDocument();
        expect(screen.getByText('Button Text')).toBeInTheDocument();
    });
});
