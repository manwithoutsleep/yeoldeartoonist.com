/**
 * Contact Form Submission Email Template
 *
 * React Email component for contact form submission notifications.
 * Sent to admin when someone submits the contact form.
 */

import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Hr,
    Row,
    Column,
} from '@react-email/components';

export interface ContactFormSubmissionProps {
    name: string;
    email: string;
    message: string;
    submittedAt: string;
}

/**
 * ContactFormSubmission Email Component
 *
 * Renders a professional contact form submission notification email
 * with sender information and message content.
 */
export function ContactFormSubmission({
    name,
    email,
    message,
    submittedAt,
}: ContactFormSubmissionProps) {
    const previewText = `New contact form submission from ${name}`;
    const formattedDate = new Date(submittedAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <Section style={header}>
                        <Heading style={h1}>
                            ✉️ New Contact Form Submission
                        </Heading>
                    </Section>

                    {/* Main Content */}
                    <Section style={content}>
                        <Text style={alertText}>
                            Someone has submitted the contact form on Ye Olde
                            Artoonist.
                        </Text>

                        {/* Contact Information */}
                        <Section style={contactInfo}>
                            <Heading as="h2" style={h2}>
                                Contact Information
                            </Heading>

                            <Row style={row}>
                                <Column style={labelColumn}>
                                    <Text style={label}>Name:</Text>
                                </Column>
                                <Column style={valueColumn}>
                                    <Text style={value}>{name}</Text>
                                </Column>
                            </Row>

                            <Row style={row}>
                                <Column style={labelColumn}>
                                    <Text style={label}>Email:</Text>
                                </Column>
                                <Column style={valueColumn}>
                                    <Text style={value}>{email}</Text>
                                </Column>
                            </Row>

                            <Row style={row}>
                                <Column style={labelColumn}>
                                    <Text style={label}>Submitted:</Text>
                                </Column>
                                <Column style={valueColumn}>
                                    <Text style={value}>{formattedDate}</Text>
                                </Column>
                            </Row>
                        </Section>

                        <Hr style={divider} />

                        {/* Message Content */}
                        <Heading as="h2" style={h2}>
                            Message
                        </Heading>
                        <Section style={messageSection}>
                            <Text style={messageText}>{message}</Text>
                        </Section>

                        <Hr style={divider} />

                        {/* Reply Instructions */}
                        <Text style={helpText}>
                            Reply directly to {email} to respond to this
                            inquiry.
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

// Styles (matching AdminNotification template patterns)
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
    backgroundColor: '#eff6ff',
    borderBottom: '3px solid #3b82f6',
};

const content = {
    padding: '0 24px',
};

const h1 = {
    color: '#1e40af',
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
    color: '#1e40af',
    fontSize: '16px',
    fontWeight: '600',
    lineHeight: '24px',
    margin: '24px 0',
    textAlign: 'center' as const,
};

const contactInfo = {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '16px',
    margin: '16px 0',
};

const row = {
    marginBottom: '8px',
};

const labelColumn = {
    width: '30%',
    paddingRight: '8px',
};

const valueColumn = {
    width: '70%',
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

const divider = {
    borderColor: '#e5e7eb',
    margin: '24px 0',
};

const messageSection = {
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '6px',
    borderLeft: '3px solid #3b82f6',
    margin: '12px 0',
};

const messageText = {
    color: '#1a1a1a',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '0',
    whiteSpace: 'pre-wrap' as const,
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

export default ContactFormSubmission;
