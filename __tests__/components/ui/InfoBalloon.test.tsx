import { render, screen, fireEvent } from '@testing-library/react';
import { InfoBalloon } from '@/components/ui/InfoBalloon';
import React from 'react';

describe('InfoBalloon', () => {
    it('should render an info icon', () => {
        render(<InfoBalloon text="This is a test" />);
        const icon = screen.getByRole('img', { name: /info/i });
        expect(icon).toBeInTheDocument();
    });

    it('should display the text on hover', async () => {
        render(<InfoBalloon text="This is a test" />);
        const icon = screen.getByRole('img', { name: /info/i });

        // Simulate hover
        fireEvent.mouseEnter(icon);

        // Wait for the tooltip to appear
        const tooltip = await screen.findByText('This is a test');
        expect(tooltip).toBeInTheDocument();

        // Simulate unhover
        fireEvent.mouseLeave(icon);

        // Check if the tooltip is gone
        expect(screen.queryByText('This is a test')).not.toBeInTheDocument();
    });
});
