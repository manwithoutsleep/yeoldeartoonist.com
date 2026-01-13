/**
 * Tests for NonceContext
 *
 * Comprehensive test suite for the CSP nonce context, covering:
 * - Context provider and hook setup
 * - Nonce propagation to children
 * - Hook behavior inside and outside provider
 * - Edge cases and error handling
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NonceProvider, useNonce } from '@/context/NonceContext';

/**
 * Test component that uses the useNonce hook
 */
function TestComponent() {
    const nonce = useNonce();
    return <div data-testid="nonce">{nonce || 'undefined'}</div>;
}

describe('NonceContext', () => {
    describe('NonceProvider', () => {
        it('should render children without errors', () => {
            const { container } = render(
                <NonceProvider>
                    <div>Test Content</div>
                </NonceProvider>
            );

            expect(container).toBeInTheDocument();
            expect(screen.getByText('Test Content')).toBeInTheDocument();
        });

        it('should provide nonce to children when nonce is provided', () => {
            render(
                <NonceProvider nonce="test-nonce-123">
                    <TestComponent />
                </NonceProvider>
            );

            expect(screen.getByTestId('nonce')).toHaveTextContent(
                'test-nonce-123'
            );
        });

        it('should provide undefined when no nonce is provided', () => {
            render(
                <NonceProvider>
                    <TestComponent />
                </NonceProvider>
            );

            expect(screen.getByTestId('nonce')).toHaveTextContent('undefined');
        });

        it('should handle empty string nonce', () => {
            render(
                <NonceProvider nonce="">
                    <TestComponent />
                </NonceProvider>
            );

            expect(screen.getByTestId('nonce')).toHaveTextContent('undefined');
        });

        it('should work with deeply nested children', () => {
            render(
                <NonceProvider nonce="deep-nonce">
                    <div>
                        <div>
                            <div>
                                <TestComponent />
                            </div>
                        </div>
                    </div>
                </NonceProvider>
            );

            expect(screen.getByTestId('nonce')).toHaveTextContent('deep-nonce');
        });
    });

    describe('useNonce Hook', () => {
        it('should return nonce value when inside provider', () => {
            render(
                <NonceProvider nonce="hook-test-nonce">
                    <TestComponent />
                </NonceProvider>
            );

            expect(screen.getByTestId('nonce')).toHaveTextContent(
                'hook-test-nonce'
            );
        });

        it('should return undefined when outside provider', () => {
            render(<TestComponent />);

            expect(screen.getByTestId('nonce')).toHaveTextContent('undefined');
        });

        it('should return undefined when nonce prop is not provided', () => {
            render(
                <NonceProvider>
                    <TestComponent />
                </NonceProvider>
            );

            expect(screen.getByTestId('nonce')).toHaveTextContent('undefined');
        });

        it('should handle nonce with special characters', () => {
            const specialNonce =
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
            render(
                <NonceProvider nonce={specialNonce}>
                    <TestComponent />
                </NonceProvider>
            );

            expect(screen.getByTestId('nonce')).toHaveTextContent(specialNonce);
        });
    });

    describe('Nonce Propagation', () => {
        it('should propagate nonce to multiple consumers', () => {
            function MultiConsumer() {
                const nonce = useNonce();
                return (
                    <div>
                        <span data-testid="consumer-1">{nonce}</span>
                        <span data-testid="consumer-2">{nonce}</span>
                        <span data-testid="consumer-3">{nonce}</span>
                    </div>
                );
            }

            render(
                <NonceProvider nonce="shared-nonce">
                    <MultiConsumer />
                </NonceProvider>
            );

            expect(screen.getByTestId('consumer-1')).toHaveTextContent(
                'shared-nonce'
            );
            expect(screen.getByTestId('consumer-2')).toHaveTextContent(
                'shared-nonce'
            );
            expect(screen.getByTestId('consumer-3')).toHaveTextContent(
                'shared-nonce'
            );
        });

        it('should propagate same nonce to sibling components', () => {
            function Sibling1() {
                const nonce = useNonce();
                return <div data-testid="sibling-1">{nonce}</div>;
            }

            function Sibling2() {
                const nonce = useNonce();
                return <div data-testid="sibling-2">{nonce}</div>;
            }

            render(
                <NonceProvider nonce="sibling-nonce">
                    <Sibling1 />
                    <Sibling2 />
                </NonceProvider>
            );

            expect(screen.getByTestId('sibling-1')).toHaveTextContent(
                'sibling-nonce'
            );
            expect(screen.getByTestId('sibling-2')).toHaveTextContent(
                'sibling-nonce'
            );
        });

        it('should handle nested providers with different nonces', () => {
            function InnerComponent() {
                const nonce = useNonce();
                return <div data-testid="inner">{nonce}</div>;
            }

            function OuterComponent() {
                const nonce = useNonce();
                return (
                    <div>
                        <div data-testid="outer">{nonce}</div>
                        <NonceProvider nonce="inner-nonce">
                            <InnerComponent />
                        </NonceProvider>
                    </div>
                );
            }

            render(
                <NonceProvider nonce="outer-nonce">
                    <OuterComponent />
                </NonceProvider>
            );

            expect(screen.getByTestId('outer')).toHaveTextContent(
                'outer-nonce'
            );
            expect(screen.getByTestId('inner')).toHaveTextContent(
                'inner-nonce'
            );
        });
    });

    describe('Edge Cases', () => {
        it('should handle very long nonces', () => {
            const longNonce = 'a'.repeat(1000);
            render(
                <NonceProvider nonce={longNonce}>
                    <TestComponent />
                </NonceProvider>
            );

            expect(screen.getByTestId('nonce')).toHaveTextContent(longNonce);
        });

        it('should handle nonce with only whitespace', () => {
            render(
                <NonceProvider nonce="   ">
                    <TestComponent />
                </NonceProvider>
            );

            // Note: HTML/React may collapse whitespace-only text
            const element = screen.getByTestId('nonce');
            expect(
                element.textContent === '   ' || element.textContent === ''
            ).toBe(true);
        });

        it('should work correctly when provider re-renders', () => {
            const { rerender } = render(
                <NonceProvider nonce="first-nonce">
                    <TestComponent />
                </NonceProvider>
            );

            expect(screen.getByTestId('nonce')).toHaveTextContent(
                'first-nonce'
            );

            rerender(
                <NonceProvider nonce="second-nonce">
                    <TestComponent />
                </NonceProvider>
            );

            expect(screen.getByTestId('nonce')).toHaveTextContent(
                'second-nonce'
            );
        });

        it('should maintain consistent nonce value across multiple renders', () => {
            let renderCount = 0;

            function CountingComponent() {
                const nonce = useNonce();
                renderCount++;
                return (
                    <div>
                        <div data-testid="nonce">{nonce}</div>
                        <div data-testid="render-count">{renderCount}</div>
                    </div>
                );
            }

            const { rerender } = render(
                <NonceProvider nonce="consistent-nonce">
                    <CountingComponent />
                </NonceProvider>
            );

            expect(screen.getByTestId('nonce')).toHaveTextContent(
                'consistent-nonce'
            );
            const initialRenderCount =
                screen.getByTestId('render-count').textContent;

            rerender(
                <NonceProvider nonce="consistent-nonce">
                    <CountingComponent />
                </NonceProvider>
            );

            expect(screen.getByTestId('nonce')).toHaveTextContent(
                'consistent-nonce'
            );
            expect(
                Number(screen.getByTestId('render-count').textContent)
            ).toBeGreaterThan(Number(initialRenderCount));
        });
    });

    describe('Type Safety', () => {
        it('should handle undefined nonce type correctly', () => {
            render(
                <NonceProvider nonce={undefined}>
                    <TestComponent />
                </NonceProvider>
            );

            expect(screen.getByTestId('nonce')).toHaveTextContent('undefined');
        });

        it('should accept valid base64 encoded nonces', () => {
            const base64Nonce = 'SGVsbG8gV29ybGQh'; // "Hello World!" in base64
            render(
                <NonceProvider nonce={base64Nonce}>
                    <TestComponent />
                </NonceProvider>
            );

            expect(screen.getByTestId('nonce')).toHaveTextContent(base64Nonce);
        });
    });

    describe('Integration with Real CSP Usage', () => {
        it('should provide nonce that can be used in nonce attributes', () => {
            function ScriptComponent() {
                const nonce = useNonce();
                return (
                    <div>
                        <script
                            data-testid="script"
                            nonce={nonce}
                            dangerouslySetInnerHTML={{
                                __html: 'console.log("test");',
                            }}
                        />
                    </div>
                );
            }

            const { container } = render(
                <NonceProvider nonce="csp-nonce-value">
                    <ScriptComponent />
                </NonceProvider>
            );

            const script = container.querySelector('script');
            expect(script).toHaveAttribute('nonce', 'csp-nonce-value');
        });

        it('should work with conditional rendering', () => {
            function ConditionalComponent({ show }: { show: boolean }) {
                const nonce = useNonce();
                return (
                    <div>
                        {show && <span data-testid="conditional">{nonce}</span>}
                    </div>
                );
            }

            const { rerender } = render(
                <NonceProvider nonce="conditional-nonce">
                    <ConditionalComponent show={false} />
                </NonceProvider>
            );

            expect(screen.queryByTestId('conditional')).not.toBeInTheDocument();

            rerender(
                <NonceProvider nonce="conditional-nonce">
                    <ConditionalComponent show={true} />
                </NonceProvider>
            );

            expect(screen.getByTestId('conditional')).toHaveTextContent(
                'conditional-nonce'
            );
        });
    });
});
