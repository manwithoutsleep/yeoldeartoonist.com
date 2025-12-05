# Payment Information Security

## Question

On the Payment form we have section labeled

> **Optional - Save my information for faster checkout**

If a customer fills this out,

1. Where does the information get saved?
2. Does Stripe save this?
3. Is it secure?

I want to avoid storing any financial information for which the site admin could be considered liable.

## Answer

### Where the Information is Saved

The "Optional - Save my information for faster checkout" section is rendered and managed entirely by Stripe through the PaymentElement component (line 102 in src/components/checkout/PaymentForm.tsx).

### Security & Storage

Good news: Your site is NOT storing any financial information. Here's what happens:

1. Stripe's PaymentElement renders that checkbox automatically when configured properly
2. If a customer checks it, Stripe saves their payment method securely on Stripe's servers using their https://stripe.com/docs/payments/save-and-reuse feature
3. No card data ever touches your server - it goes directly from the customer's browser to Stripe's servers
4. You only receive a tokenized reference (like pm_xxxxx) that you can use for future charges

### Liability & PCI Compliance

You are NOT liable for the financial data because:

- Your application uses Stripe Elements (PaymentElement), which is a PCI-compliant solution
- Card data never passes through your server - it's collected and encrypted by Stripe on their domain
- Stripe handles all PCI-DSS compliance requirements
- You're using what's called the "SAQ A" compliance level - the lowest liability level for merchants

### What You Store

Looking at your checkout API (/api/checkout), you only store:

- Customer name and email
- Shipping/billing addresses
- Order details (items, amounts)
- Stripe payment intent IDs (tokens, not actual card data)

None of these are considered sensitive financial data under PCI-DSS.

### Summary

The "save my information" feature is secure, managed by Stripe, and keeps you out of PCI compliance scope for storing payment methods. This is exactly the right architecture for avoiding liability while offering customers convenience.
