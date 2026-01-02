import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, type OrderStatus } from '@/lib/db/admin/orders';
import { createApiErrorResponse } from '@/lib/errors/user-friendly';
import { logError } from '@/lib/errors/logger';

/**
 * GET /api/admin/orders
 *
 * Retrieves all orders with optional filtering and pagination.
 *
 * Query Parameters:
 * - limit: Number of orders to return (default: 20)
 * - offset: Number of orders to skip (default: 0)
 * - status: Filter by order status (optional)
 *
 * Response:
 * - 200: { orders: Order[], total: number }
 * - 500: Standardized error response
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');
        const status = searchParams.get('status') as OrderStatus | undefined;

        const filters = status ? { status } : undefined;

        const { data, error } = await getAllOrders(limit, offset, filters);

        if (error) {
            logError(error, {
                location: 'api/admin/orders',
                action: 'getAllOrders',
                metadata: { limit, offset, status },
            });

            return NextResponse.json(
                createApiErrorResponse('DATABASE_ERROR', error.message),
                { status: 500 }
            );
        }

        return NextResponse.json({
            orders: data,
            total: data?.length || 0,
        });
    } catch (error) {
        logError(error, {
            location: 'api/admin/orders',
            action: 'GET',
        });

        return NextResponse.json(
            createApiErrorResponse('UNKNOWN_ERROR', error),
            { status: 500 }
        );
    }
}
