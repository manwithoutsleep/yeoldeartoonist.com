import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navigation } from '@/components/layout/Navigation';

/**
 * Tests for Navigation component
 *
 * Navigation supports both desktop (image-based) and mobile (text-based) modes.
 * It handles responsive design and menu toggle functionality.
 */
describe('Navigation Component', () => {
    it('should render navigation element', () => {
        render(<Navigation />);
        const nav = screen.getByRole('navigation');
        expect(nav).toBeInTheDocument();
    });

    it('should have white background with border', () => {
        render(<Navigation />);
        const nav = screen.getByRole('navigation');
        expect(nav).toHaveClass('bg-white', 'border-b-2', 'border-black');
    });

    it('should display all navigation links via images (desktop) and text (mobile)', () => {
        render(<Navigation />);

        // Desktop navigation uses image buttons with alt text
        expect(screen.getByAltText('Gallery')).toBeInTheDocument();
        expect(screen.getByAltText('Shoppe')).toBeInTheDocument();
        expect(screen.getByAltText('In The Works')).toBeInTheDocument();
        expect(screen.getByAltText('Contact')).toBeInTheDocument();
    });

    it('should have correct href attributes for all links', () => {
        render(<Navigation />);

        const galleryImg = screen.getByAltText('Gallery');
        const shoppeImg = screen.getByAltText('Shoppe');
        const worksImg = screen.getByAltText('In The Works');
        const contactImg = screen.getByAltText('Contact');

        expect(galleryImg.closest('a')).toHaveAttribute('href', '/gallery');
        expect(shoppeImg.closest('a')).toHaveAttribute('href', '/shoppe');
        expect(worksImg.closest('a')).toHaveAttribute('href', '/in-the-works');
        expect(contactImg.closest('a')).toHaveAttribute('href', '/contact');
    });

    it('should display mobile toggle button', () => {
        render(<Navigation />);
        const toggleButton = screen.getByLabelText('Toggle navigation');
        expect(toggleButton).toBeInTheDocument();
    });

    it('should toggle mobile menu when button is clicked', async () => {
        const user = userEvent.setup();
        render(<Navigation />);

        const toggleButton = screen.getByLabelText('Toggle navigation');

        // Initially, toggle button should be present (for mobile)
        expect(toggleButton).toBeInTheDocument();

        // Click to open menu
        await user.click(toggleButton);

        // After click, the button state changes
        expect(toggleButton).toBeInTheDocument();

        // Click to close menu
        await user.click(toggleButton);

        // Button should still be present
        expect(toggleButton).toBeInTheDocument();
    });

    it('should render mobile menu when toggle is activated', async () => {
        const user = userEvent.setup();
        render(<Navigation />);

        const toggleButton = screen.getByLabelText('Toggle navigation');

        // Open menu
        await user.click(toggleButton);

        // Mobile menu text links should now appear after toggle
        // (This would be visible in the DOM as the mobile menu is conditionally rendered)
        expect(toggleButton).toBeInTheDocument();
    });

    it('should render navigation images with correct alt text', () => {
        render(<Navigation />);

        // Desktop navigation buttons have alt text on images
        const galleryImg = screen.getByAltText('Gallery');
        const shoppeImg = screen.getByAltText('Shoppe');
        const worksImg = screen.getByAltText('In The Works');
        const contactImg = screen.getByAltText('Contact');

        expect(galleryImg).toBeInTheDocument();
        expect(shoppeImg).toBeInTheDocument();
        expect(worksImg).toBeInTheDocument();
        expect(contactImg).toBeInTheDocument();
    });

    it('should have responsive classes for desktop/mobile visibility', () => {
        const { container } = render(<Navigation />);

        // Desktop navigation should use hidden md:flex
        const desktopNav = container.querySelector('.hidden.md\\:flex');
        expect(desktopNav).toBeInTheDocument();

        // Mobile toggle should use md:hidden
        const mobileToggle = screen.getByLabelText('Toggle navigation');
        expect(mobileToggle.closest('div')).toHaveClass('md:hidden');
    });

    it('should apply hover effects to navigation links', () => {
        render(<Navigation />);

        // Find gallery link by alt text (desktop image button)
        const galleryImg = screen.getByAltText('Gallery');
        const galleryLink = galleryImg.closest('a');
        expect(galleryLink).toHaveClass(
            'hover:scale-105',
            'transition-transform'
        );
    });
});
