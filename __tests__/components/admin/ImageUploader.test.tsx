import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImageUploader from '@/components/admin/ImageUploader';

// Mock Server Action
vi.mock('@/app/admin/actions/upload', () => ({
    uploadImageAction: vi.fn(),
}));

describe('ImageUploader', () => {
    const mockOnUploadComplete = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (global.fetch as ReturnType<typeof vi.fn>).mockClear();
    });

    describe('Initial Rendering', () => {
        it('should render file input with correct accept attribute', () => {
            render(<ImageUploader onUploadComplete={mockOnUploadComplete} />);

            const fileInput = screen.getByLabelText(/choose image file/i);
            expect(fileInput).toBeInTheDocument();
            expect(fileInput).toHaveAttribute(
                'accept',
                'image/jpeg,image/png,image/webp'
            );
        });

        it('should show "Choose File" button', () => {
            render(<ImageUploader onUploadComplete={mockOnUploadComplete} />);

            expect(
                screen.getByRole('button', { name: /choose file/i })
            ).toBeInTheDocument();
        });

        it('should disable upload button until file selected', () => {
            render(<ImageUploader onUploadComplete={mockOnUploadComplete} />);

            const uploadButton = screen.getByRole('button', {
                name: /upload image/i,
            });
            expect(uploadButton).toBeDisabled();
        });

        it('should display existing image when existingImageUrl provided', () => {
            render(
                <ImageUploader
                    onUploadComplete={mockOnUploadComplete}
                    existingImageUrl="https://example.com/image.jpg"
                />
            );

            const img = screen.getByAltText(/current image/i);
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
        });
    });

    describe('File Selection', () => {
        it('should display selected filename after selection', async () => {
            render(<ImageUploader onUploadComplete={mockOnUploadComplete} />);

            const file = new File(['image content'], 'test-photo.jpg', {
                type: 'image/jpeg',
            });
            const fileInput = screen.getByLabelText(/choose image file/i);

            fireEvent.change(fileInput, { target: { files: [file] } });

            await waitFor(() => {
                expect(
                    screen.getByText(/test-photo\.jpg/i)
                ).toBeInTheDocument();
            });
        });

        it('should show image preview after file selection', async () => {
            // Mock URL.createObjectURL
            global.URL.createObjectURL = vi
                .fn()
                .mockReturnValue('blob:mock-url');

            render(<ImageUploader onUploadComplete={mockOnUploadComplete} />);

            const file = new File(['image content'], 'test-photo.jpg', {
                type: 'image/jpeg',
            });
            const fileInput = screen.getByLabelText(/choose image file/i);

            fireEvent.change(fileInput, { target: { files: [file] } });

            await waitFor(() => {
                const preview = screen.getByAltText(/preview/i);
                expect(preview).toBeInTheDocument();
                expect(preview).toHaveAttribute('src', 'blob:mock-url');
            });
        });

        it('should enable upload button after file selected', async () => {
            render(<ImageUploader onUploadComplete={mockOnUploadComplete} />);

            const file = new File(['image content'], 'test-photo.jpg', {
                type: 'image/jpeg',
            });
            const fileInput = screen.getByLabelText(/choose image file/i);

            fireEvent.change(fileInput, { target: { files: [file] } });

            await waitFor(() => {
                const uploadButton = screen.getByRole('button', {
                    name: /upload image/i,
                });
                expect(uploadButton).not.toBeDisabled();
            });
        });
    });

    describe('File Validation', () => {
        it('should validate file size before upload', async () => {
            render(
                <ImageUploader
                    onUploadComplete={mockOnUploadComplete}
                    maxSizeMB={1}
                />
            );

            // Create a file larger than 1MB
            const largeBuffer = new ArrayBuffer(2 * 1024 * 1024);
            const largeFile = new File([largeBuffer], 'large.jpg', {
                type: 'image/jpeg',
            });
            const fileInput = screen.getByLabelText(/choose image file/i);

            fireEvent.change(fileInput, { target: { files: [largeFile] } });

            await waitFor(() => {
                expect(screen.getByText(/file too large/i)).toBeInTheDocument();
            });
        });

        it('should validate file type before upload', async () => {
            render(<ImageUploader onUploadComplete={mockOnUploadComplete} />);

            const textFile = new File(['text content'], 'document.txt', {
                type: 'text/plain',
            });
            const fileInput = screen.getByLabelText(/choose image file/i);

            fireEvent.change(fileInput, { target: { files: [textFile] } });

            await waitFor(() => {
                expect(
                    screen.getByText(/invalid file type/i)
                ).toBeInTheDocument();
            });
        });
    });

    describe('Upload Process', () => {
        it('should call upload action with FormData', async () => {
            const { uploadImageAction } = await import(
                '@/app/admin/actions/upload'
            );
            (uploadImageAction as ReturnType<typeof vi.fn>).mockResolvedValue({
                success: true,
                data: {
                    image_thumbnail_url: 'https://example.com/thumb.webp',
                    image_url: 'https://example.com/preview.webp',
                    image_large_url: 'https://example.com/large.webp',
                },
            });

            render(<ImageUploader onUploadComplete={mockOnUploadComplete} />);

            const file = new File(['image content'], 'test-photo.jpg', {
                type: 'image/jpeg',
            });
            const fileInput = screen.getByLabelText(/choose image file/i);
            fireEvent.change(fileInput, { target: { files: [file] } });

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /upload image/i })
                ).not.toBeDisabled();
            });

            const uploadButton = screen.getByRole('button', {
                name: /upload image/i,
            });
            fireEvent.click(uploadButton);

            await waitFor(() => {
                expect(uploadImageAction).toHaveBeenCalledWith(
                    expect.any(FormData)
                );
            });
        });

        it('should disable upload button while uploading', async () => {
            const { uploadImageAction } = await import(
                '@/app/admin/actions/upload'
            );
            (uploadImageAction as ReturnType<typeof vi.fn>).mockImplementation(
                () =>
                    new Promise((resolve) => {
                        setTimeout(
                            () =>
                                resolve({
                                    success: true,
                                    data: {
                                        image_thumbnail_url: 'thumb.webp',
                                        image_url: 'preview.webp',
                                        image_large_url: 'large.webp',
                                    },
                                }),
                            50
                        );
                    })
            );

            render(<ImageUploader onUploadComplete={mockOnUploadComplete} />);

            const file = new File(['image content'], 'test-photo.jpg', {
                type: 'image/jpeg',
            });
            const fileInput = screen.getByLabelText(/choose image file/i);
            fireEvent.change(fileInput, { target: { files: [file] } });

            // Wait for upload button to be enabled
            await waitFor(() => {
                const uploadButton = screen.getByRole('button', {
                    name: /upload image/i,
                });
                expect(uploadButton).not.toBeDisabled();
            });

            const uploadButton = screen.getByRole('button', {
                name: /upload image/i,
            });
            fireEvent.click(uploadButton);

            // Button should be disabled during upload
            await waitFor(() => {
                const btn = screen.getByRole('button', { name: /uploading/i });
                expect(btn).toBeDisabled();
            });
        });

        it('should call onUploadComplete with URLs on success', async () => {
            const mockUrls = {
                image_thumbnail_url: 'https://example.com/thumb.webp',
                image_url: 'https://example.com/preview.webp',
                image_large_url: 'https://example.com/large.webp',
            };

            const { uploadImageAction } = await import(
                '@/app/admin/actions/upload'
            );
            (uploadImageAction as ReturnType<typeof vi.fn>).mockResolvedValue({
                success: true,
                data: mockUrls,
            });

            render(<ImageUploader onUploadComplete={mockOnUploadComplete} />);

            const file = new File(['image content'], 'test-photo.jpg', {
                type: 'image/jpeg',
            });
            const fileInput = screen.getByLabelText(/choose image file/i);
            fireEvent.change(fileInput, { target: { files: [file] } });

            const uploadButton = await screen.findByRole('button', {
                name: /upload image/i,
            });
            fireEvent.click(uploadButton);

            await waitFor(() => {
                expect(mockOnUploadComplete).toHaveBeenCalledWith(mockUrls);
            });
        });

        it('should show error message on upload failure', async () => {
            const { uploadImageAction } = await import(
                '@/app/admin/actions/upload'
            );
            (uploadImageAction as ReturnType<typeof vi.fn>).mockResolvedValue({
                success: false,
                error: 'Upload failed',
            });

            render(<ImageUploader onUploadComplete={mockOnUploadComplete} />);

            const file = new File(['image content'], 'test-photo.jpg', {
                type: 'image/jpeg',
            });
            const fileInput = screen.getByLabelText(/choose image file/i);
            fireEvent.change(fileInput, { target: { files: [file] } });

            const uploadButton = await screen.findByRole('button', {
                name: /upload image/i,
            });
            fireEvent.click(uploadButton);

            await waitFor(() => {
                expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
            });
        });
    });

    describe('Clear Functionality', () => {
        it('should show clear button after file selected', async () => {
            render(<ImageUploader onUploadComplete={mockOnUploadComplete} />);

            const file = new File(['image content'], 'test-photo.jpg', {
                type: 'image/jpeg',
            });
            const fileInput = screen.getByLabelText(/choose image file/i);
            fireEvent.change(fileInput, { target: { files: [file] } });

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /clear/i })
                ).toBeInTheDocument();
            });
        });

        it('should remove selected file and preview when clear clicked', async () => {
            global.URL.createObjectURL = vi
                .fn()
                .mockReturnValue('blob:mock-url');

            render(<ImageUploader onUploadComplete={mockOnUploadComplete} />);

            const file = new File(['image content'], 'test-photo.jpg', {
                type: 'image/jpeg',
            });
            const fileInput = screen.getByLabelText(/choose image file/i);
            fireEvent.change(fileInput, { target: { files: [file] } });

            await waitFor(() => {
                expect(screen.getByAltText(/preview/i)).toBeInTheDocument();
            });

            const clearButton = screen.getByRole('button', { name: /clear/i });
            fireEvent.click(clearButton);

            await waitFor(() => {
                expect(
                    screen.queryByAltText(/preview/i)
                ).not.toBeInTheDocument();
                expect(
                    screen.queryByText(/test-photo\.jpg/i)
                ).not.toBeInTheDocument();
            });
        });
    });
});
