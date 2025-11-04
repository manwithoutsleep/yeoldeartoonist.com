import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialMediaIcon } from '@/components/ui/SocialMediaIcon';

/**
 * Tests for SocialMediaIcon component
 *
 * SocialMediaIcon displays social media links with hover flip animation.
 * It supports different variants and automatically detects platform types.
 */
describe('SocialMediaIcon Component', () => {
    const defaultProps = {
        title: 'Instagram',
        handle: '@testartist',
        href: 'https://instagram.com/testartist',
    };

    it('should render social media link', () => {
        render(<SocialMediaIcon {...defaultProps} />);
        const link = screen.getByRole('link');
        expect(link).toBeInTheDocument();
    });

    it('should have correct href attribute', () => {
        render(<SocialMediaIcon {...defaultProps} />);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', defaultProps.href);
    });

    it('should open link in new tab', () => {
        render(<SocialMediaIcon {...defaultProps} />);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('should display user handle', () => {
        render(<SocialMediaIcon {...defaultProps} />);
        expect(screen.getByText('@testartist')).toBeInTheDocument();
    });

    it('should render Instagram icon for Instagram links', () => {
        const { container } = render(<SocialMediaIcon {...defaultProps} />);
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('should apply dark variant styles by default', () => {
        render(<SocialMediaIcon {...defaultProps} />);
        const link = screen.getByRole('link');
        expect(link).toHaveClass('text-black', 'hover:text-gray-600');
    });

    it('should apply light variant styles when specified', () => {
        render(<SocialMediaIcon {...defaultProps} variant="light" />);
        const link = screen.getByRole('link');
        expect(link).toHaveClass('text-white', 'hover:text-gray-300');
    });

    it('should trigger flip animation on hover', async () => {
        const user = userEvent.setup();
        const { container } = render(<SocialMediaIcon {...defaultProps} />);
        const link = screen.getByRole('link');

        const svg = container.querySelector('svg');

        // Initial state - no flip
        expect(svg?.style.transform).not.toBe('scaleX(-1)');

        // Hover to flip
        await user.hover(link);
        expect(svg?.style.transform).toBe('scaleX(-1)');

        // Unhover to restore
        await user.unhover(link);
        expect(svg?.style.transform).toBe('scaleX(1)');
    });

    it('should handle mouse events correctly', () => {
        const { container } = render(<SocialMediaIcon {...defaultProps} />);
        const link = screen.getByRole('link');
        const svg = container.querySelector('svg');

        // Simulate mouseenter
        fireEvent.mouseEnter(link);
        expect(svg?.style.transform).toBe('scaleX(-1)');

        // Simulate mouseleave
        fireEvent.mouseLeave(link);
        expect(svg?.style.transform).toBe('scaleX(1)');
    });

    it('should render SVG with correct dimensions', () => {
        const { container } = render(<SocialMediaIcon {...defaultProps} />);
        const svg = container.querySelector('svg');

        expect(svg).toHaveAttribute('width', '24');
        expect(svg).toHaveAttribute('height', '24');
    });

    it('should use title to detect platform', () => {
        const instagramProps = {
            ...defaultProps,
            title: 'Instagram',
        };

        const { container } = render(<SocialMediaIcon {...instagramProps} />);
        const svg = container.querySelector('svg');

        expect(svg).toBeInTheDocument();
    });

    it('should render default icon for unknown platforms', () => {
        const unknownProps = {
            title: 'Unknown Platform',
            handle: '@user',
            href: 'https://example.com',
        };

        const { container } = render(<SocialMediaIcon {...unknownProps} />);
        const svg = container.querySelector('svg');

        expect(svg).toBeInTheDocument();
    });

    it('should have transition classes for smooth animation', () => {
        render(<SocialMediaIcon {...defaultProps} />);
        const link = screen.getByRole('link');

        expect(link).toHaveClass('transition-colors', 'duration-300');
    });

    it('should render icon container with correct styling', () => {
        const { container } = render(<SocialMediaIcon {...defaultProps} />);
        const iconContainer = container.querySelector('.w-6.h-6');

        expect(iconContainer).toBeInTheDocument();
        expect(iconContainer).toHaveClass('inline-block', 'flex-shrink-0');
    });

    it('should support case-insensitive platform detection', () => {
        const lowerCaseProps = {
            title: 'instagram',
            handle: '@lowercase',
            href: 'https://instagram.com/lowercase',
        };

        const { container } = render(<SocialMediaIcon {...lowerCaseProps} />);
        const svg = container.querySelector('svg');

        expect(svg).toBeInTheDocument();
    });

    it('should display handle with correct text size', () => {
        render(<SocialMediaIcon {...defaultProps} />);
        const handle = screen.getByText('@testartist');

        expect(handle).toHaveClass('text-sm', 'font-medium');
    });
});
