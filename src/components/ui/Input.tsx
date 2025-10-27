import React from 'react';

/**
 * Input component - Styled form input field
 *
 * Features:
 * - Black border with hover/focus states
 * - Support for different input types
 */

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-semibold text-black mb-2">
                    {label}
                </label>
            )}
            <input
                className={`w-full border-2 border-black rounded px-4 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                    error ? 'border-red-500' : ''
                } ${className}`}
                {...props}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}

export function TextArea({
    label,
    error,
    className = '',
    ...props
}: InputProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-semibold text-black mb-2">
                    {label}
                </label>
            )}
            <textarea
                className={`w-full border-2 border-black rounded px-4 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                    error ? 'border-red-500' : ''
                } ${className}`}
                {...props}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}
