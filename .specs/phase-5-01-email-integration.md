# phase-5-01: Email Integration with Resend

## Parent Specification

This is sub-task 01 of the parent specification: `2025-10-25T17-55-00-mvp-implementation-plan.md` (Phase 5)

## Objective

Integrate Resend API for transactional emails, including order confirmation emails for customers and admin notification emails for new orders.

## Dependencies

**Prerequisites** (must be completed before this task):

- None - This can start immediately (Phases 1-4 are already complete)

**Blocks** (tasks that depend on this one):

- phase-5-06-production-deployment.md (needs email functionality working for production)

**Parallel Opportunities**:

- phase-5-02-performance-optimization.md
- phase-5-03-seo-optimization.md
- phase-5-04-accessibility-security-audit.md
- phase-5-05-error-handling-documentation.md

## Scope

Implement complete email functionality using Resend API for transactional emails sent during the order lifecycle.

### In Scope

- Resend email template setup (React components or dashboard templates)
- Email template functions for order confirmation and admin notifications
- Order confirmation email sent to customers on successful payment
- Admin notification email sent when new orders are received
- Integration with existing checkout webhook handler
- Testing email sending functionality with Resend
- HTML email templates with proper styling

### Out of Scope

- Shipping notification emails (future enhancement)
- Delivery notification emails (future enhancement)
- Marketing emails or newsletters
- Email preference management
- Unsubscribe functionality

## Implementation Requirements

### 5.1 Resend Email Setup

- Create email templates in Resend dashboard OR as React components using `@react-email/components`
- Create `src/lib/email/templates.ts` for email template functions
- Email templates needed:
    - Order confirmation (customer-facing)
    - New order notification (admin-facing)
- Use Resend React email templates for better HTML rendering and maintainability

### 5.2 Order Confirmation Email

- Create email template with the following content:
    - Order number and date
    - Order items with quantities, individual prices, and line totals
    - Shipping address
    - Order subtotal, shipping cost, tax, and total
    - Link to track order (placeholder for future enhancement)
    - Professional branding (logo, footer with contact info)
- Send email when order payment is captured (in webhook handler)
- Integrate into existing `src/app/api/checkout/webhook/route.ts`
- Test email sending with real Resend API in test mode

### 5.3 Admin Email Notifications

- Create admin notification email template with:
    - New order alert message
    - Order number and customer name
    - Order total and payment status
    - Link to view order in admin dashboard
    - Timestamp of order creation
- Send to configured admin email address (from environment variable)
- Integrate into webhook handler alongside customer confirmation email
- Test admin email delivery

## Files to Create/Modify

- `src/lib/email/templates.ts` - Email template functions
- `src/lib/email/templates/OrderConfirmation.tsx` - React email component for order confirmation (optional, if using React Email)
- `src/lib/email/templates/AdminNotification.tsx` - React email component for admin notification (optional)
- `src/app/api/checkout/webhook/route.ts` - Add email sending after order creation
- `.env.local` - Ensure `RESEND_API_KEY` and `EMAIL_FROM_ADDRESS` are set
- `.env.example` - Document email environment variables

## Testing Requirements

### Manual Testing

1. Complete a test purchase using Stripe test card
2. Verify customer receives order confirmation email
3. Verify admin receives new order notification email
4. Check email formatting in multiple email clients (Gmail, Outlook, Apple Mail)
5. Verify all order details are correct in emails
6. Test with different order scenarios (single item, multiple items, different totals)

### Automated Testing

- Add tests for email template generation
- Mock Resend API calls in webhook tests
- Verify email is triggered on `payment_intent.succeeded` event
- Test error handling when email sending fails (should not block order creation)

## Success Criteria

- [x] Resend API configured and tested
- [x] Email templates created with proper styling
- [x] Order confirmation email sends successfully to customers
- [x] Admin notification email sends successfully
- [x] Emails contain accurate order information
- [x] Email integration does not block order creation if sending fails
- [x] Emails display correctly in major email clients
- [x] All tests pass
- [x] The verify-code skill has been successfully executed

## Notes

### Resend Configuration

- Resend API key stored in `RESEND_API_KEY` environment variable
- From address configured in `EMAIL_FROM_ADDRESS` (e.g., `orders@yeoldeartoonist.com`)
- Resend requires domain verification for production use
- Use Resend test mode during development

### Error Handling

- Email sending should be non-blocking (order creation must succeed even if email fails)
- Log email failures for admin review
- Consider retry logic for transient failures
- Gracefully handle invalid email addresses

### React Email vs. HTML Templates

- **Option 1**: Use `@react-email/components` for maintainable React-based templates
- **Option 2**: Use plain HTML templates in Resend dashboard
- Recommendation: Use React Email for better developer experience and version control

### Email Content Best Practices

- Keep emails concise and scannable
- Use clear subject lines (e.g., "Order Confirmation #12345")
- Include branding (logo, colors) for professional appearance
- Provide customer support contact info in footer
- Use responsive design for mobile email clients
- Test with spam filters to ensure deliverability
