-- Migration: Add unique constraint to payment_intent_id
-- Purpose: Prevent duplicate orders from concurrent webhook processing
-- Related to: Phase 4.5 - Stripe Checkout webhook race condition fix
-- Date: 2025-12-06

-- Add unique constraint to payment_intent_id to prevent race conditions
-- This ensures that even if multiple webhook events arrive simultaneously,
-- only one order can be created per payment intent
ALTER TABLE orders
ADD CONSTRAINT orders_payment_intent_id_unique
UNIQUE (payment_intent_id);

-- Create index for faster duplicate checking
-- Note: The UNIQUE constraint already creates an index, but we're being explicit
-- This helps with the webhook's duplicate check query performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id
ON orders (payment_intent_id)
WHERE payment_intent_id IS NOT NULL;
