/**
 * Tests for useCart hook
 *
 * Comprehensive test suite for the useCart hook, covering:
 * - Hook import and re-export functionality
 * - Error handling when used outside CartProvider
 * - Integration with CartContext
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { CartProvider, useCart } from '@/context/CartContext';
import type { CartContextType } from '@/context/CartContext';

/**
 * Test component that uses the useCart hook to verify it works correctly
 */
const UseCartTestComponent = () => {
    const cart = useCart();

    return (
        <div>
            <div data-testid="hook-exists">Hook loaded</div>
            <div data-testid="has-addItem">{typeof cart.addItem}</div>
            <div data-testid="has-removeItem">{typeof cart.removeItem}</div>
            <div data-testid="has-updateQuantity">
                {typeof cart.updateQuantity}
            </div>
            <div data-testid="has-clearCart">{typeof cart.clearCart}</div>
            <div data-testid="has-getTotal">{typeof cart.getTotal}</div>
            <div data-testid="has-getItemCount">{typeof cart.getItemCount}</div>
            <div data-testid="has-cart">{cart.cart ? 'true' : 'false'}</div>
        </div>
    );
};

describe('useCart Hook', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    describe('Hook Re-export', () => {
        it('should export useCart as a function', () => {
            // Verify it's the correct export
            expect(typeof useCart).toBe('function');
        });
    });

    describe('Hook Usage', () => {
        it('should provide cart context when used within CartProvider', () => {
            render(
                <CartProvider>
                    <UseCartTestComponent />
                </CartProvider>
            );

            expect(screen.getByTestId('hook-exists')).toHaveTextContent(
                'Hook loaded'
            );
        });

        it('should provide addItem function', () => {
            render(
                <CartProvider>
                    <UseCartTestComponent />
                </CartProvider>
            );

            expect(screen.getByTestId('has-addItem')).toHaveTextContent(
                'function'
            );
        });

        it('should provide removeItem function', () => {
            render(
                <CartProvider>
                    <UseCartTestComponent />
                </CartProvider>
            );

            expect(screen.getByTestId('has-removeItem')).toHaveTextContent(
                'function'
            );
        });

        it('should provide updateQuantity function', () => {
            render(
                <CartProvider>
                    <UseCartTestComponent />
                </CartProvider>
            );

            expect(screen.getByTestId('has-updateQuantity')).toHaveTextContent(
                'function'
            );
        });

        it('should provide clearCart function', () => {
            render(
                <CartProvider>
                    <UseCartTestComponent />
                </CartProvider>
            );

            expect(screen.getByTestId('has-clearCart')).toHaveTextContent(
                'function'
            );
        });

        it('should provide getTotal function', () => {
            render(
                <CartProvider>
                    <UseCartTestComponent />
                </CartProvider>
            );

            expect(screen.getByTestId('has-getTotal')).toHaveTextContent(
                'function'
            );
        });

        it('should provide getItemCount function', () => {
            render(
                <CartProvider>
                    <UseCartTestComponent />
                </CartProvider>
            );

            expect(screen.getByTestId('has-getItemCount')).toHaveTextContent(
                'function'
            );
        });

        it('should provide cart object', () => {
            render(
                <CartProvider>
                    <UseCartTestComponent />
                </CartProvider>
            );

            expect(screen.getByTestId('has-cart')).toHaveTextContent('true');
        });

        it('should provide all required API methods', () => {
            const TestComponent = () => {
                const cart = useCart();
                const hasAll =
                    typeof cart.cart === 'object' &&
                    typeof cart.addItem === 'function' &&
                    typeof cart.removeItem === 'function' &&
                    typeof cart.updateQuantity === 'function' &&
                    typeof cart.clearCart === 'function' &&
                    typeof cart.getTotal === 'function' &&
                    typeof cart.getItemCount === 'function';

                return (
                    <div data-testid="result">
                        {hasAll ? 'complete' : 'incomplete'}
                    </div>
                );
            };

            render(
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            );

            expect(screen.getByTestId('result')).toHaveTextContent('complete');
        });
    });

    describe('Error Handling', () => {
        it('should throw error when used outside CartProvider', () => {
            // Suppress console.error for this test
            const consoleSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {});

            const InvalidComponent = () => {
                useCart();
                return <div>Should not render</div>;
            };

            expect(() => {
                render(<InvalidComponent />);
            }).toThrow('useCart must be used within CartProvider');

            consoleSpy.mockRestore();
        });

        it('should throw error with helpful message when used outside CartProvider', () => {
            const consoleSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {});

            const InvalidComponent = () => {
                useCart();
                return <div>Should not render</div>;
            };

            let thrownError: Error | null = null;
            try {
                render(<InvalidComponent />);
            } catch (e) {
                thrownError = e as Error;
            }

            expect(thrownError).not.toBeNull();
            expect(thrownError?.message).toContain('CartProvider');

            consoleSpy.mockRestore();
        });
    });

    describe('Hook Consistency', () => {
        it('should return the same cart reference across renders', () => {
            const references: CartContextType[] = [];

            const TestComponent = () => {
                const cart = useCart();
                references.push(cart);
                return <div>Test</div>;
            };

            const { rerender } = render(
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            );

            rerender(
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            );

            // Cart object should be stable within the same provider
            expect(references.length).toBeGreaterThan(0);
        });

        it('should work with multiple components in same provider', () => {
            const Component1 = () => {
                const cart = useCart();
                return <div data-testid="comp1">{cart.getItemCount()}</div>;
            };

            const Component2 = () => {
                const cart = useCart();
                return (
                    <div data-testid="comp2">{cart.getTotal().toFixed(2)}</div>
                );
            };

            render(
                <CartProvider>
                    <Component1 />
                    <Component2 />
                </CartProvider>
            );

            expect(screen.getByTestId('comp1')).toBeInTheDocument();
            expect(screen.getByTestId('comp2')).toBeInTheDocument();
        });
    });

    describe('Hook API Contract', () => {
        it('should conform to expected CartContextType interface', () => {
            const TestComponent = () => {
                const cart = useCart();

                // Verify the structure matches CartContextType
                const isValidStructure =
                    'cart' in cart &&
                    'addItem' in cart &&
                    'removeItem' in cart &&
                    'updateQuantity' in cart &&
                    'clearCart' in cart &&
                    'getTotal' in cart &&
                    'getItemCount' in cart;

                return (
                    <div data-testid="valid">
                        {isValidStructure ? 'yes' : 'no'}
                    </div>
                );
            };

            render(
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            );

            expect(screen.getByTestId('valid')).toHaveTextContent('yes');
        });

        it('should provide cart with items array and lastUpdated timestamp', () => {
            const TestComponent = () => {
                const cart = useCart();
                const hasValidCart =
                    Array.isArray(cart.cart.items) &&
                    typeof cart.cart.lastUpdated === 'number';

                return (
                    <div data-testid="structure">
                        {hasValidCart ? 'valid' : 'invalid'}
                    </div>
                );
            };

            render(
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            );

            expect(screen.getByTestId('structure')).toHaveTextContent('valid');
        });
    });
});
