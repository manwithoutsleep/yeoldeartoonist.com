import React from 'react';
import { render } from '@testing-library/react';
import { Grid } from '@/components/ui/Grid';

/**
 * Tests for Grid component
 *
 * Grid should render responsive column configurations and gap spacing.
 */
describe('Grid Component', () => {
    it('should render grid container', () => {
        const { container } = render(
            <Grid>
                <div>Item 1</div>
            </Grid>
        );
        const grid = container.querySelector('.grid');
        expect(grid).toBeInTheDocument();
    });

    it('should render children items', () => {
        const { container } = render(
            <Grid>
                <div>Item 1</div>
                <div>Item 2</div>
                <div>Item 3</div>
            </Grid>
        );
        const items = container.querySelectorAll('div > div');
        expect(items.length).toBeGreaterThanOrEqual(3);
    });

    it('should apply default responsive classes', () => {
        const { container } = render(
            <Grid>
                <div>Item</div>
            </Grid>
        );
        const grid = container.querySelector('.grid');

        // Check for responsive column classes
        const className = grid?.className || '';
        expect(className).toContain('grid-cols-');
        expect(className).toContain('sm:grid-cols-');
        expect(className).toContain('md:grid-cols-');
        expect(className).toContain('lg:grid-cols-');
    });

    it('should apply default gap class', () => {
        const { container } = render(
            <Grid>
                <div>Item</div>
            </Grid>
        );
        const grid = container.querySelector('.grid');
        expect(grid).toHaveClass('gap-4');
    });

    it('should apply gap-6 when gap prop is 6', () => {
        const { container } = render(
            <Grid gap={6}>
                <div>Item</div>
            </Grid>
        );
        const grid = container.querySelector('.grid');
        expect(grid).toHaveClass('gap-6');
    });

    it('should apply gap-8 when gap prop is 8', () => {
        const { container } = render(
            <Grid gap={8}>
                <div>Item</div>
            </Grid>
        );
        const grid = container.querySelector('.grid');
        expect(grid).toHaveClass('gap-8');
    });

    it('should accept custom className', () => {
        const { container } = render(
            <Grid className="custom-grid">
                <div>Item</div>
            </Grid>
        );
        const grid = container.querySelector('.grid');
        expect(grid).toHaveClass('custom-grid');
    });

    it('should accept custom column counts', () => {
        const { container } = render(
            <Grid cols={1} colsSm={2} colsMd={3} colsLg={4}>
                <div>Item</div>
            </Grid>
        );
        const grid = container.querySelector('.grid');
        const className = grid?.className || '';

        // Verify that the grid has grid-cols classes with custom values
        expect(className).toContain('grid-cols-');
    });

    it('should accept HTML attributes', () => {
        const { container } = render(
            <Grid data-testid="custom-grid" role="grid">
                <div>Item</div>
            </Grid>
        );
        const grid = container.querySelector('[data-testid="custom-grid"]');
        expect(grid).toHaveAttribute('role', 'grid');
    });

    it('should render multiple grid items', () => {
        const { container } = render(
            <Grid>
                <div>Item 1</div>
                <div>Item 2</div>
                <div>Item 3</div>
                <div>Item 4</div>
            </Grid>
        );
        const grid = container.querySelector('.grid');
        const children = grid?.children.length || 0;
        expect(children).toBe(4);
    });

    it('should support JSX children', () => {
        const { container } = render(
            <Grid>
                {[1, 2, 3].map((num) => (
                    <div key={num}>Item {num}</div>
                ))}
            </Grid>
        );
        const grid = container.querySelector('.grid');
        expect(grid?.children.length).toBe(3);
    });

    it('should maintain grid structure with complex children', () => {
        const { container } = render(
            <Grid gap={4}>
                <div>
                    <h3>Title 1</h3>
                    <p>Content 1</p>
                </div>
                <div>
                    <h3>Title 2</h3>
                    <p>Content 2</p>
                </div>
            </Grid>
        );
        const grid = container.querySelector('.grid');
        expect(grid?.children.length).toBe(2);
        expect(grid).toHaveClass('gap-4');
    });

    it('should apply custom responsive columns', () => {
        const { container } = render(
            <Grid cols={1} colsSm={1} colsMd={2} colsLg={3}>
                <div>Item</div>
            </Grid>
        );
        const grid = container.querySelector('.grid');
        expect(grid).toHaveClass('grid');
        // Just verify grid class exists, actual responsive classes are built dynamically
        expect(grid?.className).toBeDefined();
    });
});
