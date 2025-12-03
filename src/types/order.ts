/**
 * Order Types
 *
 * Types for the order system, including checkout data, order details, and status.
 */

export interface Address {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export interface CheckoutData {
    customerName: string;
    customerEmail: string;
    shippingAddress: Address;
    billingAddress?: Address;
    useSameAddressForBilling?: boolean;
    orderNotes?: string;
}

export interface OrderItem {
    id: string;
    artworkId: string;
    quantity: number;
    priceAtPurchase: number;
    lineSubtotal: number;
    title?: string;
    imageUrl?: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    shippingAddress: Address;
    billingAddress: Address;
    orderNotes?: string;
    subtotal: number;
    shippingCost: number;
    taxAmount: number;
    total: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentIntentId?: string;
    shippingTrackingNumber?: string;
    adminNotes?: string;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

export type OrderStatus =
    | 'pending'
    | 'paid'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed';

export interface CreateOrderPayload {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    shippingAddress: Address;
    billingAddress: Address;
    orderNotes?: string;
    subtotal: number;
    shippingCost: number;
    taxAmount: number;
    total: number;
    paymentIntentId: string;
    paymentStatus?: PaymentStatus;
    items: Array<{
        artworkId: string;
        quantity: number;
        priceAtPurchase: number;
        lineSubtotal: number;
    }>;
}
