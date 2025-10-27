/**
 * Shopping Cart Types
 *
 * Types for the shopping cart system, including items, cart state, and validation.
 */

export interface CartItem {
    artworkId: string;
    title: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    slug: string;
}

export interface Cart {
    items: CartItem[];
    lastUpdated: number; // timestamp
}

export interface CartSummary {
    subtotal: number;
    shippingCost: number;
    taxAmount: number;
    total: number;
    itemCount: number;
}

export interface ValidatedCart {
    isValid: boolean;
    items: CartItem[];
    subtotal: number;
    shippingCost: number;
    taxAmount: number;
    total: number;
    errors?: string[];
}
