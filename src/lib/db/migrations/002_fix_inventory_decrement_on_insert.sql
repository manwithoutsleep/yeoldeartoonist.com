-- Migration 002: Fix inventory decrement on order INSERT
--
-- Problem: The decrement_inventory_on_payment trigger only fires on UPDATE,
-- but when orders are created from successful payment webhooks, they need
-- to decrement inventory immediately on INSERT.
--
-- Solution: Add an AFTER INSERT trigger that also calls the same inventory
-- decrement function when payment_status = 'succeeded'.

-- Add INSERT trigger to decrement inventory when order is created with succeeded payment
CREATE TRIGGER decrement_inventory_on_insert
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION decrement_artwork_inventory();

-- Note: The existing decrement_artwork_inventory() function already handles
-- both INSERT (OLD is NULL) and UPDATE cases correctly:
-- - For INSERT: OLD.payment_status is NULL, so IS DISTINCT FROM 'succeeded' is TRUE
-- - For UPDATE: Checks if payment_status changed from non-succeeded to succeeded
