# Prod Order Creation Issue

## The Problem

When a customer completes checkout:

1. Stripe processes the payment successfully ✅
2. Stripe should send a webhook to your server to create the order in the database ❌
3. Your success page polls for the order and gets 404 because it doesn't exist ❌

The fact that you're seeing session ID cs*test*\* means you're using test mode Stripe keys in production, which is likely part of the issue.

## Root Causes

### Webhook Not Configured or Incorrect

The webhook endpoint https://www.yeoldeartoonist.com/api/checkout/webhook is either:

- Not set up in Stripe dashboard at all
- Pointing to the wrong URL
- Not receiving the correct events

### Missing or Wrong STRIPE_WEBHOOK_SECRET

The webhook handler in src/app/api/checkout/webhook/route.ts:68 requires `STRIPE_WEBHOOK_SECRET` to verify webhook signatures. If this is missing or incorrect, webhooks will fail.

## How to Fix

### Step 1: Check Your Stripe Keys

In your Vercel environment variables, verify:

- Are you using sk*test*_ or sk*live*_ keys?
- For production, you should use live keys (sk*live*_ and pk*live*_)
- If you want to test with test keys, that's fine, but you need to configure webhooks accordingly
    - Let's get the test keys working first, then we can switch to the live keys (which will actually start processing real credit card transactions!)

### Step 2: Configure the Webhook in Stripe

1. Go to https://dashboard.stripe.com/webhooks
2. Make sure you're in the correct mode (Test or Live) based on your keys
3. Click "Add endpoint"
4. Enter your webhook URL: https://www.yeoldeartoonist.com/api/checkout/webhook
5. Select these events:
    - checkout.session.completed (CRITICAL - this creates the order)
    - payment_intent.succeeded
    - payment_intent.payment_failed
6. Click "Add endpoint"

### Step 3: Update Environment Variables

1. Copy the webhook signing secret from Stripe (it starts with `whsec_...`)
2. In Vercel Dashboard → Your Project → Settings → Environment Variables
3. Add or update: `STRIPE_WEBHOOK_SECRET=whsec...`
4. Make sure it's set for the Production environment
5. Redeploy your application (or it will redeploy automatically when you save)

### Step 4: Test the Webhook

1. Complete a test order on your production site
2. Go to Stripe Dashboard → Developers → Webhooks → Your endpoint
3. Check the "Events" section - you should see events being received
4. If you see errors, click on them to see details

## Verify It's Working

After fixing the webhook, test a new order:

1. Complete checkout on production
2. The success page should now show your order number
3. Check your database - the order should exist
4. You should receive confirmation emails

## Quick Diagnostic

To check if webhooks are working right now:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Look for your production endpoint
3. Check recent events - are any being sent? Any errors?
