'use client';

/**
 * Shopping Cart Context
 *
 * Stub implementation for Phase 2 cart functionality.
 * This module is lazy-loaded only when cart/checkout features are accessed.
 *
 * Features:
 * - Cart state management
 * - Item addition/removal
 * - Cart persistence to localStorage
 *
 * @phase Phase 2 - Full implementation
 * @note This is a stub - full implementation deferred to Phase 3
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart, CartItem } from '@/types/cart';

interface CartContextType {
    cart: Cart;
    addItem: (item: CartItem) => void;
    removeItem: (artworkId: string) => void;
    updateQuantity: (artworkId: string, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Initialize cart from localStorage
function initializeCart(): Cart {
    if (typeof window === 'undefined') {
        return {
            items: [],
            lastUpdated: Date.now(),
        };
    }

    try {
        const stored = localStorage.getItem('cart');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Failed to parse cart from localStorage', e);
    }

    return {
        items: [],
        lastUpdated: Date.now(),
    };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<Cart>(initializeCart);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addItem = (item: CartItem) => {
        setCart((prev) => {
            const existing = prev.items.find(
                (i) => i.artworkId === item.artworkId
            );
            const timestamp = Date.now();
            if (existing) {
                return {
                    items: prev.items.map((i) =>
                        i.artworkId === item.artworkId
                            ? { ...i, quantity: i.quantity + item.quantity }
                            : i
                    ),
                    lastUpdated: timestamp,
                };
            }
            return {
                items: [...prev.items, item],
                lastUpdated: timestamp,
            };
        });
    };

    const removeItem = (artworkId: string) => {
        setCart((prev) => ({
            items: prev.items.filter((i) => i.artworkId !== artworkId),
            lastUpdated: Date.now(),
        }));
    };

    const updateQuantity = (artworkId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(artworkId);
            return;
        }
        setCart((prev) => {
            const timestamp = Date.now();
            return {
                items: prev.items.map((i) =>
                    i.artworkId === artworkId ? { ...i, quantity } : i
                ),
                lastUpdated: timestamp,
            };
        });
    };

    const clearCart = () => {
        const timestamp = Date.now();
        setCart({
            items: [],
            lastUpdated: timestamp,
        });
    };

    const getTotal = () => {
        return cart.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
    };

    const getItemCount = () => {
        return cart.items.reduce((sum, item) => sum + item.quantity, 0);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                getTotal,
                getItemCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
}
