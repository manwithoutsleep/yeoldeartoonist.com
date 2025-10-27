-- Phase 1: Complete Database Schema for yeoldeartoonist.com
-- This migration creates all tables, indexes, functions, and triggers

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Helper Function: update_updated_at_column
-- ============================================================================
-- This trigger function automatically updates the updated_at timestamp on any table row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW() AT TIME ZONE 'UTC';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Helper Function: generate_order_number
-- ============================================================================
-- Generates a unique order number in format ORD-{timestamp}-{random}
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Table: administrators
-- ============================================================================
-- Stores admin user accounts with role-based access control
CREATE TABLE administrators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID NOT NULL UNIQUE,  -- Links to Supabase Auth user
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() AT TIME ZONE 'UTC'
);

CREATE INDEX idx_administrators_auth_id ON administrators(auth_id);
CREATE INDEX idx_administrators_email ON administrators(email);
CREATE INDEX idx_administrators_is_active ON administrators(is_active);

CREATE TRIGGER update_administrators_updated_at
    BEFORE UPDATE ON administrators
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table: artwork
-- ============================================================================
-- Stores all artwork/products for sale
CREATE TABLE artwork (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT NOT NULL UNIQUE,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    sku TEXT,
    inventory_count INTEGER NOT NULL DEFAULT 0,
    is_limited_edition BOOLEAN NOT NULL DEFAULT false,
    medium TEXT,
    dimensions TEXT,
    year_created INTEGER,
    image_url TEXT,  -- Main image URL from Supabase Storage
    image_thumbnail_url TEXT,  -- Thumbnail variant
    image_large_url TEXT,  -- Large variant
    is_published BOOLEAN NOT NULL DEFAULT false,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    alt_text TEXT,
    seo_title TEXT,
    seo_description TEXT,
    tags TEXT[],  -- Array of tag strings for filtering
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() AT TIME ZONE 'UTC'
);

CREATE INDEX idx_artwork_slug ON artwork(slug);
CREATE INDEX idx_artwork_is_published ON artwork(is_published);
CREATE INDEX idx_artwork_is_featured ON artwork(is_featured);
CREATE INDEX idx_artwork_created_at ON artwork(created_at DESC);
CREATE INDEX idx_artwork_display_order ON artwork(display_order);
CREATE INDEX idx_artwork_tags ON artwork USING GIN(tags);

CREATE TRIGGER update_artwork_updated_at
    BEFORE UPDATE ON artwork
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table: pages
-- ============================================================================
-- Stores custom page content (home hero, about, etc.)
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    description TEXT,
    is_published BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() AT TIME ZONE 'UTC'
);

CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_is_published ON pages(is_published);
CREATE INDEX idx_pages_display_order ON pages(display_order);

CREATE TRIGGER update_pages_updated_at
    BEFORE UPDATE ON pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table: page_artwork
-- ============================================================================
-- Junction table to associate artwork with pages (e.g., featured on homepage)
CREATE TABLE page_artwork (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    artwork_id UUID NOT NULL REFERENCES artwork(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() AT TIME ZONE 'UTC'
);

CREATE INDEX idx_page_artwork_page_id ON page_artwork(page_id);
CREATE INDEX idx_page_artwork_artwork_id ON page_artwork(artwork_id);
CREATE UNIQUE INDEX idx_page_artwork_unique ON page_artwork(page_id, artwork_id);

-- ============================================================================
-- Table: projects
-- ============================================================================
-- Stores current/future projects that Joe is working on
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'archived')),
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    expected_completion_date DATE,
    image_url TEXT,  -- Project image from Supabase Storage
    is_published BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() AT TIME ZONE 'UTC'
);

CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_is_published ON projects(is_published);
CREATE INDEX idx_projects_display_order ON projects(display_order);

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table: events
-- ============================================================================
-- Stores convention/expo events where Joe will have a booth
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location TEXT NOT NULL,
    venue_name TEXT,
    booth_number TEXT,
    convention_url TEXT,
    image_url TEXT,  -- Event image from Supabase Storage
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() AT TIME ZONE 'UTC'
);

CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_start_date ON events(start_date DESC);
CREATE INDEX idx_events_is_published ON events(is_published);

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table: orders
-- ============================================================================
-- Stores customer orders with payment and shipping information
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    shipping_address_line1 TEXT NOT NULL,
    shipping_address_line2 TEXT,
    shipping_city TEXT NOT NULL,
    shipping_state TEXT NOT NULL,
    shipping_zip TEXT NOT NULL,
    shipping_country TEXT NOT NULL,
    billing_address_line1 TEXT NOT NULL,
    billing_address_line2 TEXT,
    billing_city TEXT NOT NULL,
    billing_state TEXT NOT NULL,
    billing_zip TEXT NOT NULL,
    billing_country TEXT NOT NULL,
    order_notes TEXT,
    subtotal NUMERIC(10, 2) NOT NULL,
    shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_intent_id TEXT,  -- Stripe payment intent ID
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'succeeded', 'failed')),
    shipping_tracking_number TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() AT TIME ZONE 'UTC'
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_payment_intent_id ON orders(payment_intent_id);

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to generate order number before insert
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number = generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- ============================================================================
-- Table: order_items
-- ============================================================================
-- Stores individual items within each order
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    artwork_id UUID NOT NULL REFERENCES artwork(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase NUMERIC(10, 2) NOT NULL,  -- Price at time of order
    line_subtotal NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() AT TIME ZONE 'UTC'
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_artwork_id ON order_items(artwork_id);

-- Trigger to decrement artwork inventory when order is created with paid status
CREATE OR REPLACE FUNCTION decrement_artwork_inventory()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_status = 'succeeded' AND OLD.payment_status IS DISTINCT FROM 'succeeded' THEN
        -- Decrement inventory for all items in this order
        UPDATE artwork
        SET inventory_count = inventory_count - oi.quantity
        FROM order_items oi
        WHERE oi.order_id = NEW.id
          AND artwork.id = oi.artwork_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER decrement_inventory_on_payment
    AFTER UPDATE ON orders
    FOR EACH ROW
    WHEN (OLD.payment_status IS DISTINCT FROM NEW.payment_status)
    EXECUTE FUNCTION decrement_artwork_inventory();

-- ============================================================================
-- Row-Level Security (RLS) Setup
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_artwork ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies: administrators (admin only)
-- ============================================================================
CREATE POLICY "Admins can view all administrators"
    ON administrators FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Only super_admin can manage administrators"
    ON administrators FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND role = 'super_admin' AND is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND role = 'super_admin' AND is_active = true
        )
    );

-- ============================================================================
-- RLS Policies: artwork (public read, admin write)
-- ============================================================================
CREATE POLICY "Anyone can view published artwork"
    ON artwork FOR SELECT
    USING (is_published = true);

CREATE POLICY "Admins can view all artwork"
    ON artwork FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Only admins can create artwork"
    ON artwork FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Only admins can update artwork"
    ON artwork FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Only admins can delete artwork"
    ON artwork FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND is_active = true
        )
    );

-- ============================================================================
-- RLS Policies: pages (public read, admin write)
-- ============================================================================
CREATE POLICY "Anyone can view published pages"
    ON pages FOR SELECT
    USING (is_published = true);

CREATE POLICY "Admins can view all pages"
    ON pages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Only admins can create pages"
    ON pages FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Only admins can update pages"
    ON pages FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Only admins can delete pages"
    ON pages FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND is_active = true
        )
    );

-- ============================================================================
-- RLS Policies: page_artwork (public read, admin write)
-- ============================================================================
CREATE POLICY "Anyone can view published page_artwork"
    ON page_artwork FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM pages
            WHERE pages.id = page_artwork.page_id AND pages.is_published = true
        )
    );

CREATE POLICY "Admins can manage page_artwork"
    ON page_artwork FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND is_active = true
        )
    );

-- ============================================================================
-- RLS Policies: projects (public read, admin write)
-- ============================================================================
CREATE POLICY "Anyone can view published projects"
    ON projects FOR SELECT
    USING (is_published = true);

CREATE POLICY "Admins can view all projects"
    ON projects FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Only admins can manage projects"
    ON projects FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND is_active = true
        )
    );

-- ============================================================================
-- RLS Policies: events (public read, admin write)
-- ============================================================================
CREATE POLICY "Anyone can view published events"
    ON events FOR SELECT
    USING (is_published = true);

CREATE POLICY "Admins can view all events"
    ON events FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Only admins can manage events"
    ON events FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND is_active = true
        )
    );

-- ============================================================================
-- RLS Policies: orders (customer can view own, admin can view all)
-- ============================================================================
CREATE POLICY "Admins can view all orders"
    ON orders FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Only admins can manage orders"
    ON orders FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Only system can create orders"
    ON orders FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- RLS Policies: order_items (follow order permissions)
-- ============================================================================
CREATE POLICY "Admins can view all order_items"
    ON order_items FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM administrators
            WHERE auth_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Only system can create order_items"
    ON order_items FOR INSERT
    WITH CHECK (true);
