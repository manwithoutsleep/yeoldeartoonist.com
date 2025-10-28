import React from 'react';

/**
 * Card component - Container for grouped content
 *
 * Features:
 * - White background with border
 * - Customizable padding and styling
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function Card({ className = '', children, ...props }: CardProps) {
    return (
        <div
            className={`bg-white border-2 border-black rounded p-6 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className = '', children, ...props }: CardProps) {
    return (
        <div
            className={`mb-4 border-b border-black pb-4 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardBody({ className = '', children, ...props }: CardProps) {
    return (
        <div className={`${className}`} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({ className = '', children, ...props }: CardProps) {
    return (
        <div
            className={`mt-4 border-t border-black pt-4 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
