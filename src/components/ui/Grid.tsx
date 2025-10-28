import React from 'react';

/**
 * Grid component - Responsive grid layout
 *
 * Features:
 * - Responsive column count (1 on mobile, 2 on tablet, 3+ on desktop)
 * - Customizable gap between items
 * - Easy to configure for different use cases
 */

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
    cols?: number;
    colsSm?: number;
    colsMd?: number;
    colsLg?: number;
    gap?: number;
    children: React.ReactNode;
}

export function Grid({
    cols = 1,
    colsSm = 2,
    colsMd = 3,
    colsLg = 4,
    gap = 4,
    className = '',
    children,
    ...props
}: GridProps) {
    const gapClass =
        gap === 4
            ? 'gap-4'
            : gap === 6
              ? 'gap-6'
              : gap === 8
                ? 'gap-8'
                : 'gap-4';

    return (
        <div
            className={`grid grid-cols-${cols} sm:grid-cols-${colsSm} md:grid-cols-${colsMd} lg:grid-cols-${colsLg} ${gapClass} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
