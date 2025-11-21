import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CreateArtworkPage from '@/app/admin/artwork/new/page';

// Mock ArtworkForm
vi.mock('@/components/admin/artwork/ArtworkForm', () => ({
    default: () => <div data-testid="artwork-form">Artwork Form</div>,
}));

describe('CreateArtworkPage', () => {
    it('renders the artwork form', () => {
        render(<CreateArtworkPage />);
        expect(screen.getByTestId('artwork-form')).toBeDefined();
        expect(screen.getByText('Artwork Form')).toBeDefined();
    });
});
