import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, type OrderStatus } from '@/lib/db/admin/orders';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') as OrderStatus | undefined;

    const filters = status ? { status } : undefined;

    const { data, error } = await getAllOrders(limit, offset, filters);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        orders: data,
        total: data?.length || 0,
    });
}
