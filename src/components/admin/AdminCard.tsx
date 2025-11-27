/**
 * AdminCard Component
 *
 * A card component for displaying admin metrics and content.
 * Can display a title, optional value/label pair, and children content.
 * Supports loading state for async operations.
 */

import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';

export interface AdminCardProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Card title (displayed as heading)
     */
    title: string;

    /**
     * Optional metric value to display (number or string)
     */
    value?: string | number;

    /**
     * Optional label for the value
     */
    label?: string;

    /**
     * Loading state indicator
     */
    loading?: boolean;

    /**
     * Card content
     */
    children?: React.ReactNode;
}

export function AdminCard({
    title,
    value,
    label,
    loading = false,
    children,
    className = '',
    ...props
}: AdminCardProps) {
    return (
        <Card className={`${className}`} data-loading={loading} {...props}>
            <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </CardHeader>

            <CardBody>
                {loading ? (
                    <div className="space-y-2 animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                ) : (
                    <>
                        {value !== undefined && (
                            <div className="mb-4">
                                <div className="text-3xl font-bold text-gray-900">
                                    {value}
                                </div>
                                {label && (
                                    <div className="text-sm text-gray-600 mt-1">
                                        {label}
                                    </div>
                                )}
                            </div>
                        )}
                        {children && (
                            <div className="text-gray-700">{children}</div>
                        )}
                    </>
                )}
            </CardBody>
        </Card>
    );
}
