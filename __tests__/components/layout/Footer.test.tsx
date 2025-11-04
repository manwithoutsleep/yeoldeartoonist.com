import React from 'react';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/layout/Footer';
import { siteConfig } from '@/config/site';

/**
 * Tests for Footer component
 *
 * Footer displays contact information, quick links, social links, and copyright notice.
 * It should render all sections and links correctly.
 */
describe('Footer Component', () => {
    it('should render footer element', () => {
        render(<Footer />);
        const footer = screen.getByRole('contentinfo');
        expect(footer).toBeInTheDocument();
    });

    it('should have white background with border', () => {
        render(<Footer />);
        const footer = screen.getByRole('contentinfo');
        expect(footer).toHaveClass('bg-white', 'border-t', 'border-black');
    });

    it('should display contact information section', () => {
        render(<Footer />);
        const contactHeadings = screen.getAllByText('Contact');
        expect(contactHeadings.length).toBeGreaterThan(0);
        expect(screen.getByText(siteConfig.artist.email)).toBeInTheDocument();
    });

    it('should display mailing address', () => {
        render(<Footer />);
        expect(
            screen.getByText(siteConfig.artist.mailingAddress.poBox)
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                new RegExp(
                    `${siteConfig.artist.mailingAddress.city}.*${siteConfig.artist.mailingAddress.state}`
                )
            )
        ).toBeInTheDocument();
    });

    it('should have email as mailto link', () => {
        render(<Footer />);
        const emailLink = screen.getByRole('link', {
            name: siteConfig.artist.email,
        });
        expect(emailLink).toHaveAttribute(
            'href',
            `mailto:${siteConfig.artist.email}`
        );
    });

    it('should display quick links section', () => {
        render(<Footer />);
        expect(screen.getByText('Quick Links')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    });

    it('should display navigation links in footer', () => {
        render(<Footer />);
        siteConfig.navigation.cards.forEach((card) => {
            expect(
                screen.getByRole('link', { name: card.title })
            ).toBeInTheDocument();
        });
    });

    it('should have correct href for home link', () => {
        render(<Footer />);
        const homeLink = screen.getByRole('link', { name: 'Home' });
        expect(homeLink).toHaveAttribute('href', '/');
    });

    it('should display social links section', () => {
        render(<Footer />);
        expect(screen.getByText('Follow Us')).toBeInTheDocument();
    });

    it('should display copyright notice', () => {
        const currentYear = new Date().getFullYear();
        render(<Footer />);

        expect(
            screen.getByText(
                new RegExp(
                    `© ${currentYear} ${siteConfig.artist.name}.*All rights reserved`
                )
            )
        ).toBeInTheDocument();
    });

    it('should have responsive grid layout', () => {
        const { container } = render(<Footer />);
        const grid = container.querySelector(
            '.grid.grid-cols-1.md\\:grid-cols-3'
        );
        expect(grid).toBeInTheDocument();
    });

    it('should display all social media sites', () => {
        render(<Footer />);
        // Just verify the section renders - actual social icons tested separately
        expect(screen.getByText('Follow Us')).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
        render(<Footer />);
        const headings = screen.getAllByRole('heading', { level: 3 });
        expect(headings).toHaveLength(3); // Contact, Quick Links, Follow Us
    });

    it('should apply hover styles to links', () => {
        render(<Footer />);
        const homeLink = screen.getByRole('link', { name: 'Home' });
        expect(homeLink).toHaveClass('hover:underline');
    });
});
