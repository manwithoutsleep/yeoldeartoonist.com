import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ImageLightbox } from '@/components/ui/ImageLightbox';

describe('ImageLightbox', () => {
    const defaultProps = {
        isOpen: false,
        onClose: vi.fn(),
        imageSrc: 'https://example.com/image-1600.jpg',
        imageAlt: 'Test artwork description',
        imageTitle: 'Test Artwork Title',
    };

    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Clean up body overflow style after each test
        document.body.style.overflow = '';
    });

    /**
     * RENDERING TESTS
     */
    describe('Rendering', () => {
        it('should not render when isOpen is false', () => {
            render(<ImageLightbox {...defaultProps} isOpen={false} />);

            // Lightbox should not be in the document
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            expect(
                screen.queryByAltText('Test artwork description')
            ).not.toBeInTheDocument();
        });

        it('should render overlay and lightbox when isOpen is true', () => {
            render(<ImageLightbox {...defaultProps} isOpen={true} />);

            // Dialog should be visible
            const dialog = screen.getByRole('dialog');
            expect(dialog).toBeInTheDocument();
            expect(dialog).toHaveAttribute('aria-modal', 'true');
        });

        it('should display image with correct src and alt text', () => {
            render(<ImageLightbox {...defaultProps} isOpen={true} />);

            const image = screen.getByAltText('Test artwork description');
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute(
                'src',
                'https://example.com/image-1600.jpg'
            );
            expect(image).toHaveAttribute('alt', 'Test artwork description');
        });

        it('should display close button', () => {
            render(<ImageLightbox {...defaultProps} isOpen={true} />);

            const closeButton = screen.getByRole('button', { name: /close/i });
            expect(closeButton).toBeInTheDocument();
        });
    });

    /**
     * INTERACTION TESTS
     */
    describe('Interactions', () => {
        it('should call onClose when overlay is clicked', async () => {
            const user = userEvent.setup();
            const onClose = vi.fn();

            render(
                <ImageLightbox
                    {...defaultProps}
                    isOpen={true}
                    onClose={onClose}
                />
            );

            // Find the overlay element (the backdrop behind the image)
            const dialog = screen.getByRole('dialog');
            const overlay = dialog.parentElement;

            if (overlay) {
                await user.click(overlay);
                expect(onClose).toHaveBeenCalledTimes(1);
            }
        });

        it('should call onClose when close button is clicked', async () => {
            const user = userEvent.setup();
            const onClose = vi.fn();

            render(
                <ImageLightbox
                    {...defaultProps}
                    isOpen={true}
                    onClose={onClose}
                />
            );

            const closeButton = screen.getByRole('button', { name: /close/i });
            await user.click(closeButton);

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('should call onClose when Escape key is pressed', async () => {
            const user = userEvent.setup();
            const onClose = vi.fn();

            render(
                <ImageLightbox
                    {...defaultProps}
                    isOpen={true}
                    onClose={onClose}
                />
            );

            await user.keyboard('{Escape}');

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('should NOT call onClose when clicking on the image itself', async () => {
            const user = userEvent.setup();
            const onClose = vi.fn();

            render(
                <ImageLightbox
                    {...defaultProps}
                    isOpen={true}
                    onClose={onClose}
                />
            );

            const image = screen.getByAltText('Test artwork description');
            await user.click(image);

            expect(onClose).not.toHaveBeenCalled();
        });
    });

    /**
     * ACCESSIBILITY TESTS
     */
    describe('Accessibility', () => {
        it('should have role="dialog" and aria-modal="true"', () => {
            render(<ImageLightbox {...defaultProps} isOpen={true} />);

            const dialog = screen.getByRole('dialog');
            expect(dialog).toHaveAttribute('aria-modal', 'true');
        });

        it('should have aria-labelledby pointing to image title', () => {
            render(<ImageLightbox {...defaultProps} isOpen={true} />);

            const dialog = screen.getByRole('dialog');
            const ariaLabelledBy = dialog.getAttribute('aria-labelledby');

            expect(ariaLabelledBy).toBeTruthy();

            // Verify the element with that ID exists and contains the title
            const titleElement = document.getElementById(ariaLabelledBy!);
            expect(titleElement).toBeInTheDocument();
            expect(titleElement).toHaveTextContent('Test Artwork Title');
        });

        it('should focus close button when lightbox opens', async () => {
            render(<ImageLightbox {...defaultProps} isOpen={true} />);

            const closeButton = screen.getByRole('button', { name: /close/i });

            await waitFor(() => {
                expect(closeButton).toHaveFocus();
            });
        });

        it('should trap focus within lightbox - Tab navigation', async () => {
            const user = userEvent.setup();

            render(<ImageLightbox {...defaultProps} isOpen={true} />);

            const closeButton = screen.getByRole('button', { name: /close/i });

            // Wait for initial focus on close button
            await waitFor(() => {
                expect(closeButton).toHaveFocus();
            });

            // Tab should keep focus within the lightbox
            await user.tab();

            // Focus should either stay on close button (if it's the only focusable element)
            // or move to another element within the dialog
            const dialog = screen.getByRole('dialog');
            const focusedElement = document.activeElement;

            expect(dialog.contains(focusedElement)).toBe(true);
        });

        it('should prevent body scroll when open', () => {
            render(<ImageLightbox {...defaultProps} isOpen={true} />);

            // Body should have overflow hidden to prevent scrolling
            expect(document.body.style.overflow).toBe('hidden');
        });

        it('should restore body scroll when closed', () => {
            const { rerender } = render(
                <ImageLightbox {...defaultProps} isOpen={true} />
            );

            // Initially, body scroll should be prevented
            expect(document.body.style.overflow).toBe('hidden');

            // Close the lightbox
            rerender(<ImageLightbox {...defaultProps} isOpen={false} />);

            // Body scroll should be restored
            expect(document.body.style.overflow).toBe('');
        });
    });

    /**
     * KEYBOARD NAVIGATION TESTS
     */
    describe('Keyboard Navigation', () => {
        it('should handle Tab key for forward focus navigation', async () => {
            const user = userEvent.setup();

            render(<ImageLightbox {...defaultProps} isOpen={true} />);

            const closeButton = screen.getByRole('button', { name: /close/i });

            // Wait for initial focus
            await waitFor(() => {
                expect(closeButton).toHaveFocus();
            });

            // Press Tab
            await user.tab();

            // Focus should remain within the dialog
            const dialog = screen.getByRole('dialog');
            expect(dialog.contains(document.activeElement)).toBe(true);
        });

        it('should handle Shift+Tab key for backward focus navigation', async () => {
            const user = userEvent.setup();

            render(<ImageLightbox {...defaultProps} isOpen={true} />);

            const closeButton = screen.getByRole('button', { name: /close/i });

            // Wait for initial focus
            await waitFor(() => {
                expect(closeButton).toHaveFocus();
            });

            // Press Shift+Tab
            await user.keyboard('{Shift>}{Tab}{/Shift}');

            // Focus should remain within the dialog
            const dialog = screen.getByRole('dialog');
            expect(dialog.contains(document.activeElement)).toBe(true);
        });

        it('should handle Escape key to close', async () => {
            const user = userEvent.setup();
            const onClose = vi.fn();

            render(
                <ImageLightbox
                    {...defaultProps}
                    isOpen={true}
                    onClose={onClose}
                />
            );

            await user.keyboard('{Escape}');

            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    /**
     * EDGE CASES
     */
    describe('Edge Cases', () => {
        it('should handle missing imageTitle gracefully', () => {
            const propsWithoutTitle = {
                ...defaultProps,
                imageTitle: undefined,
            };

            render(<ImageLightbox {...propsWithoutTitle} isOpen={true} />);

            const dialog = screen.getByRole('dialog');
            expect(dialog).toBeInTheDocument();

            // Should still have an aria-labelledby or aria-label for accessibility
            const hasAriaLabel =
                dialog.hasAttribute('aria-labelledby') ||
                dialog.hasAttribute('aria-label');
            expect(hasAriaLabel).toBe(true);
        });

        it('should handle reopening after closing', async () => {
            const user = userEvent.setup();
            const onClose = vi.fn();

            const { rerender } = render(
                <ImageLightbox
                    {...defaultProps}
                    isOpen={true}
                    onClose={onClose}
                />
            );

            // Close the lightbox
            const closeButton = screen.getByRole('button', { name: /close/i });
            await user.click(closeButton);

            expect(onClose).toHaveBeenCalledTimes(1);

            // Simulate closing by parent component
            rerender(
                <ImageLightbox
                    {...defaultProps}
                    isOpen={false}
                    onClose={onClose}
                />
            );

            // Lightbox should not be visible
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

            // Reopen the lightbox
            rerender(
                <ImageLightbox
                    {...defaultProps}
                    isOpen={true}
                    onClose={onClose}
                />
            );

            // Lightbox should be visible again
            expect(screen.getByRole('dialog')).toBeInTheDocument();

            // Close button should receive focus again
            const newCloseButton = screen.getByRole('button', {
                name: /close/i,
            });
            await waitFor(() => {
                expect(newCloseButton).toHaveFocus();
            });
        });
    });
});
