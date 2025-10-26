# YeOldeArtoonist.com - MVP Architecture Plan

**Date:** 2025-10-25
**Version:** 1.0

## Table of Contents

1. [Database Schema Architecture](#1-database-schema-architecture)
2. [Code Structure & Organization](#2-code-structure--organization)
3. [Shopping Cart & Checkout Security](#3-shopping-cart--checkout-security)
4. [Authentication & Admin](#4-authentication--admin)
5. [Image Management](#5-image-management)
6. [Performance & Scalability](#6-performance--scalability)
7. [Implementation Roadmap](#7-implementation-roadmap)

---

## 1. Database Schema Architecture

### 1.1 Schema Evaluation & Improvements

#### Current Schema Issues:
1. **Missing primary key constraints and auto-increment**
2. **No foreign key relationships defined**
3. **Missing essential e-commerce fields** (inventory, SKU, dimensions, status)
4. **No order/transaction tracking** (needed even without user accounts)
5. **Missing metadata fields** (publish status, sorting, SEO)
6. **Administrators table links to auth.users but doesn't specify UUID type**

### 1.2 Refined Database Schema

#### Table: `administrators`
```sql
CREATE TABLE administrators (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all administrators"
  ON administrators FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM administrators WHERE is_active = true));

CREATE POLICY "Super admins can manage administrators"
  ON administrators FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM administrators
      WHERE role = 'super_admin' AND is_active = true
    )
  );
```

#### Table: `artwork`
```sql
CREATE TABLE artwork (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE, -- For SEO-friendly URLs

  -- Pricing & Inventory
  price_cents INTEGER CHECK (price_cents >= 0), -- NULL means not for sale
  original_price_cents INTEGER, -- For showing discounts
  sku TEXT UNIQUE,
  inventory_count INTEGER DEFAULT 0 CHECK (inventory_count >= 0),
  is_limited_edition BOOLEAN DEFAULT false,
  edition_number TEXT, -- e.g., "15/100"

  -- Media Information
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT, -- Optimized thumbnail
  medium TEXT, -- e.g., "Oil on Canvas", "Digital Art"
  dimensions TEXT, -- e.g., "24x36 inches"
  year_created INTEGER,

  -- Display & Organization
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,

  -- SEO & Metadata
  alt_text TEXT, -- Accessibility
  seo_title TEXT,
  seo_description TEXT,
  tags TEXT[], -- Array for categorization

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_artwork_published ON artwork(is_published, display_order);
CREATE INDEX idx_artwork_slug ON artwork(slug);
CREATE INDEX idx_artwork_featured ON artwork(is_featured) WHERE is_featured = true;
CREATE INDEX idx_artwork_tags ON artwork USING GIN(tags);
CREATE INDEX idx_artwork_price ON artwork(price_cents) WHERE price_cents IS NOT NULL;

-- RLS Policies
ALTER TABLE artwork ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published artwork"
  ON artwork FOR SELECT
  USING (is_published = true OR auth.uid() IN (SELECT id FROM administrators WHERE is_active = true));

CREATE POLICY "Admins can manage artwork"
  ON artwork FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM administrators WHERE is_active = true));
```

#### Table: `pages`
```sql
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE, -- 'home', 'gallery', 'shoppe', 'in-the-works', 'contact'
  title TEXT NOT NULL,
  description TEXT,
  content TEXT, -- Rich text content for flexible page content
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,

  -- SEO
  seo_title TEXT,
  seo_description TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_published ON pages(is_published);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published pages"
  ON pages FOR SELECT
  USING (is_published = true OR auth.uid() IN (SELECT id FROM administrators WHERE is_active = true));

CREATE POLICY "Admins can manage pages"
  ON pages FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM administrators WHERE is_active = true));
```

#### Table: `page_artwork`
```sql
CREATE TABLE page_artwork (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL REFERENCES artwork(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(page_id, artwork_id)
);

CREATE INDEX idx_page_artwork_page ON page_artwork(page_id, display_order);
CREATE INDEX idx_page_artwork_artwork ON page_artwork(artwork_id);

ALTER TABLE page_artwork ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view page artwork associations"
  ON page_artwork FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage page artwork"
  ON page_artwork FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM administrators WHERE is_active = true));
```

#### Table: `projects`
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  storage_path TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('planning', 'active', 'completed', 'archived')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  expected_completion_date DATE,
  is_published BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_status ON projects(status, display_order);
CREATE INDEX idx_projects_published ON projects(is_published);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published projects"
  ON projects FOR SELECT
  USING (is_published = true OR auth.uid() IN (SELECT id FROM administrators WHERE is_active = true));

CREATE POLICY "Admins can manage projects"
  ON projects FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM administrators WHERE is_active = true));
```

#### Table: `events`
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  location TEXT NOT NULL,
  venue_name TEXT,
  venue_address TEXT,
  booth_number TEXT,
  storage_path TEXT, -- Event image
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  event_url TEXT, -- Link to convention website
  registration_url TEXT, -- Link to attendee registration
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (end_date >= start_date)
);

CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_events_published ON events(is_published) WHERE is_published = true;
CREATE INDEX idx_events_upcoming ON events(start_date) WHERE start_date >= NOW();

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published events"
  ON events FOR SELECT
  USING (is_published = true OR auth.uid() IN (SELECT id FROM administrators WHERE is_active = true));

CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM administrators WHERE is_active = true));
```

#### Table: `orders` (NEW - Essential for checkout)
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE, -- Human-readable: ORD-20251025-ABC123

  -- Customer Information (no account required)
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,

  -- Shipping Address
  shipping_address_line1 TEXT NOT NULL,
  shipping_address_line2 TEXT,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_country TEXT NOT NULL DEFAULT 'US',

  -- Billing (can be same as shipping)
  billing_address_line1 TEXT NOT NULL,
  billing_address_line2 TEXT,
  billing_city TEXT NOT NULL,
  billing_state TEXT NOT NULL,
  billing_postal_code TEXT NOT NULL,
  billing_country TEXT NOT NULL DEFAULT 'US',

  -- Order Totals
  subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
  shipping_cents INTEGER NOT NULL DEFAULT 0 CHECK (shipping_cents >= 0),
  tax_cents INTEGER NOT NULL DEFAULT 0 CHECK (tax_cents >= 0),
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),

  -- Order Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'payment_processing', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
  ),

  -- Payment Information (store minimal info)
  payment_intent_id TEXT, -- Stripe payment intent ID
  payment_method TEXT, -- 'stripe', 'paypal', etc.
  payment_status TEXT DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'authorized', 'captured', 'failed', 'refunded')
  ),

  -- Shipping
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  -- Notes
  customer_notes TEXT,
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- For abandoned cart cleanup

  CHECK (total_cents = subtotal_cents + shipping_cents + tax_cents)
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status, created_at DESC);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_expires ON orders(expires_at) WHERE status = 'pending';

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM administrators WHERE is_active = true));

CREATE POLICY "Admins can manage orders"
  ON orders FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM administrators WHERE is_active = true));
```

#### Table: `order_items` (NEW - Essential for checkout)
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL REFERENCES artwork(id) ON DELETE RESTRICT,

  -- Snapshot of artwork at time of purchase (prices can change)
  title TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),

  -- Order details
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  line_total_cents INTEGER NOT NULL CHECK (line_total_cents >= 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (line_total_cents = price_cents * quantity)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_artwork ON order_items(artwork_id);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM administrators WHERE is_active = true));

CREATE POLICY "Admins can manage order items"
  ON order_items FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM administrators WHERE is_active = true));
```

### 1.3 Database Functions & Triggers

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_artwork_updated_at BEFORE UPDATE ON artwork
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_administrators_updated_at BEFORE UPDATE ON administrators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  date_part TEXT;
  random_part TEXT;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  random_part := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
  new_number := 'ORD-' || date_part || '-' || random_part;
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate order number on insert
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- Inventory management: decrement on order paid
CREATE OR REPLACE FUNCTION decrement_artwork_inventory()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'captured' AND OLD.payment_status != 'captured' THEN
    UPDATE artwork
    SET inventory_count = inventory_count - oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id
      AND oi.artwork_id = artwork.id
      AND artwork.inventory_count >= oi.quantity;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER decrement_inventory_on_payment AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION decrement_artwork_inventory();
```

---

## 2. Code Structure & Organization

### 2.1 Next.js App Directory Structure

```
yeoldeartoonist.com/
├── .env.local                    # Environment variables (gitignored)
├── .env.example                  # Template for environment variables
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json
│
├── public/                       # Static assets
│   ├── fonts/                    # Custom fonts
│   └── icons/                    # Favicons, etc.
│
├── src/
│   ├── app/                      # Next.js 14+ App Router
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   ├── error.tsx             # Error boundary
│   │   ├── loading.tsx           # Loading UI
│   │   ├── not-found.tsx         # 404 page
│   │   │
│   │   ├── gallery/
│   │   │   ├── page.tsx          # Gallery page
│   │   │   ├── loading.tsx
│   │   │   └── [slug]/           # Individual artwork detail
│   │   │       └── page.tsx
│   │   │
│   │   ├── shoppe/
│   │   │   ├── page.tsx          # Shop page
│   │   │   ├── cart/             # Cart page
│   │   │   │   └── page.tsx
│   │   │   └── checkout/         # Checkout flow
│   │   │       ├── page.tsx      # Checkout form
│   │   │       ├── success/
│   │   │       │   └── page.tsx
│   │   │       └── cancelled/
│   │   │           └── page.tsx
│   │   │
│   │   ├── in-the-works/
│   │   │   └── page.tsx          # Projects and events
│   │   │
│   │   ├── contact/
│   │   │   └── page.tsx          # Meet the artist
│   │   │
│   │   ├── admin/                # Admin dashboard
│   │   │   ├── layout.tsx        # Admin layout with auth check
│   │   │   ├── page.tsx          # Admin dashboard
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── artwork/
│   │   │   │   ├── page.tsx      # List artwork
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx      # List orders
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Order detail
│   │   │   ├── projects/
│   │   │   │   └── page.tsx
│   │   │   └── events/
│   │   │       └── page.tsx
│   │   │
│   │   └── api/                  # API routes
│   │       ├── artwork/
│   │       │   └── route.ts      # GET /api/artwork
│   │       ├── cart/
│   │       │   ├── route.ts      # POST /api/cart (server-side session)
│   │       │   └── [id]/
│   │       │       └── route.ts  # DELETE /api/cart/[id]
│   │       ├── checkout/
│   │       │   ├── route.ts      # POST /api/checkout
│   │       │   └── webhook/
│   │       │       └── route.ts  # POST /api/checkout/webhook (Stripe)
│   │       └── admin/
│   │           └── [...]/        # Admin API routes
│   │
│   ├── components/               # React components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── AdminLayout.tsx
│   │   │
│   │   ├── artwork/
│   │   │   ├── ArtworkGrid.tsx
│   │   │   ├── ArtworkCard.tsx
│   │   │   ├── ArtworkDetail.tsx
│   │   │   └── ArtworkImage.tsx  # Optimized image component
│   │   │
│   │   ├── cart/
│   │   │   ├── CartButton.tsx    # Header cart icon
│   │   │   ├── CartDrawer.tsx    # Slide-out cart
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   │
│   │   ├── checkout/
│   │   │   ├── CheckoutForm.tsx
│   │   │   ├── AddressForm.tsx
│   │   │   └── PaymentForm.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── ArtworkForm.tsx
│   │   │   ├── OrdersList.tsx
│   │   │   └── ImageUploader.tsx
│   │   │
│   │   └── ui/                   # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Card.tsx
│   │       ├── Modal.tsx
│   │       └── Spinner.tsx
│   │
│   ├── lib/                      # Utility functions and configs
│   │   ├── supabase/
│   │   │   ├── client.ts         # Browser Supabase client
│   │   │   ├── server.ts         # Server Supabase client
│   │   │   └── middleware.ts     # Auth middleware
│   │   │
│   │   ├── db/                   # Database queries
│   │   │   ├── artwork.ts        # Artwork queries
│   │   │   ├── orders.ts         # Order queries
│   │   │   ├── pages.ts          # Page queries
│   │   │   ├── projects.ts       # Project queries
│   │   │   └── events.ts         # Event queries
│   │   │
│   │   ├── payments/
│   │   │   └── stripe.ts         # Stripe integration
│   │   │
│   │   ├── cart/
│   │   │   ├── session.ts        # Server-side cart session
│   │   │   └── storage.ts        # Cart persistence
│   │   │
│   │   ├── validation/
│   │   │   ├── schemas.ts        # Zod validation schemas
│   │   │   └── sanitize.ts       # Input sanitization
│   │   │
│   │   └── utils/
│   │       ├── format.ts         # Price formatting, etc.
│   │       ├── date.ts           # Date utilities
│   │       └── image.ts          # Image URL helpers
│   │
│   ├── types/                    # TypeScript type definitions
│   │   ├── database.ts           # Generated Supabase types
│   │   ├── cart.ts               # Cart types
│   │   ├── order.ts              # Order types
│   │   └── index.ts              # Shared types
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useCart.ts            # Cart state management
│   │   ├── useCheckout.ts        # Checkout flow
│   │   └── useAdmin.ts           # Admin auth check
│   │
│   ├── context/                  # React Context providers
│   │   └── CartContext.tsx       # Global cart state
│   │
│   └── styles/
│       └── globals.css           # Global styles
│
├── scripts/                      # Database and utility scripts
│   ├── seed.ts                   # Seed database with sample data
│   └── generate-types.ts         # Generate TypeScript types from DB
│
└── tests/                        # Test files
    ├── e2e/                      # End-to-end tests
    └── unit/                     # Unit tests
```

### 2.2 Key Configuration Files

#### `.env.example`
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# App Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Ye Olde Artoonist

# Email (for order confirmations)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=orders@yeoldeartoonist.com

# Cart Session Secret
CART_SESSION_SECRET=generate-a-random-32-char-string

# Admin
ADMIN_EMAIL=admin@yeoldeartoonist.com
```

#### `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Enable React strict mode
  reactStrictMode: true,

  // Optimize for production
  swcMinify: true,

  // Experimental features
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },
};

module.exports = nextConfig;
```

---

## 3. Shopping Cart & Checkout Security

### 3.1 Cart Data Storage Strategy

**Hybrid Approach (Recommended for MVP):**

1. **Client-Side (localStorage) for browsing**
   - Store cart items in browser localStorage for persistence
   - Encrypt cart data using Web Crypto API
   - No PII (Personally Identifiable Information) stored

2. **Server-Side Session for checkout**
   - When user proceeds to checkout, transfer cart to server session
   - Use encrypted cookies with iron-session
   - Session expires after 30 minutes of inactivity

### 3.2 Implementation

#### `src/types/cart.ts`
```typescript
export interface CartItem {
  artworkId: string;
  title: string;
  priceCents: number;
  quantity: number;
  thumbnailPath: string;
  inventoryCount: number;
}

export interface Cart {
  items: CartItem[];
  subtotalCents: number;
  lastUpdated: string;
}

export interface CheckoutSession {
  cartId: string;
  items: CartItem[];
  subtotalCents: number;
  expiresAt: string;
}
```

#### `src/lib/cart/storage.ts`
```typescript
import { Cart, CartItem } from '@/types/cart';

const CART_KEY = 'yeolde_cart';
const CART_VERSION = '1.0';

export const cartStorage = {
  // Get cart from localStorage
  getCart(): Cart {
    if (typeof window === 'undefined') return { items: [], subtotalCents: 0, lastUpdated: new Date().toISOString() };

    try {
      const stored = localStorage.getItem(CART_KEY);
      if (!stored) return { items: [], subtotalCents: 0, lastUpdated: new Date().toISOString() };

      const cart = JSON.parse(stored) as Cart;
      // Validate cart structure
      return this.validateCart(cart);
    } catch (error) {
      console.error('Error reading cart:', error);
      return { items: [], subtotalCents: 0, lastUpdated: new Date().toISOString() };
    }
  },

  // Save cart to localStorage
  setCart(cart: Cart): void {
    if (typeof window === 'undefined') return;

    try {
      const validated = this.validateCart(cart);
      localStorage.setItem(CART_KEY, JSON.stringify(validated));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  },

  // Add item to cart
  addItem(item: CartItem): Cart {
    const cart = this.getCart();
    const existingIndex = cart.items.findIndex(i => i.artworkId === item.artworkId);

    if (existingIndex >= 0) {
      // Update quantity
      cart.items[existingIndex].quantity += item.quantity;
    } else {
      cart.items.push(item);
    }

    cart.subtotalCents = this.calculateSubtotal(cart.items);
    cart.lastUpdated = new Date().toISOString();

    this.setCart(cart);
    return cart;
  },

  // Remove item from cart
  removeItem(artworkId: string): Cart {
    const cart = this.getCart();
    cart.items = cart.items.filter(item => item.artworkId !== artworkId);
    cart.subtotalCents = this.calculateSubtotal(cart.items);
    cart.lastUpdated = new Date().toISOString();

    this.setCart(cart);
    return cart;
  },

  // Update item quantity
  updateQuantity(artworkId: string, quantity: number): Cart {
    const cart = this.getCart();
    const item = cart.items.find(i => i.artworkId === artworkId);

    if (item) {
      if (quantity <= 0) {
        return this.removeItem(artworkId);
      }

      // Check inventory
      if (quantity > item.inventoryCount) {
        throw new Error(`Only ${item.inventoryCount} available`);
      }

      item.quantity = quantity;
      cart.subtotalCents = this.calculateSubtotal(cart.items);
      cart.lastUpdated = new Date().toISOString();

      this.setCart(cart);
    }

    return cart;
  },

  // Clear cart
  clearCart(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CART_KEY);
  },

  // Validate cart structure
  validateCart(cart: any): Cart {
    if (!cart || typeof cart !== 'object') {
      return { items: [], subtotalCents: 0, lastUpdated: new Date().toISOString() };
    }

    const items = Array.isArray(cart.items) ? cart.items.filter(item =>
      item.artworkId &&
      typeof item.priceCents === 'number' &&
      typeof item.quantity === 'number' &&
      item.quantity > 0
    ) : [];

    return {
      items,
      subtotalCents: this.calculateSubtotal(items),
      lastUpdated: cart.lastUpdated || new Date().toISOString()
    };
  },

  // Calculate subtotal
  calculateSubtotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0);
  }
};
```

#### `src/hooks/useCart.ts`
```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Cart, CartItem } from '@/types/cart';
import { cartStorage } from '@/lib/cart/storage';

export function useCart() {
  const [cart, setCart] = useState<Cart>({ items: [], subtotalCents: 0, lastUpdated: new Date().toISOString() });
  const [isLoading, setIsLoading] = useState(true);

  // Load cart on mount
  useEffect(() => {
    setCart(cartStorage.getCart());
    setIsLoading(false);
  }, []);

  const addToCart = useCallback(async (item: CartItem) => {
    setIsLoading(true);
    try {
      const updatedCart = cartStorage.addItem(item);
      setCart(updatedCart);
      return updatedCart;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeFromCart = useCallback(async (artworkId: string) => {
    setIsLoading(true);
    try {
      const updatedCart = cartStorage.removeItem(artworkId);
      setCart(updatedCart);
      return updatedCart;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateQuantity = useCallback(async (artworkId: string, quantity: number) => {
    setIsLoading(true);
    try {
      const updatedCart = cartStorage.updateQuantity(artworkId, quantity);
      setCart(updatedCart);
      return updatedCart;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    setIsLoading(true);
    try {
      cartStorage.clearCart();
      setCart({ items: [], subtotalCents: 0, lastUpdated: new Date().toISOString() });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cart,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    itemCount
  };
}
```

### 3.3 Payment Processing with Stripe

#### `src/lib/payments/stripe.ts`
```typescript
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

export async function createPaymentIntent(
  amountCents: number,
  orderId: string,
  customerEmail: string
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: {
      orderId,
      customerEmail,
    },
    receipt_email: customerEmail,
  });
}

export async function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
```

#### `src/app/api/checkout/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createPaymentIntent } from '@/lib/payments/stripe';
import { createOrder } from '@/lib/db/orders';
import { validateCart } from '@/lib/cart/validation';

const checkoutSchema = z.object({
  customerEmail: z.string().email(),
  customerName: z.string().min(1),
  shippingAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(2),
    postalCode: z.string().min(5),
    country: z.string().default('US'),
  }),
  billingAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(2),
    postalCode: z.string().min(5),
    country: z.string().default('US'),
  }),
  cartItems: z.array(z.object({
    artworkId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = checkoutSchema.parse(body);

    // Validate cart items and calculate totals
    const { items, subtotalCents, shippingCents, taxCents, totalCents } =
      await validateCart(validatedData.cartItems);

    // Create order in database
    const order = await createOrder({
      customerEmail: validatedData.customerEmail,
      customerName: validatedData.customerName,
      shippingAddress: validatedData.shippingAddress,
      billingAddress: validatedData.billingAddress,
      items,
      subtotalCents,
      shippingCents,
      taxCents,
      totalCents,
    });

    // Create Stripe payment intent
    const paymentIntent = await createPaymentIntent(
      totalCents,
      order.id,
      validatedData.customerEmail
    );

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    console.error('Checkout error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid checkout data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Checkout failed' },
      { status: 500 }
    );
  }
}
```

### 3.4 Security Best Practices

1. **Input Validation**
   - Use Zod for runtime type validation
   - Sanitize all user inputs
   - Validate cart items against database before checkout

2. **CSRF Protection**
   - Next.js API routes use SameSite cookies by default
   - Add CSRF tokens for sensitive operations

3. **Rate Limiting**
   - Implement rate limiting on checkout endpoint
   - Use Upstash or Vercel KV for distributed rate limiting

4. **PCI Compliance**
   - Never store credit card numbers
   - Use Stripe Elements for payment collection
   - All payment data handled by Stripe

5. **Data Encryption**
   - Use HTTPS everywhere (enforced by Vercel)
   - Encrypt sensitive data at rest in database
   - Use environment variables for secrets

---

## 4. Authentication & Admin

### 4.1 Supabase Auth Configuration

**Strategy:** Use Supabase Auth with email/password for admin users only.

#### `src/lib/supabase/server.ts`
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Server component - can't set cookies
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Server component - can't remove cookies
          }
        },
      },
    }
  );
}
```

#### `src/lib/supabase/client.ts`
```typescript
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 4.2 Admin Authentication Middleware

#### `src/middleware.ts`
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Check if accessing admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const { data: { user } } = await supabase.auth.getUser();

    // Allow login page
    if (request.nextUrl.pathname === '/admin/login') {
      if (user) {
        // Already logged in, redirect to dashboard
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return response;
    }

    // Protect all other admin routes
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Check if user is an admin
    const { data: admin } = await supabase
      .from('administrators')
      .select('is_active')
      .eq('id', user.id)
      .single();

    if (!admin || !admin.is_active) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

### 4.3 Role-Based Access Control (RBAC)

#### `src/lib/auth/permissions.ts`
```typescript
export enum AdminRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum Permission {
  VIEW_ARTWORK = 'view:artwork',
  MANAGE_ARTWORK = 'manage:artwork',
  VIEW_ORDERS = 'view:orders',
  MANAGE_ORDERS = 'manage:orders',
  VIEW_ADMINS = 'view:admins',
  MANAGE_ADMINS = 'manage:admins',
  MANAGE_SETTINGS = 'manage:settings',
}

const rolePermissions: Record<AdminRole, Permission[]> = {
  [AdminRole.ADMIN]: [
    Permission.VIEW_ARTWORK,
    Permission.MANAGE_ARTWORK,
    Permission.VIEW_ORDERS,
    Permission.MANAGE_ORDERS,
  ],
  [AdminRole.SUPER_ADMIN]: [
    Permission.VIEW_ARTWORK,
    Permission.MANAGE_ARTWORK,
    Permission.VIEW_ORDERS,
    Permission.MANAGE_ORDERS,
    Permission.VIEW_ADMINS,
    Permission.MANAGE_ADMINS,
    Permission.MANAGE_SETTINGS,
  ],
};

export function hasPermission(role: AdminRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export async function checkAdminPermission(
  userId: string,
  permission: Permission
): Promise<boolean> {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const { data: admin } = await supabase
    .from('administrators')
    .select('role, is_active')
    .eq('id', userId)
    .single();

  if (!admin || !admin.is_active) {
    return false;
  }

  return hasPermission(admin.role as AdminRole, permission);
}
```

### 4.4 Admin Dashboard Structure

#### `src/app/admin/layout.tsx`
```typescript
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: admin } = await supabase
    .from('administrators')
    .select('name, role, is_active')
    .eq('id', user.id)
    .single();

  if (!admin || !admin.is_active) {
    redirect('/admin/login');
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar admin={admin} />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
```

---

## 5. Image Management

### 5.1 Supabase Storage Organization

**Bucket Structure:**
```
artwork/
├── originals/           # Original high-res images
│   └── {artwork-id}.{ext}
├── thumbnails/          # Small thumbnails (300x300)
│   └── {artwork-id}.webp
├── previews/            # Medium size (800x800)
│   └── {artwork-id}.webp
└── large/               # Large size (1600x1600)
    └── {artwork-id}.webp

events/
└── {event-id}.{ext}

projects/
└── {project-id}.{ext}

admin/
└── {admin-id}.{ext}

site/                    # Site assets
├── header.{ext}
├── footer-logo.{ext}
└── nav-buttons/
    ├── gallery.{ext}
    ├── shoppe.{ext}
    ├── in-the-works.{ext}
    └── contact.{ext}
```

### 5.2 Storage Policies

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('artwork', 'artwork', true),
  ('events', 'events', true),
  ('projects', 'projects', true),
  ('admin', 'admin', false),
  ('site', 'site', true);

-- Artwork bucket policies
CREATE POLICY "Public can view artwork"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'artwork');

CREATE POLICY "Admins can upload artwork"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'artwork' AND
    auth.uid() IN (SELECT id FROM administrators WHERE is_active = true)
  );

CREATE POLICY "Admins can update artwork"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'artwork' AND
    auth.uid() IN (SELECT id FROM administrators WHERE is_active = true)
  );

CREATE POLICY "Admins can delete artwork"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'artwork' AND
    auth.uid() IN (SELECT id FROM administrators WHERE is_active = true)
  );

-- Similar policies for events, projects, site buckets
-- Admin bucket should only be accessible to authenticated admins
```

### 5.3 Image Optimization Strategy

#### `src/lib/utils/image.ts`
```typescript
import sharp from 'sharp';

export interface ImageSize {
  width: number;
  height: number;
  quality: number;
}

export const IMAGE_SIZES = {
  thumbnail: { width: 300, height: 300, quality: 80 },
  preview: { width: 800, height: 800, quality: 85 },
  large: { width: 1600, height: 1600, quality: 90 },
} as const;

export async function optimizeImage(
  buffer: Buffer,
  size: ImageSize
): Promise<Buffer> {
  return await sharp(buffer)
    .resize(size.width, size.height, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: size.quality })
    .toBuffer();
}

export async function generateImageVariants(
  originalBuffer: Buffer,
  artworkId: string
): Promise<{
  thumbnail: Buffer;
  preview: Buffer;
  large: Buffer;
}> {
  const [thumbnail, preview, large] = await Promise.all([
    optimizeImage(originalBuffer, IMAGE_SIZES.thumbnail),
    optimizeImage(originalBuffer, IMAGE_SIZES.preview),
    optimizeImage(originalBuffer, IMAGE_SIZES.large),
  ]);

  return { thumbnail, preview, large };
}

export function getImageUrl(bucket: string, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export function getArtworkImageUrls(artworkId: string) {
  return {
    thumbnail: getImageUrl('artwork', `thumbnails/${artworkId}.webp`),
    preview: getImageUrl('artwork', `previews/${artworkId}.webp`),
    large: getImageUrl('artwork', `large/${artworkId}.webp`),
    original: getImageUrl('artwork', `originals/${artworkId}`), // Keep original extension
  };
}
```

#### `src/components/artwork/ArtworkImage.tsx`
```typescript
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { getArtworkImageUrls } from '@/lib/utils/image';

interface ArtworkImageProps {
  artworkId: string;
  title: string;
  altText?: string;
  size?: 'thumbnail' | 'preview' | 'large';
  className?: string;
  priority?: boolean;
}

export default function ArtworkImage({
  artworkId,
  title,
  altText,
  size = 'preview',
  className = '',
  priority = false,
}: ArtworkImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const urls = getArtworkImageUrls(artworkId);

  const sizeMap = {
    thumbnail: { width: 300, height: 300 },
    preview: { width: 800, height: 800 },
    large: { width: 1600, height: 1600 },
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={urls[size]}
        alt={altText || title}
        width={sizeMap[size].width}
        height={sizeMap[size].height}
        className={`
          duration-700 ease-in-out
          ${isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'}
        `}
        onLoadingComplete={() => setIsLoading(false)}
        priority={priority}
        sizes={`
          (max-width: 640px) 100vw,
          (max-width: 1024px) 50vw,
          ${sizeMap[size].width}px
        `}
      />

      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}
```

### 5.4 Upload Flow

#### `src/app/api/admin/upload/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateImageVariants } from '@/lib/utils/image';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Check admin auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const artworkId = formData.get('artworkId') as string;

    if (!file || !artworkId) {
      return NextResponse.json(
        { error: 'Missing file or artworkId' },
        { status: 400 }
      );
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate optimized variants
    const variants = await generateImageVariants(buffer, artworkId);

    // Upload original
    const originalExt = file.name.split('.').pop();
    const { error: originalError } = await supabase.storage
      .from('artwork')
      .upload(`originals/${artworkId}.${originalExt}`, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (originalError) throw originalError;

    // Upload variants
    await Promise.all([
      supabase.storage
        .from('artwork')
        .upload(`thumbnails/${artworkId}.webp`, variants.thumbnail, {
          contentType: 'image/webp',
          upsert: true,
        }),
      supabase.storage
        .from('artwork')
        .upload(`previews/${artworkId}.webp`, variants.preview, {
          contentType: 'image/webp',
          upsert: true,
        }),
      supabase.storage
        .from('artwork')
        .upload(`large/${artworkId}.webp`, variants.large, {
          contentType: 'image/webp',
          upsert: true,
        }),
    ]);

    return NextResponse.json({
      success: true,
      paths: {
        original: `originals/${artworkId}.${originalExt}`,
        thumbnail: `thumbnails/${artworkId}.webp`,
        preview: `previews/${artworkId}.webp`,
        large: `large/${artworkId}.webp`,
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

---

## 6. Performance & Scalability

### 6.1 ISR (Incremental Static Regeneration) Strategy

```typescript
// src/app/gallery/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default async function GalleryPage() {
  const supabase = await createClient();

  const { data: artwork } = await supabase
    .from('artwork')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  return <ArtworkGrid artwork={artwork} />;
}

// src/app/gallery/[slug]/page.tsx
export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  const supabase = await createClient();

  const { data: artwork } = await supabase
    .from('artwork')
    .select('slug')
    .eq('is_published', true);

  return artwork?.map((item) => ({
    slug: item.slug,
  })) ?? [];
}
```

### 6.2 Caching Strategy

**Multi-Layer Caching:**

1. **CDN Caching (Vercel Edge)**
   - Static assets: 1 year
   - Images: 1 week
   - API responses: 5 minutes

2. **Next.js Data Cache**
   - Use `unstable_cache` for expensive queries
   - Revalidate on-demand via admin actions

3. **Supabase Query Caching**
   - Use PostgREST query caching headers
   - Cache frequently accessed data

#### `src/lib/cache/index.ts`
```typescript
import { unstable_cache } from 'next/cache';

export function getCachedArtwork() {
  return unstable_cache(
    async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();

      const { data } = await supabase
        .from('artwork')
        .select('*')
        .eq('is_published', true)
        .order('display_order');

      return data;
    },
    ['artwork-published'],
    {
      revalidate: 3600,
      tags: ['artwork'],
    }
  );
}

export function getCachedUpcomingEvents() {
  return unstable_cache(
    async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();

      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .gte('end_date', new Date().toISOString())
        .order('start_date');

      return data;
    },
    ['events-upcoming'],
    {
      revalidate: 1800, // 30 minutes
      tags: ['events'],
    }
  );
}
```

#### On-Demand Revalidation
```typescript
// src/app/api/admin/revalidate/route.ts
import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Check admin auth
  const { tag, path } = await request.json();

  if (tag) {
    revalidateTag(tag);
  }

  if (path) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true });
}
```

### 6.3 Database Query Optimization

#### Efficient Query Patterns
```typescript
// src/lib/db/artwork.ts
import { createClient } from '@/lib/supabase/server';

export async function getPublishedArtwork(options?: {
  limit?: number;
  offset?: number;
  featured?: boolean;
}) {
  const supabase = await createClient();

  let query = supabase
    .from('artwork')
    .select('id, title, slug, description, price_cents, thumbnail_path, is_featured, tags', { count: 'exact' })
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (options?.featured) {
    query = query.eq('is_featured', true);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  return await query;
}

export async function getArtworkBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('artwork')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) throw error;
  return data;
}

// Batch fetch artwork by IDs (for cart validation)
export async function getArtworkByIds(ids: string[]) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('artwork')
    .select('id, title, price_cents, inventory_count, thumbnail_path')
    .in('id', ids)
    .eq('is_published', true);

  if (error) throw error;
  return data;
}
```

### 6.4 Performance Monitoring

#### `src/lib/monitoring/performance.ts`
```typescript
export function measurePerformance(label: string) {
  const start = performance.now();

  return {
    end: () => {
      const duration = performance.now() - start;
      console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);

      // Send to analytics (e.g., Vercel Analytics, Sentry)
      if (typeof window !== 'undefined' && window.analytics) {
        window.analytics.track('Performance', {
          label,
          duration,
        });
      }
    },
  };
}

// Usage in components
export function usePerformanceTracker(label: string) {
  useEffect(() => {
    const tracker = measurePerformance(label);
    return () => tracker.end();
  }, [label]);
}
```

### 6.5 Scalability Considerations

**Current MVP Architecture Scales To:**
- 1,000+ artwork pieces
- 100+ orders/day
- 10,000+ monthly visitors

**When to Scale:**

1. **Database (>10k orders/month)**
   - Add read replicas for analytics
   - Implement connection pooling (PgBouncer)
   - Consider separating read/write operations

2. **Storage (>100GB images)**
   - Migrate to CloudFlare R2 or AWS S3
   - Implement CDN (Cloudflare Images)
   - Add image proxy service

3. **Search (>5k artwork)**
   - Add Algolia or Meilisearch for search
   - Implement faceted filtering
   - Add full-text search indexes

4. **Orders (>1k orders/day)**
   - Implement order queue system (BullMQ)
   - Add background jobs for emails
   - Consider order processing microservice

---

## 7. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Goal:** Basic project setup and database

- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Set up Supabase project
- [ ] Create database schema (all tables)
- [ ] Configure RLS policies
- [ ] Generate TypeScript types from database
- [ ] Set up environment variables
- [ ] Create basic folder structure

**Deliverables:**
- Working Next.js app
- Database with all tables
- Type-safe database queries

### Phase 2: Public Pages (Week 2-3)

**Goal:** Build all public-facing pages

- [ ] Create layout with header/nav/footer
- [ ] Build Home page
- [ ] Build Gallery page
- [ ] Build Shoppe page (without cart)
- [ ] Build In The Works page
- [ ] Build Contact page
- [ ] Implement responsive design
- [ ] Add image optimization

**Deliverables:**
- All public pages functional
- Responsive design working
- Images loading optimally

### Phase 3: Shopping Cart (Week 3-4)

**Goal:** Implement cart and checkout

- [ ] Create cart state management
- [ ] Build cart UI components
- [ ] Implement localStorage persistence
- [ ] Add to cart functionality
- [ ] Build cart page
- [ ] Create checkout form
- [ ] Integrate Stripe
- [ ] Test payment flow

**Deliverables:**
- Working shopping cart
- Secure checkout process
- Payment integration complete

### Phase 4: Admin System (Week 4-5)

**Goal:** Build admin dashboard

- [ ] Set up Supabase Auth
- [ ] Create admin authentication
- [ ] Build admin layout
- [ ] Create artwork management
- [ ] Implement image upload
- [ ] Build order management
- [ ] Add projects/events management
- [ ] Implement RBAC

**Deliverables:**
- Full admin dashboard
- Content management working
- Role-based access control

### Phase 5: Polish & Launch (Week 5-6)

**Goal:** Optimize and deploy

- [ ] Implement ISR strategy
- [ ] Add caching layers
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Accessibility audit
- [ ] Security audit
- [ ] Write documentation
- [ ] Deploy to production

**Deliverables:**
- Production-ready application
- Performance optimized
- Security hardened
- Documentation complete

### Post-Launch Enhancements

**Phase 6: Analytics & Monitoring**
- Add Vercel Analytics
- Implement error tracking (Sentry)
- Set up order notifications
- Create admin analytics dashboard

**Phase 7: Advanced Features**
- Email marketing integration
- Print-on-demand integration
- Customer accounts (optional)
- Wishlist functionality
- Advanced search/filtering

---

## Appendix A: Environment Variables

```bash
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Ye Olde Artoonist

SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-api-key
SMTP_FROM=orders@yeoldeartoonist.com

CART_SESSION_SECRET=your-32-char-secret
```

---

## Appendix B: Key NPM Packages

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.5.0",
    "stripe": "^16.12.0",
    "@stripe/stripe-js": "^4.7.0",
    "@stripe/react-stripe-js": "^2.8.0",
    "zod": "^3.23.0",
    "sharp": "^0.33.0",
    "nodemailer": "^6.9.0",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/react": "^18.3.0",
    "@types/node": "^20.16.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "supabase": "^1.200.0",
    "eslint": "^8.57.0",
    "prettier": "^3.3.0"
  }
}
```

---

## Summary

This architecture provides a **solid, scalable foundation** for building yeoldeartoonist.com. Key strengths:

1. **Security First:** RLS policies, proper authentication, PCI-compliant payments
2. **Performance:** ISR, multi-layer caching, optimized images
3. **Maintainability:** Clean separation of concerns, type-safe code
4. **Scalability:** Database indexes, efficient queries, prepared for growth
5. **Developer Experience:** Clear folder structure, reusable utilities, comprehensive types

The MVP can be built in **5-6 weeks** by a single developer and will handle the artist's needs for years to come. The architecture supports future enhancements without requiring major refactoring.

**Next Step:** Review this plan, ask questions, then proceed with Phase 1 implementation.
