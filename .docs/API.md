# API Documentation

This document describes the API endpoints available in the Ye Olde Artoonist application.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Public Endpoints](#public-endpoints)
- [Checkout Endpoints](#checkout-endpoints)
- [Admin Endpoints](#admin-endpoints)

## Overview

### Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://yeoldeartoonist.com/api`

### Response Format

All API responses follow a consistent format:

**Success Response**:

```json
{
  "data": { ... },
  "success": true
}
```

**Error Response**:

```json
{
  "error": {
    "message": "User-friendly error message",
    "code": "ERROR_CODE",
    "details": { ... }  // Only in development
  }
}
```

### Error Codes

| Code                   | Description               | HTTP Status |
| ---------------------- | ------------------------- | ----------- |
| `DATABASE_ERROR`       | Database query failed     | 500         |
| `VALIDATION_ERROR`     | Invalid request data      | 400         |
| `AUTHENTICATION_ERROR` | Authentication required   | 401         |
| `AUTHORIZATION_ERROR`  | Permission denied         | 403         |
| `NOT_FOUND`            | Resource not found        | 404         |
| `PAYMENT_ERROR`        | Payment processing failed | 500         |
| `WEBHOOK_ERROR`        | Webhook processing failed | 400/500     |
| `UNKNOWN_ERROR`        | Unexpected error          | 500         |

## Authentication

### Admin Endpoints

Admin endpoints require authentication via Supabase Auth.

**Authentication Method**: Session-based (magic link)

**Headers**: No special headers required (cookies are used)

**Protected Routes**: All `/admin/*` routes are protected by middleware

## Error Handling

All endpoints use standardized error responses created with the `createApiErrorResponse()` utility.

Example error response:

```json
{
    "error": {
        "message": "We're having trouble loading this content. Please try again in a moment.",
        "code": "DATABASE_ERROR"
    }
}
```

In development, errors include additional `details` field:

```json
{
    "error": {
        "message": "We're having trouble loading this content. Please try again in a moment.",
        "code": "DATABASE_ERROR",
        "details": "Error details here..."
    }
}
```

## Public Endpoints

### Cart Validation

Validates shopping cart items server-side to ensure data integrity.

**Endpoint**: `POST /api/checkout/validate`

**Authentication**: Not required

**Request Body**:

```json
{
    "items": [
        {
            "artworkId": "uuid",
            "title": "Artwork Title",
            "price": 50.0,
            "quantity": 2,
            "slug": "artwork-title"
        }
    ]
}
```

**Success Response** (200):

```json
{
    "cart": {
        "isValid": true,
        "items": [
            {
                "artworkId": "uuid",
                "title": "Artwork Title",
                "price": 50.0,
                "quantity": 2,
                "slug": "artwork-title"
            }
        ],
        "subtotal": 100.0,
        "shippingCost": 5.0,
        "taxAmount": 0,
        "total": 105.0
    }
}
```

**Validation Error Response** (400):

```json
{
    "error": "Cart validation failed",
    "cart": {
        "isValid": false,
        "items": [],
        "subtotal": 0,
        "shippingCost": 0,
        "taxAmount": 0,
        "total": 0,
        "errors": ["Item not found", "Price mismatch detected"]
    }
}
```

**Error Response** (500):

```json
{
    "error": {
        "message": "We're having trouble loading this content. Please try again in a moment.",
        "code": "UNKNOWN_ERROR"
    }
}
```

**Validation Rules**:

- All items must exist in database
- Items must be published
- Prices must match database (prevents tampering)
- Sufficient inventory must be available

## Checkout Endpoints

### Create Checkout Session

Creates a Stripe Checkout session for payment processing.

**Endpoint**: `POST /api/checkout/session`

**Authentication**: Not required

**Request Body**:

```json
{
    "items": [
        {
            "artworkId": "uuid",
            "title": "Artwork Title",
            "price": 50.0,
            "quantity": 2,
            "slug": "artwork-title"
        }
    ],
    "customerEmail": "customer@example.com" // Optional
}
```

**Success Response** (200):

```json
{
    "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Response Fields**:

- `url` - Stripe Checkout URL to redirect customer to

**Error Responses**:

Validation Error (400):

```json
{
    "error": {
        "message": "Please check the information you entered and try again.",
        "code": "VALIDATION_ERROR"
    }
}
```

Payment Error (500):

```json
{
    "error": {
        "message": "We couldn't process your payment. Please check your information and try again.",
        "code": "PAYMENT_ERROR"
    }
}
```

**Usage Flow**:

1. Validate cart with `/api/checkout/validate`
2. Create session with `/api/checkout/session`
3. Redirect user to returned `url`
4. Stripe handles payment
5. User redirected to success/cancel URL
6. Webhook creates order

**Configuration**:

- Shipping: Flat rate $5.00 (US only)
- Tax: Automatically calculated by Stripe
- Success URL: `/shoppe/checkout/success?session_id={CHECKOUT_SESSION_ID}`
- Cancel URL: `/shoppe/cart`

### Webhook Handler

Receives and processes Stripe webhook events.

**Endpoint**: `POST /api/checkout/webhook`

**Authentication**: Stripe signature verification

**Headers**:

```
stripe-signature: t=timestamp,v1=signature
```

**Request Body**: Raw Stripe webhook event JSON

**Events Handled**:

1. **payment_intent.succeeded**
    - Creates order in database
    - Sends confirmation emails

2. **payment_intent.payment_failed**
    - Logs failed payment

3. **checkout.session.completed**
    - Alternative order creation flow
    - Sends confirmation emails

**Success Response** (200):

```json
{
    "received": true
}
```

**Error Responses**:

Invalid Signature (400):

```json
{
    "error": {
        "message": "We're having trouble processing this request. Please try again.",
        "code": "WEBHOOK_ERROR"
    }
}
```

**Note**: This endpoint is called by Stripe, not directly by clients.

**Setup**:

1. Configure webhook in Stripe Dashboard
2. Set webhook URL: `https://yourdomain.com/api/checkout/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.completed`
4. Add signing secret to environment variables

### Get Checkout Session

Retrieves checkout session details.

**Endpoint**: `GET /api/checkout/session/[sessionId]`

**Authentication**: Not required

**Parameters**:

- `sessionId` - Stripe Checkout Session ID (from URL)

**Success Response** (200):

```json
{
    "session": {
        "id": "cs_test_...",
        "payment_status": "paid",
        "customer_email": "customer@example.com",
        "amount_total": 10500, // In cents
        "currency": "usd"
    }
}
```

**Error Response** (404):

```json
{
    "error": {
        "message": "The content you're looking for could not be found.",
        "code": "NOT_FOUND"
    }
}
```

**Usage**: Called on success page to display order confirmation

## Admin Endpoints

All admin endpoints require authentication.

### Get Orders

Retrieves all orders with optional filtering and pagination.

**Endpoint**: `GET /api/admin/orders`

**Authentication**: Required (admin session)

**Query Parameters**:

- `limit` (optional) - Number of orders to return (default: 20)
- `offset` (optional) - Number of orders to skip (default: 0)
- `status` (optional) - Filter by order status

**Success Response** (200):

```json
{
    "orders": [
        {
            "id": "uuid",
            "order_number": "ORD-20240315-ABC123",
            "customer_name": "John Doe",
            "customer_email": "john@example.com",
            "total": 105.0,
            "status": "pending",
            "created_at": "2024-03-15T12:00:00Z",
            "items": [
                {
                    "artwork_id": "uuid",
                    "title": "Artwork Title",
                    "quantity": 2,
                    "price": 50.0
                }
            ],
            "shipping_address": {
                "line1": "123 Main St",
                "city": "Portland",
                "state": "OR",
                "zip": "97201",
                "country": "US"
            }
        }
    ],
    "total": 15
}
```

**Error Response** (500):

```json
{
    "error": {
        "message": "We're having trouble loading this content. Please try again in a moment.",
        "code": "DATABASE_ERROR"
    }
}
```

**Order Statuses**:

- `pending` - Payment received, awaiting processing
- `processing` - Being prepared for shipment
- `shipped` - Sent to customer
- `delivered` - Confirmed received
- `cancelled` - Order cancelled
- `refunded` - Payment refunded

## Rate Limiting

Currently, no rate limiting is implemented. For production at scale, consider adding rate limiting middleware.

**Recommended Limits** (future):

- Public endpoints: 100 requests/minute per IP
- Admin endpoints: 1000 requests/minute per user
- Webhook endpoint: 10,000 requests/hour (Stripe's rate)

## Webhooks

### Stripe Webhooks

See [Webhook Handler](#webhook-handler) section above.

**Security**:

- Signature verification using `STRIPE_WEBHOOK_SECRET`
- Rejects unsigned or invalid requests
- Idempotent processing (handles duplicate events)

**Retry Logic**:

- Stripe automatically retries failed webhooks
- Exponential backoff up to 3 days
- Check Stripe dashboard for failed webhooks

## Testing

### Test in Development

```bash
# Start dev server
npm run dev

# Test validation endpoint
curl -X POST http://localhost:3000/api/checkout/validate \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{
      "artworkId": "uuid-here",
      "title": "Test Art",
      "price": 50.00,
      "quantity": 1,
      "slug": "test-art"
    }]
  }'
```

### Test Stripe Webhooks Locally

```bash
# Install Stripe CLI
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/checkout/webhook

# In another terminal, trigger test event
stripe trigger payment_intent.succeeded
```

### Test Cards (Development Only)

Use these test cards in Stripe Checkout:

| Card Number         | Description        |
| ------------------- | ------------------ |
| 4242 4242 4242 4242 | Success            |
| 4000 0000 0000 0002 | Card declined      |
| 4000 0025 0000 3155 | 3D Secure required |

Use any future expiry date, any 3-digit CVC, any postal code.

## Best Practices

### Client-Side Usage

1. **Always validate cart** before checkout
2. **Handle errors gracefully** and show user-friendly messages
3. **Use HTTPS** in production
4. **Don't cache sensitive data** (payment info, personal data)

### Server-Side Usage

1. **Validate all inputs** with Zod schemas
2. **Use type-safe responses** with TypeScript
3. **Log errors properly** using error logger utility
4. **Never expose secrets** in responses
5. **Use service role client** for admin operations

### Security

1. **Never trust client data** - Always validate server-side
2. **Use RLS policies** for database access control
3. **Verify webhooks** with signature checking
4. **Sanitize logs** - Never log sensitive data
5. **Rate limit** in production (future)

## SDK / Client Libraries

No official SDK is provided. Use standard HTTP clients:

**JavaScript/TypeScript**:

```typescript
// Using fetch
const response = await fetch('/api/checkout/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
});

const data = await response.json();

if (!response.ok) {
    // Handle error
    console.error(data.error.message);
}
```

**Axios**:

```typescript
import axios from 'axios';

try {
    const { data } = await axios.post('/api/checkout/validate', { items });
    console.log(data.cart);
} catch (error) {
    if (axios.isAxiosError(error)) {
        console.error(error.response?.data.error.message);
    }
}
```

## Changelog

### Version 1.0.0 (Current)

- Initial API implementation
- Cart validation endpoint
- Stripe checkout integration
- Webhook processing
- Admin orders endpoint
- Standardized error responses

### Future Enhancements

- [ ] Rate limiting
- [ ] API versioning
- [ ] GraphQL endpoint (if needed)
- [ ] Bulk operations for admin
- [ ] Order search and filtering
- [ ] Analytics endpoints
- [ ] Export functionality

## Support

For API issues:

1. Check this documentation
2. Review [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
3. Check browser console for errors
4. Contact developer with:
    - Endpoint and method
    - Request payload
    - Error response
    - Expected behavior
