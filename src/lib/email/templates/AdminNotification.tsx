/**
 * Admin Notification Email Template
 *
 * React Email component for admin new order notification emails.
 * Sent when a new order is created to alert administrators.
 */

import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Hr,
    Row,
    Column,
} from '@react-email/components';
import type { Order } from '@/types/order';

interface AdminNotificationProps {
    order: Order;
    siteUrl: string;
}

/**
 * AdminNotification Email Component
 *
 * Renders a concise admin notification email with key order information
 * and a link to view the full order details in the admin dashboard.
 */
export function AdminNotification({ order, siteUrl }: AdminNotificationProps) {
    const previewText = `New order #${order.orderNumber} from ${order.customerName}`;
    const adminDashboardUrl = `${siteUrl}/admin/orders/${order.id}`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <Section style={header}>
                        <Heading style={h1}>🎨 New Order Received</Heading>
                    </Section>

                    {/* Main Content */}
                    <Section style={content}>
                        <Text style={alertText}>
                            A new order has been placed on Ye Olde Artoonist.
                        </Text>

                        {/* Order Summary */}
                        <Section style={orderSummary}>
                            <Heading as="h2" style={h2}>
                                Order Summary
                            </Heading>

                            <Row style={row}>
                                <Column style={labelColumn}>
                                    <Text style={label}>Order Number:</Text>
                                </Column>
                                <Column style={valueColumn}>
                                    <Text style={value}>
                                        {order.orderNumber}
                                    </Text>
                                </Column>
                            </Row>

                            <Row style={row}>
                                <Column style={labelColumn}>
                                    <Text style={label}>Customer:</Text>
                                </Column>
                                <Column style={valueColumn}>
                                    <Text style={value}>
                                        {order.customerName}
                                    </Text>
                                </Column>
                            </Row>

                            <Row style={row}>
                                <Column style={labelColumn}>
                                    <Text style={label}>Email:</Text>
                                </Column>
                                <Column style={valueColumn}>
                                    <Text style={value}>
                                        {order.customerEmail}
                                    </Text>
                                </Column>
                            </Row>

                            <Row style={row}>
                                <Column style={labelColumn}>
                                    <Text style={label}>Order Total:</Text>
                                </Column>
                                <Column style={valueColumn}>
                                    <Text style={valueBold}>
                                        ${order.total.toFixed(2)}
                                    </Text>
                                </Column>
                            </Row>

                            <Row style={row}>
                                <Column style={labelColumn}>
                                    <Text style={label}>Payment Status:</Text>
                                </Column>
                                <Column style={valueColumn}>
                                    <Text style={statusSuccess}>
                                        {order.paymentStatus.toUpperCase()}
                                    </Text>
                                </Column>
                            </Row>

                            <Row style={row}>
                                <Column style={labelColumn}>
                                    <Text style={label}>Order Time:</Text>
                                </Column>
                                <Column style={valueColumn}>
                                    <Text style={value}>
                                        {new Date(
                                            order.createdAt
                                        ).toLocaleString('en-US', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        })}
                                    </Text>
                                </Column>
                            </Row>
                        </Section>

                        <Hr style={divider} />

                        {/* Order Items Summary */}
                        <Heading as="h2" style={h2}>
                            Items ({order.items.length})
                        </Heading>
                        {order.items.map((item, index) => (
                            <Section key={index} style={itemSection}>
                                <Text style={itemText}>
                                    • {item.title || 'Artwork'} ×{' '}
                                    {item.quantity} - $
                                    {item.lineSubtotal.toFixed(2)}
                                </Text>
                            </Section>
                        ))}

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
                                    Customer Notes
                                </Heading>
                                <Text style={notes}>{order.orderNotes}</Text>
                            </>
                        )}

                        <Hr style={divider} />

                        {/* Call to Action */}
                        <Section style={ctaSection}>
                            <Link href={adminDashboardUrl} style={button}>
                                View Order in Admin Dashboard
                            </Link>
                        </Section>

                        <Text style={helpText}>
                            Click the button above to view full order details,
                            update status, and manage shipping.
                        </Text>
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            This is an automated notification from Ye Olde
                            Artoonist.
                        </Text>
                        <Text style={footerText}>
                            © {new Date().getFullYear()} Ye Olde Artoonist
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
    backgroundColor: '#f0fdf4',
    borderBottom: '3px solid #10b981',
};

const content = {
    padding: '0 24px',
};

const h1 = {
    color: '#166534',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0',
    padding: '0',
};

const h2 = {
    color: '#1a1a1a',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '24px 0 12px',
    padding: '0',
};

const alertText = {
    color: '#166534',
    fontSize: '16px',
    fontWeight: '600',
    lineHeight: '24px',
    margin: '24px 0',
    textAlign: 'center' as const,
};

const orderSummary = {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '16px',
    margin: '16px 0',
};

const row = {
    marginBottom: '8px',
};

const labelColumn = {
    width: '40%',
    paddingRight: '8px',
};

const valueColumn = {
    width: '60%',
};

const label = {
    color: '#737373',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0',
};

const value = {
    color: '#1a1a1a',
    fontSize: '14px',
    margin: '0',
};

const valueBold = {
    color: '#1a1a1a',
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0',
};

const statusSuccess = {
    color: '#059669',
    fontSize: '14px',
    fontWeight: 'bold',
    margin: '0',
};

const divider = {
    borderColor: '#e5e7eb',
    margin: '24px 0',
};

const itemSection = {
    margin: '8px 0',
};

const itemText = {
    color: '#525252',
    fontSize: '14px',
    margin: '4px 0',
};

const address = {
    color: '#525252',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '12px 0',
    backgroundColor: '#f9fafb',
    padding: '12px',
    borderRadius: '6px',
};

const notes = {
    color: '#525252',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '12px 0',
    fontStyle: 'italic',
    backgroundColor: '#fffbeb',
    padding: '12px',
    borderRadius: '6px',
    borderLeft: '3px solid #f59e0b',
};

const ctaSection = {
    textAlign: 'center' as const,
    margin: '32px 0',
};

const button = {
    backgroundColor: '#2563eb',
    borderRadius: '6px',
    color: '#ffffff',
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: '600',
    padding: '12px 24px',
    textDecoration: 'none',
    textAlign: 'center' as const,
};

const helpText = {
    color: '#737373',
    fontSize: '12px',
    lineHeight: '16px',
    margin: '16px 0',
    textAlign: 'center' as const,
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

export default AdminNotification;
