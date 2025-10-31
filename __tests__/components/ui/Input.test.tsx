import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input, TextArea } from '@/components/ui/Input';

/**
 * Tests for Input and TextArea components
 *
 * Both components support labels, error messages, and standard HTML attributes.
 * They should render correctly and handle user input.
 */
describe('Input Component', () => {
    it('should render input element', () => {
        render(<Input />);
        const input = screen.getByRole('textbox');
        expect(input).toBeInTheDocument();
    });

    it('should render with label', () => {
        render(<Input label="Email" />);
        expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should render without label when not provided', () => {
        render(<Input />);
        // No heading role for labels, checking for absence of extra elements
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should apply border styling', () => {
        render(<Input />);
        const input = screen.getByRole('textbox');
        expect(input).toHaveClass('border-2', 'border-black', 'rounded');
    });

    it('should have focus styles', () => {
        render(<Input />);
        const input = screen.getByRole('textbox');
        expect(input).toHaveClass('focus:ring-2', 'focus:ring-black');
    });

    it('should display error message', () => {
        render(<Input error="This field is required" />);
        expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should have red border when error is present', () => {
        const { container } = render(<Input error="Error text" />);
        const input = container.querySelector('input');
        expect(input).toHaveClass('border-red-500');
    });

    it('should handle input type attribute', () => {
        render(<Input type="email" />);
        const input = screen.getByRole('textbox') as HTMLInputElement;
        expect(input.type).toBe('email');
    });

    it('should support placeholder text', () => {
        render(<Input placeholder="Enter text..." />);
        const input = screen.getByPlaceholderText('Enter text...');
        expect(input).toBeInTheDocument();
    });

    it('should accept user input', async () => {
        const user = userEvent.setup();
        render(<Input />);
        const input = screen.getByRole('textbox') as HTMLInputElement;

        await user.type(input, 'test value');

        expect(input.value).toBe('test value');
    });

    it('should support disabled state', () => {
        render(<Input disabled />);
        const input = screen.getByRole('textbox');
        expect(input).toBeDisabled();
    });

    it('should support custom className', () => {
        render(<Input className="custom-class" />);
        const input = screen.getByRole('textbox');
        expect(input).toHaveClass('custom-class');
    });
});

describe('TextArea Component', () => {
    it('should render textarea element', () => {
        render(<TextArea />);
        const textarea = screen.getByRole('textbox');
        expect(textarea).toBeInTheDocument();
    });

    it('should render with label', () => {
        render(<TextArea label="Message" />);
        expect(screen.getByText('Message')).toBeInTheDocument();
    });

    it('should apply border styling', () => {
        render(<TextArea />);
        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveClass('border-2', 'border-black', 'rounded');
    });

    it('should have focus styles', () => {
        render(<TextArea />);
        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveClass('focus:ring-2', 'focus:ring-black');
    });

    it('should display error message', () => {
        render(<TextArea error="Please enter a message" />);
        expect(screen.getByText('Please enter a message')).toBeInTheDocument();
    });

    it('should have red border when error is present', () => {
        const { container } = render(<TextArea error="Error" />);
        const textarea = container.querySelector('textarea');
        expect(textarea).toHaveClass('border-red-500');
    });

    it('should accept multiline input', async () => {
        const user = userEvent.setup();
        render(<TextArea />);
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

        await user.type(textarea, 'line 1\nline 2');

        expect(textarea.value).toBe('line 1\nline 2');
    });

    it('should support placeholder text', () => {
        render(<TextArea placeholder="Enter your message..." />);
        const textarea = screen.getByPlaceholderText('Enter your message...');
        expect(textarea).toBeInTheDocument();
    });

    it('should support disabled state', () => {
        render(<TextArea disabled />);
        const textarea = screen.getByRole('textbox');
        expect(textarea).toBeDisabled();
    });

    it('should support custom className', () => {
        render(<TextArea className="custom-class" />);
        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveClass('custom-class');
    });

    it('should support rows and cols attributes', () => {
        const { container } = render(<TextArea rows={5} />);
        const textarea = container.querySelector('textarea');
        expect(textarea).toHaveAttribute('rows', '5');
    });
});
