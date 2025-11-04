import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/layout/Header';

/**
 * Tests for Header component
 *
 * The Header displays the site logo and acts as the main branding element.
 * It should render correctly across all devices and link back to home.
 */
describe('Header Component', () => {
    it('should render header element', () => {
        render(<Header />);
        const header = screen.getByRole('banner');
        expect(header).toBeInTheDocument();
    });

    it('should contain logo link to home', () => {
        render(<Header />);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/');
    });

    it('should have white background styling', () => {
        render(<Header />);
        const header = screen.getByRole('banner');
        expect(header).toHaveClass('bg-white');
    });

    it('should have bottom border', () => {
        render(<Header />);
        const header = screen.getByRole('banner');
        expect(header).toHaveClass('border-b-2', 'border-black');
    });

    it('should render logo with correct alt text', () => {
        render(<Header />);
        const logo = screen.getByAltText('Ye Olde Artoonist Logo');
        expect(logo).toBeInTheDocument();
    });

    it('should be responsive with padding classes', () => {
        render(<Header />);
        const header = screen.getByRole('banner');
        expect(header).toHaveClass('w-full');
    });

    it('should display logo in a centered container', () => {
        const { container } = render(<Header />);
        const centerDiv = container.querySelector(
            '.flex.items-center.justify-center'
        );
        expect(centerDiv).toBeInTheDocument();
    });
});
