'use client';

/**
 * CartDrawer Component
 *
 * Slide-out panel that displays the shopping cart contents.
 *
 * Features:
 * - Slides in from right side
 * - Darkens background with overlay
 * - Shows empty state when cart is empty
 * - Lists all cart items
 * - Displays cart summary
 * - View Cart and Checkout buttons
 * - Closes on overlay click, Escape key, or close button
 * - Focus trap for accessibility
 */

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { cart } = useCart();
    const drawerRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    // Handle Escape key to close drawer
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Focus trap implementation
    useEffect(() => {
        if (!isOpen || !drawerRef.current) return;

        const drawer = drawerRef.current;
        const focusableElements = drawer.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
            focusableElements.length - 1
        ] as HTMLElement;

        // Focus close button when drawer opens
        closeButtonRef.current?.focus();

        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement?.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement?.focus();
            }
        };

        drawer.addEventListener('keydown', handleTab);
        return () => drawer.removeEventListener('keydown', handleTab);
    }, [isOpen]);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const hasItems = cart.items.length > 0;

    return (
        <>
            {/* Overlay */}
            <div
                data-testid="cart-overlay"
                onClick={onClose}
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                aria-hidden="true"
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                data-testid="cart-drawer"
                className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300 ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="cart-drawer-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2
                        id="cart-drawer-title"
                        className="text-lg font-semibold text-gray-900"
                    >
                        Shopping Cart
                    </h2>
                    <button
                        ref={closeButtonRef}
                        onClick={onClose}
                        aria-label="Close cart"
                        className="p-2 text-black hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-black"
                    >
                        {/* Close Icon (X) */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {hasItems ? (
                        <div
                            className="space-y-0"
                            data-testid="cart-items-list"
                        >
                            {cart.items.map((item) => (
                                <CartItem key={item.artworkId} item={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-16 h-16 text-gray-300 mb-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                                />
                            </svg>
                            <p className="text-gray-500 text-lg">
                                Your cart is empty
                            </p>
                            <p className="text-gray-400 text-sm mt-2">
                                Add some artwork to get started!
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer with Summary and Actions */}
                {hasItems && (
                    <div className="border-t border-gray-200 p-4 space-y-4">
                        <CartSummary />

                        <div className="space-y-2">
                            <Link
                                href="/shoppe/cart"
                                onClick={onClose}
                                data-testid="view-cart-link"
                                className="block w-full text-center px-4 py-2 border border-black text-black font-medium rounded hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                            >
                                View Cart
                            </Link>
                            <Link
                                href="/shoppe/checkout"
                                onClick={onClose}
                                data-testid="drawer-checkout-btn"
                                className="block w-full text-center px-4 py-2 bg-black text-white font-medium rounded hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                            >
                                Checkout
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
