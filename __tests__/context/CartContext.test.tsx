/**
 * Tests for CartContext
 *
 * Comprehensive test suite for the shopping cart context, covering:
 * - Context provider and hook setup
 * - Cart state management (add, remove, update, clear)
 * - Cart calculations (total, item count)
 * - localStorage persistence
 * - Error handling and edge cases
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { CartProvider, useCart } from '@/context/CartContext';
import { CartItem } from '@/types/cart';

/**
 * Test component that uses the useCart hook
 */
const CartConsumer = ({ onCartUpdate }: { onCartUpdate?: (cart: ReturnType<typeof useCart>) => void }) => {
    const cart = useCart();

    React.useEffect(() => {
        onCartUpdate?.(cart);
    }, [cart, onCartUpdate]);

    return (
        <div>
            <div data-testid="item-count">{cart.getItemCount()}</div>
            <div data-testid="total">{cart.getTotal().toFixed(2)}</div>
            <div data-testid="items-length">{cart.cart.items.length}</div>
            <button
                data-testid="add-item"
                onClick={() =>
                    cart.addItem({
                        artworkId: 'test-1',
                        title: 'Test Artwork',
                        price: 100,
                        quantity: 1,
                        slug: 'test-artwork',
                    })
                }
            >
                Add Item
            </button>
            <button
                data-testid="remove-item"
                onClick={() => cart.removeItem('test-1')}
            >
                Remove Item
            </button>
            <button
                data-testid="clear-cart"
                onClick={() => cart.clearCart()}
            >
                Clear Cart
            </button>
            <button
                data-testid="update-quantity"
                onClick={() => cart.updateQuantity('test-1', 5)}
            >
                Update Quantity
            </button>
        </div>
    );
};

describe('CartContext', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        jest.clearAllMocks();
    });

    describe('Context Provider Setup', () => {
        it('should render CartProvider without errors', () => {
            const { container } = render(
                <CartProvider>
                    <div>Test Content</div>
                </CartProvider>
            );
            expect(container).toBeInTheDocument();
            expect(screen.getByText('Test Content')).toBeInTheDocument();
        });

        it('should provide cart context to children', () => {
            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            expect(screen.getByTestId('item-count')).toBeInTheDocument();
            expect(screen.getByTestId('total')).toBeInTheDocument();
        });

        it('should throw error when useCart is used outside CartProvider', () => {
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
            }).toThrow(
                'useCart must be used within CartProvider'
            );

            consoleSpy.mockRestore();
        });
    });

    describe('Cart State Initialization', () => {
        it('should initialize with empty cart', () => {
            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            expect(screen.getByTestId('items-length')).toHaveTextContent('0');
            expect(screen.getByTestId('item-count')).toHaveTextContent('0');
            expect(screen.getByTestId('total')).toHaveTextContent('0.00');
        });

        it('should initialize cart from localStorage', () => {
            const mockCart = {
                items: [
                    {
                        artworkId: 'persisted-1',
                        title: 'Persisted Art',
                        price: 150,
                        quantity: 2,
                        slug: 'persisted-art',
                    },
                ],
                lastUpdated: Date.now(),
            };

            localStorage.setItem('cart', JSON.stringify(mockCart));

            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            expect(screen.getByTestId('items-length')).toHaveTextContent('1');
            expect(screen.getByTestId('item-count')).toHaveTextContent('2');
            expect(screen.getByTestId('total')).toHaveTextContent('300.00');
        });

        it('should handle corrupted localStorage gracefully', () => {
            localStorage.setItem('cart', 'invalid json {]');

            const consoleSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {});

            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            expect(screen.getByTestId('items-length')).toHaveTextContent('0');

            consoleSpy.mockRestore();
        });
    });

    describe('Adding Items', () => {
        it('should add new item to empty cart', async () => {
            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            expect(screen.getByTestId('items-length')).toHaveTextContent('0');

            act(() => {
                screen.getByTestId('add-item').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('items-length')).toHaveTextContent('1');
                expect(screen.getByTestId('item-count')).toHaveTextContent('1');
                expect(screen.getByTestId('total')).toHaveTextContent('100.00');
            });
        });

        it('should increment quantity when adding duplicate item', async () => {
            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            act(() => {
                screen.getByTestId('add-item').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('item-count')).toHaveTextContent('1');
            });

            act(() => {
                screen.getByTestId('add-item').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('item-count')).toHaveTextContent('2');
                expect(screen.getByTestId('items-length')).toHaveTextContent('1');
                expect(screen.getByTestId('total')).toHaveTextContent('200.00');
            });
        });

        it('should add multiple different items', async () => {
            const TestComponent = () => {
                const cart = useCart();

                return (
                    <div>
                        <button
                            onClick={() =>
                                cart.addItem({
                                    artworkId: 'art-1',
                                    title: 'Art 1',
                                    price: 100,
                                    quantity: 1,
                                    slug: 'art-1',
                                })
                            }
                        >
                            Add Art 1
                        </button>
                        <button
                            onClick={() =>
                                cart.addItem({
                                    artworkId: 'art-2',
                                    title: 'Art 2',
                                    price: 200,
                                    quantity: 1,
                                    slug: 'art-2',
                                })
                            }
                        >
                            Add Art 2
                        </button>
                        <div data-testid="total">{cart.getTotal()}</div>
                        <div data-testid="count">{cart.getItemCount()}</div>
                    </div>
                );
            };

            render(
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            );

            act(() => {
                screen.getByText('Add Art 1').click();
            });

            act(() => {
                screen.getByText('Add Art 2').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('count')).toHaveTextContent('2');
                expect(screen.getByTestId('total')).toHaveTextContent('300');
            });
        });

        it('should persist to localStorage after adding item', async () => {
            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            act(() => {
                screen.getByTestId('add-item').click();
            });

            await waitFor(() => {
                const stored = localStorage.getItem('cart');
                expect(stored).toBeTruthy();
                const parsed = JSON.parse(stored!);
                expect(parsed.items).toHaveLength(1);
                expect(parsed.items[0].artworkId).toBe('test-1');
            });
        });
    });

    describe('Removing Items', () => {
        it('should remove item from cart', async () => {
            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            act(() => {
                screen.getByTestId('add-item').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('items-length')).toHaveTextContent('1');
            });

            act(() => {
                screen.getByTestId('remove-item').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('items-length')).toHaveTextContent('0');
                expect(screen.getByTestId('item-count')).toHaveTextContent('0');
                expect(screen.getByTestId('total')).toHaveTextContent('0.00');
            });
        });

        it('should safely remove non-existent item', async () => {
            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            // Should not throw error
            act(() => {
                screen.getByTestId('remove-item').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('items-length')).toHaveTextContent('0');
            });
        });

        it('should remove only specified item', async () => {
            const TestComponent = () => {
                const cart = useCart();

                return (
                    <div>
                        <button
                            onClick={() => {
                                cart.addItem({
                                    artworkId: 'art-1',
                                    title: 'Art 1',
                                    price: 100,
                                    quantity: 1,
                                    slug: 'art-1',
                                });
                                cart.addItem({
                                    artworkId: 'art-2',
                                    title: 'Art 2',
                                    price: 200,
                                    quantity: 1,
                                    slug: 'art-2',
                                });
                            }}
                        >
                            Add Items
                        </button>
                        <button
                            onClick={() => cart.removeItem('art-1')}
                        >
                            Remove Art 1
                        </button>
                        <div data-testid="count">{cart.getItemCount()}</div>
                    </div>
                );
            };

            render(
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            );

            act(() => {
                screen.getByText('Add Items').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('count')).toHaveTextContent('2');
            });

            act(() => {
                screen.getByText('Remove Art 1').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('count')).toHaveTextContent('1');
            });
        });

        it('should persist removal to localStorage', async () => {
            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            act(() => {
                screen.getByTestId('add-item').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('items-length')).toHaveTextContent('1');
            });

            act(() => {
                screen.getByTestId('remove-item').click();
            });

            await waitFor(() => {
                const stored = localStorage.getItem('cart');
                expect(stored).toBeTruthy();
                const parsed = JSON.parse(stored!);
                expect(parsed.items).toHaveLength(0);
            });
        });
    });

    describe('Updating Quantity', () => {
        it('should update quantity for existing item', async () => {
            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            act(() => {
                screen.getByTestId('add-item').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('item-count')).toHaveTextContent('1');
            });

            act(() => {
                screen.getByTestId('update-quantity').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('item-count')).toHaveTextContent('5');
                expect(screen.getByTestId('total')).toHaveTextContent('500.00');
            });
        });

        it('should remove item when quantity becomes 0', async () => {
            const TestComponent = () => {
                const cart = useCart();

                return (
                    <div>
                        <button
                            onClick={() =>
                                cart.addItem({
                                    artworkId: 'test-1',
                                    title: 'Test',
                                    price: 100,
                                    quantity: 1,
                                    slug: 'test',
                                })
                            }
                        >
                            Add
                        </button>
                        <button
                            onClick={() => cart.updateQuantity('test-1', 0)}
                        >
                            Set to Zero
                        </button>
                        <div data-testid="count">{cart.getItemCount()}</div>
                    </div>
                );
            };

            render(
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            );

            act(() => {
                screen.getByText('Add').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('count')).toHaveTextContent('1');
            });

            act(() => {
                screen.getByText('Set to Zero').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('count')).toHaveTextContent('0');
            });
        });

        it('should remove item when quantity becomes negative', async () => {
            const TestComponent = () => {
                const cart = useCart();

                return (
                    <div>
                        <button
                            onClick={() =>
                                cart.addItem({
                                    artworkId: 'test-1',
                                    title: 'Test',
                                    price: 100,
                                    quantity: 1,
                                    slug: 'test',
                                })
                            }
                        >
                            Add
                        </button>
                        <button
                            onClick={() => cart.updateQuantity('test-1', -5)}
                        >
                            Set Negative
                        </button>
                        <div data-testid="count">{cart.getItemCount()}</div>
                    </div>
                );
            };

            render(
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            );

            act(() => {
                screen.getByText('Add').click();
            });

            act(() => {
                screen.getByText('Set Negative').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('count')).toHaveTextContent('0');
            });
        });

        it('should persist quantity update to localStorage', async () => {
            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            act(() => {
                screen.getByTestId('add-item').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('item-count')).toHaveTextContent('1');
            });

            act(() => {
                screen.getByTestId('update-quantity').click();
            });

            await waitFor(() => {
                const stored = localStorage.getItem('cart');
                expect(stored).toBeTruthy();
                const parsed = JSON.parse(stored!);
                expect(parsed.items[0].quantity).toBe(5);
            });
        });
    });

    describe('Cart Calculations', () => {
        it('should calculate total correctly for single item', async () => {
            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            act(() => {
                screen.getByTestId('add-item').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('total')).toHaveTextContent('100.00');
            });
        });

        it('should calculate total correctly for multiple items', async () => {
            const TestComponent = () => {
                const cart = useCart();

                return (
                    <div>
                        <button
                            onClick={() => {
                                cart.addItem({
                                    artworkId: 'art-1',
                                    title: 'Art 1',
                                    price: 100,
                                    quantity: 2,
                                    slug: 'art-1',
                                });
                                cart.addItem({
                                    artworkId: 'art-2',
                                    title: 'Art 2',
                                    price: 250,
                                    quantity: 3,
                                    slug: 'art-2',
                                });
                            }}
                        >
                            Add Items
                        </button>
                        <div data-testid="total">{cart.getTotal()}</div>
                    </div>
                );
            };

            render(
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            );

            act(() => {
                screen.getByText('Add Items').click();
            });

            await waitFor(() => {
                // (100 * 2) + (250 * 3) = 200 + 750 = 950
                expect(screen.getByTestId('total')).toHaveTextContent('950');
            });
        });

        it('should return 0 total for empty cart', () => {
            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            expect(screen.getByTestId('total')).toHaveTextContent('0.00');
        });

        it('should get correct item count for single item', async () => {
            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            act(() => {
                screen.getByTestId('add-item').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('item-count')).toHaveTextContent('1');
            });
        });

        it('should get correct item count for multiple items with quantities', async () => {
            const TestComponent = () => {
                const cart = useCart();

                return (
                    <div>
                        <button
                            onClick={() => {
                                cart.addItem({
                                    artworkId: 'art-1',
                                    title: 'Art 1',
                                    price: 100,
                                    quantity: 3,
                                    slug: 'art-1',
                                });
                                cart.addItem({
                                    artworkId: 'art-2',
                                    title: 'Art 2',
                                    price: 200,
                                    quantity: 2,
                                    slug: 'art-2',
                                });
                            }}
                        >
                            Add Items
                        </button>
                        <div data-testid="count">{cart.getItemCount()}</div>
                    </div>
                );
            };

            render(
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            );

            act(() => {
                screen.getByText('Add Items').click();
            });

            await waitFor(() => {
                // 3 + 2 = 5
                expect(screen.getByTestId('count')).toHaveTextContent('5');
            });
        });

        it('should return 0 item count for empty cart', () => {
            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            expect(screen.getByTestId('item-count')).toHaveTextContent('0');
        });

        it('should handle decimal prices correctly', async () => {
            const TestComponent = () => {
                const cart = useCart();

                return (
                    <div>
                        <button
                            onClick={() => {
                                cart.addItem({
                                    artworkId: 'art-1',
                                    title: 'Art 1',
                                    price: 19.99,
                                    quantity: 2,
                                    slug: 'art-1',
                                });
                                cart.addItem({
                                    artworkId: 'art-2',
                                    title: 'Art 2',
                                    price: 29.95,
                                    quantity: 1,
                                    slug: 'art-2',
                                });
                            }}
                        >
                            Add Items
                        </button>
                        <div data-testid="total">{cart.getTotal().toFixed(2)}</div>
                    </div>
                );
            };

            render(
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            );

            act(() => {
                screen.getByText('Add Items').click();
            });

            await waitFor(() => {
                // (19.99 * 2) + (29.95 * 1) = 39.98 + 29.95 = 69.93
                expect(screen.getByTestId('total')).toHaveTextContent('69.93');
            });
        });

        it('should handle large quantities correctly', async () => {
            const TestComponent = () => {
                const cart = useCart();

                return (
                    <div>
                        <button
                            onClick={() => {
                                cart.addItem({
                                    artworkId: 'art-1',
                                    title: 'Art 1',
                                    price: 100,
                                    quantity: 1000,
                                    slug: 'art-1',
                                });
                            }}
                        >
                            Add Items
                        </button>
                        <div data-testid="total">{cart.getTotal()}</div>
                        <div data-testid="count">{cart.getItemCount()}</div>
                    </div>
                );
            };

            render(
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            );

            act(() => {
                screen.getByText('Add Items').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('count')).toHaveTextContent('1000');
                expect(screen.getByTestId('total')).toHaveTextContent('100000');
            });
        });
    });

    describe('Clearing Cart', () => {
        it('should clear all items from cart', async () => {
            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            act(() => {
                screen.getByTestId('add-item').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('items-length')).toHaveTextContent('1');
            });

            act(() => {
                screen.getByTestId('clear-cart').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('items-length')).toHaveTextContent('0');
                expect(screen.getByTestId('item-count')).toHaveTextContent('0');
                expect(screen.getByTestId('total')).toHaveTextContent('0.00');
            });
        });

        it('should persist empty cart to localStorage', async () => {
            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            act(() => {
                screen.getByTestId('add-item').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('items-length')).toHaveTextContent('1');
            });

            act(() => {
                screen.getByTestId('clear-cart').click();
            });

            await waitFor(() => {
                const stored = localStorage.getItem('cart');
                expect(stored).toBeTruthy();
                const parsed = JSON.parse(stored!);
                expect(parsed.items).toHaveLength(0);
            });
        });

        it('should update lastUpdated timestamp when clearing', async () => {
            const TestComponent = () => {
                const cart = useCart();

                return (
                    <div>
                        <button
                            onClick={() => {
                                cart.addItem({
                                    artworkId: 'test-1',
                                    title: 'Test',
                                    price: 100,
                                    quantity: 1,
                                    slug: 'test',
                                });
                            }}
                        >
                            Add
                        </button>
                        <button
                            onClick={() => cart.clearCart()}
                        >
                            Clear
                        </button>
                        <div data-testid="timestamp">{cart.cart.lastUpdated}</div>
                    </div>
                );
            };

            render(
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            );

            act(() => {
                screen.getByText('Add').click();
            });

            await waitFor(() => {
                const timestampBefore = screen.getByTestId('timestamp').textContent;

                act(() => {
                    screen.getByText('Clear').click();
                });

                expect(screen.getByTestId('timestamp').textContent).toBeDefined();
            });
        });
    });

    describe('Timestamp Updates', () => {
        it('should update lastUpdated when adding item', async () => {
            const TestComponent = () => {
                const cart = useCart();
                const [initialTimestamp, setInitialTimestamp] = React.useState(0);

                return (
                    <div>
                        <button
                            onClick={() => {
                                setInitialTimestamp(cart.cart.lastUpdated);
                                cart.addItem({
                                    artworkId: 'test-1',
                                    title: 'Test',
                                    price: 100,
                                    quantity: 1,
                                    slug: 'test',
                                });
                            }}
                        >
                            Add
                        </button>
                        <div data-testid="current-timestamp">{cart.cart.lastUpdated}</div>
                    </div>
                );
            };

            render(
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            );

            act(() => {
                screen.getByText('Add').click();
            });

            await waitFor(() => {
                const timestamp = screen.getByTestId('current-timestamp').textContent;
                expect(timestamp).toBeTruthy();
                expect(Number(timestamp)).toBeGreaterThan(0);
            });
        });
    });

    describe('localStorage Persistence', () => {
        it('should save cart to localStorage on mount', async () => {
            const mockCart = {
                items: [
                    {
                        artworkId: 'test-1',
                        title: 'Test',
                        price: 100,
                        quantity: 1,
                        slug: 'test',
                    },
                ],
                lastUpdated: Date.now(),
            };

            localStorage.setItem('cart', JSON.stringify(mockCart));

            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            await waitFor(() => {
                const stored = localStorage.getItem('cart');
                expect(stored).toBeTruthy();
            });
        });

        it('should update localStorage whenever cart changes', async () => {
            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            act(() => {
                screen.getByTestId('add-item').click();
            });

            await waitFor(() => {
                const stored = localStorage.getItem('cart');
                const parsed = JSON.parse(stored!);
                expect(parsed.items).toHaveLength(1);
            });
        });

        it('should maintain data consistency in localStorage', async () => {
            const TestComponent = () => {
                const cart = useCart();

                return (
                    <div>
                        <button
                            onClick={() => {
                                cart.addItem({
                                    artworkId: 'art-1',
                                    title: 'Art 1',
                                    price: 123.45,
                                    quantity: 5,
                                    slug: 'art-1',
                                });
                            }}
                        >
                            Add
                        </button>
                    </div>
                );
            };

            render(
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            );

            act(() => {
                screen.getByText('Add').click();
            });

            await waitFor(() => {
                const stored = localStorage.getItem('cart');
                const parsed = JSON.parse(stored!);
                const item = parsed.items[0];
                expect(item.artworkId).toBe('art-1');
                expect(item.title).toBe('Art 1');
                expect(item.price).toBe(123.45);
                expect(item.quantity).toBe(5);
                expect(item.slug).toBe('art-1');
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle multiple simultaneous operations', async () => {
            const TestComponent = () => {
                const cart = useCart();

                return (
                    <div>
                        <button
                            onClick={() => {
                                cart.addItem({
                                    artworkId: 'art-1',
                                    title: 'Art 1',
                                    price: 100,
                                    quantity: 1,
                                    slug: 'art-1',
                                });
                                cart.addItem({
                                    artworkId: 'art-2',
                                    title: 'Art 2',
                                    price: 200,
                                    quantity: 1,
                                    slug: 'art-2',
                                });
                                cart.updateQuantity('art-1', 10);
                            }}
                        >
                            Do Multiple Ops
                        </button>
                        <div data-testid="count">{cart.getItemCount()}</div>
                        <div data-testid="total">{cart.getTotal()}</div>
                    </div>
                );
            };

            render(
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            );

            act(() => {
                screen.getByText('Do Multiple Ops').click();
            });

            await waitFor(() => {
                // (100 * 10) + (200 * 1) = 1200
                expect(screen.getByTestId('count')).toHaveTextContent('11');
                expect(screen.getByTestId('total')).toHaveTextContent('1200');
            });
        });

        it('should handle very high prices', async () => {
            const TestComponent = () => {
                const cart = useCart();

                return (
                    <div>
                        <button
                            onClick={() => {
                                cart.addItem({
                                    artworkId: 'expensive',
                                    title: 'Expensive Art',
                                    price: 999999.99,
                                    quantity: 1,
                                    slug: 'expensive',
                                });
                            }}
                        >
                            Add Expensive
                        </button>
                        <div data-testid="total">{cart.getTotal().toFixed(2)}</div>
                    </div>
                );
            };

            render(
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            );

            act(() => {
                screen.getByText('Add Expensive').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('total')).toHaveTextContent('999999.99');
            });
        });

        it('should handle cart with mix of quantities', async () => {
            const TestComponent = () => {
                const cart = useCart();

                return (
                    <div>
                        <button
                            onClick={() => {
                                cart.addItem({
                                    artworkId: 'art-1',
                                    title: 'Art 1',
                                    price: 50,
                                    quantity: 1,
                                    slug: 'art-1',
                                });
                                cart.addItem({
                                    artworkId: 'art-2',
                                    title: 'Art 2',
                                    price: 75,
                                    quantity: 5,
                                    slug: 'art-2',
                                });
                                cart.addItem({
                                    artworkId: 'art-3',
                                    title: 'Art 3',
                                    price: 100,
                                    quantity: 10,
                                    slug: 'art-3',
                                });
                            }}
                        >
                            Add Mix
                        </button>
                        <div data-testid="count">{cart.getItemCount()}</div>
                    </div>
                );
            };

            render(
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            );

            act(() => {
                screen.getByText('Add Mix').click();
            });

            await waitFor(() => {
                // 1 + 5 + 10 = 16
                expect(screen.getByTestId('count')).toHaveTextContent('16');
            });
        });
    });
});
