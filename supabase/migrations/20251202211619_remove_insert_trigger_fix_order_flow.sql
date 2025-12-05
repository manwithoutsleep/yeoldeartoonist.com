-- Migration: Remove INSERT trigger and fix order flow
--
-- Problem: The INSERT trigger fires before order_items are created,
-- so it tries to decrement inventory when no items exist yet.
--
-- Solution:
-- 1. Remove the INSERT trigger
-- 2. Keep only the UPDATE trigger
-- 3. Application code will create order with 'pending' status,
--    then update to 'succeeded' after items are created

-- Drop the problematic INSERT trigger
DROP TRIGGER IF EXISTS decrement_inventory_on_insert ON orders;
