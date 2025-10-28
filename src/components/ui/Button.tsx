import React from 'react';

/**
 * Button component - Styled button with consistent design
 *
 * Variants:
 * - primary: Black background with white text
 * - secondary: White background with black border
 * - outline: Transparent with black border
 */

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

const variantStyles = {
    primary: 'bg-black text-white hover:bg-gray-800 border-black',
    secondary: 'bg-white text-black hover:bg-gray-100 border-black',
    outline: 'bg-transparent text-black hover:bg-gray-100 border-black',
};

const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
};

export function Button({
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}: ButtonProps) {
    const baseStyles =
        'font-semibold rounded border-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    const variantStyle = variantStyles[variant];
    const sizeStyle = sizeStyles[size];

    return (
        <button
            className={`${baseStyles} ${variantStyle} ${sizeStyle} ${className}`}
            {...props}
        />
    );
}
