/**
 * Order Confirmation Email Template
 *
 * React Email component for customer order confirmation emails.
 * Sent after successful payment processing.
 */

import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Hr,
    Row,
    Column,
} from '@react-email/components';
import type { Order } from '@/types/order';

interface OrderConfirmationProps {
    order: Order;
    siteUrl: string;
}

/**
 * OrderConfirmation Email Component
 *
 * Renders a professional order confirmation email with order details,
 * items, pricing breakdown, and shipping information.
 */
export function OrderConfirmation({ order, siteUrl }: OrderConfirmationProps) {
    const previewText = `Order #${order.orderNumber} confirmed - Thank you for your purchase!`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header with Logo */}
                    <Section style={header}>
                        <Img
                            src={`${siteUrl}/logo.png`}
                            alt="Ye Olde Artoonist"
                            width="200"
                            height="50"
                            style={logo}
                        />
                    </Section>

                    {/* Main Content */}
                    <Section style={content}>
                        <Heading style={h1}>Order Confirmation</Heading>
                        <Text style={text}>
                            Thank you for your order! We&apos;ve received your
                            payment and are preparing your items for shipment.
                        </Text>

                        {/* Order Number and Date */}
                        <Section style={orderInfo}>
                            <Text style={label}>
                                <strong>Order Number:</strong>{' '}
                                {order.orderNumber}
                            </Text>
                            <Text style={label}>
                                <strong>Order Date:</strong>{' '}
                                {new Date(order.createdAt).toLocaleDateString(
                                    'en-US',
                                    {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    }
                                )}
                            </Text>
                        </Section>

                        <Hr style={divider} />

                        {/* Order Items */}
                        <Heading as="h2" style={h2}>
                            Order Items
                        </Heading>
                        {order.items.map((item, index) => (
                            <Section key={index} style={itemSection}>
                                <Row>
                                    <Column style={{ width: '70%' }}>
                                        <Text style={itemTitle}>
                                            {item.title || 'Artwork'}
                                        </Text>
                                        <Text style={itemDetails}>
                                            Quantity: {item.quantity} × $
                                            {item.priceAtPurchase.toFixed(2)}
                                        </Text>
                                    </Column>
                                    <Column
                                        style={{
                                            width: '30%',
                                            textAlign: 'right',
                                        }}
                                    >
                                        <Text style={itemPrice}>
                                            ${item.lineSubtotal.toFixed(2)}
                                        </Text>
                                    </Column>
                                </Row>
                            </Section>
                        ))}

                        <Hr style={divider} />

                        {/* Pricing Breakdown */}
                        <Section style={totals}>
                            <Row>
                                <Column style={{ width: '70%' }}>
                                    <Text style={totalLabel}>Subtotal:</Text>
                                </Column>
                                <Column
                                    style={{ width: '30%', textAlign: 'right' }}
                                >
                                    <Text style={totalValue}>
                                        ${order.subtotal.toFixed(2)}
                                    </Text>
                                </Column>
                            </Row>
                            <Row>
                                <Column style={{ width: '70%' }}>
                                    <Text style={totalLabel}>Shipping:</Text>
                                </Column>
                                <Column
                                    style={{ width: '30%', textAlign: 'right' }}
                                >
                                    <Text style={totalValue}>
                                        ${order.shippingCost.toFixed(2)}
                                    </Text>
                                </Column>
                            </Row>
                            <Row>
                                <Column style={{ width: '70%' }}>
                                    <Text style={totalLabel}>Tax:</Text>
                                </Column>
                                <Column
                                    style={{ width: '30%', textAlign: 'right' }}
                                >
                                    <Text style={totalValue}>
                                        ${order.taxAmount.toFixed(2)}
                                    </Text>
                                </Column>
                            </Row>
                            <Hr style={divider} />
                            <Row>
                                <Column style={{ width: '70%' }}>
                                    <Text style={totalLabelBold}>Total:</Text>
                                </Column>
                                <Column
                                    style={{ width: '30%', textAlign: 'right' }}
                                >
                                    <Text style={totalValueBold}>
                                        ${order.total.toFixed(2)}
                                    </Text>
                                </Column>
                            </Row>
                        </Section>

                        <Hr style={divider} />

                        {/* Shipping Address */}
                        <Heading as="h2" style={h2}>
                            Shipping Address
                        </Heading>
                        <Text style={address}>
                            {order.customerName}
                            <br />
                            {order.shippingAddress.line1}
                            <br />
                            {order.shippingAddress.line2 && (
                                <>
                                    {order.shippingAddress.line2}
                                    <br />
                                </>
                            )}
                            {order.shippingAddress.city},{' '}
                            {order.shippingAddress.state}{' '}
                            {order.shippingAddress.zip}
                            <br />
                            {order.shippingAddress.country}
                        </Text>

                        {order.orderNotes && (
                            <>
                                <Hr style={divider} />
                                <Heading as="h2" style={h2}>
                                    Order Notes
                                </Heading>
                                <Text style={text}>{order.orderNotes}</Text>
                            </>
                        )}

                        <Hr style={divider} />

                        {/* Tracking Info Placeholder */}
                        <Text style={text}>
                            We&apos;ll send you another email with tracking
                            information once your order ships.
                        </Text>

                        <Text style={text}>
                            If you have any questions about your order, please
                            contact us.
                        </Text>
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            © {new Date().getFullYear()} Ye Olde Artoonist. All
                            rights reserved.
                        </Text>
                        <Text style={footerText}>
                            Visit us at{' '}
                            <Link href={siteUrl} style={link}>
                                {siteUrl}
                            </Link>
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

// Styles
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    maxWidth: '600px',
};

const header = {
    padding: '32px 24px',
    textAlign: 'center' as const,
    backgroundColor: '#f8f9fa',
};

const logo = {
    margin: '0 auto',
};

const content = {
    padding: '0 24px',
};

const h1 = {
    color: '#1a1a1a',
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '32px 0 16px',
    padding: '0',
    textAlign: 'center' as const,
};

const h2 = {
    color: '#1a1a1a',
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '24px 0 12px',
    padding: '0',
};

const text = {
    color: '#525252',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '16px 0',
};

const label = {
    color: '#525252',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '4px 0',
};

const orderInfo = {
    margin: '24px 0',
};

const divider = {
    borderColor: '#e5e7eb',
    margin: '24px 0',
};

const itemSection = {
    margin: '16px 0',
};

const itemTitle = {
    color: '#1a1a1a',
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 4px',
};

const itemDetails = {
    color: '#737373',
    fontSize: '14px',
    margin: '0',
};

const itemPrice = {
    color: '#1a1a1a',
    fontSize: '16px',
    fontWeight: '600',
    margin: '0',
};

const totals = {
    margin: '24px 0',
};

const totalLabel = {
    color: '#525252',
    fontSize: '16px',
    margin: '8px 0',
};

const totalValue = {
    color: '#1a1a1a',
    fontSize: '16px',
    margin: '8px 0',
};

const totalLabelBold = {
    color: '#1a1a1a',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '8px 0',
};

const totalValueBold = {
    color: '#1a1a1a',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '8px 0',
};

const address = {
    color: '#525252',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '12px 0',
};

const footer = {
    borderTop: '1px solid #e5e7eb',
    margin: '32px 24px 0',
    padding: '24px 0 0',
    textAlign: 'center' as const,
};

const footerText = {
    color: '#737373',
    fontSize: '12px',
    lineHeight: '16px',
    margin: '4px 0',
};

const link = {
    color: '#2563eb',
    textDecoration: 'underline',
};

export default OrderConfirmation;
