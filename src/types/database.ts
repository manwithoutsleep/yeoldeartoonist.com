/**
 * TypeScript types auto-generated from Supabase schema
 *
 * These types are generated based on the database schema defined in:
 * src/lib/db/migrations/001_initial_schema.sql
 *
 * To regenerate types:
 * npx supabase gen types typescript --project-id=oiqcholpmcuxxozgbwpo > src/types/database.ts
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    public: {
        Tables: {
            administrators: {
                Row: {
                    id: string;
                    auth_id: string;
                    name: string;
                    email: string;
                    role: 'admin' | 'super_admin';
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    auth_id: string;
                    name: string;
                    email: string;
                    role?: 'admin' | 'super_admin';
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    auth_id?: string;
                    name?: string;
                    email?: string;
                    role?: 'admin' | 'super_admin';
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            artwork: {
                Row: {
                    id: string;
                    title: string;
                    description: string | null;
                    slug: string;
                    price: string;
                    original_price: string | null;
                    sku: string | null;
                    inventory_count: number;
                    is_limited_edition: boolean;
                    medium: string | null;
                    dimensions: string | null;
                    year_created: number | null;
                    image_url: string | null;
                    image_thumbnail_url: string | null;
                    image_large_url: string | null;
                    is_published: boolean;
                    is_featured: boolean;
                    display_order: number;
                    alt_text: string | null;
                    seo_title: string | null;
                    seo_description: string | null;
                    tags: string[] | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    description?: string | null;
                    slug: string;
                    price: string;
                    original_price?: string | null;
                    sku?: string | null;
                    inventory_count?: number;
                    is_limited_edition?: boolean;
                    medium?: string | null;
                    dimensions?: string | null;
                    year_created?: number | null;
                    image_url?: string | null;
                    image_thumbnail_url?: string | null;
                    image_large_url?: string | null;
                    is_published?: boolean;
                    is_featured?: boolean;
                    display_order?: number;
                    alt_text?: string | null;
                    seo_title?: string | null;
                    seo_description?: string | null;
                    tags?: string[] | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    description?: string | null;
                    slug?: string;
                    price?: string;
                    original_price?: string | null;
                    sku?: string | null;
                    inventory_count?: number;
                    is_limited_edition?: boolean;
                    medium?: string | null;
                    dimensions?: string | null;
                    year_created?: number | null;
                    image_url?: string | null;
                    image_thumbnail_url?: string | null;
                    image_large_url?: string | null;
                    is_published?: boolean;
                    is_featured?: boolean;
                    display_order?: number;
                    alt_text?: string | null;
                    seo_title?: string | null;
                    seo_description?: string | null;
                    tags?: string[] | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            pages: {
                Row: {
                    id: string;
                    title: string;
                    slug: string;
                    content: string;
                    description: string | null;
                    is_published: boolean;
                    display_order: number;
                    seo_title: string | null;
                    seo_description: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    slug: string;
                    content: string;
                    description?: string | null;
                    is_published?: boolean;
                    display_order?: number;
                    seo_title?: string | null;
                    seo_description?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    slug?: string;
                    content?: string;
                    description?: string | null;
                    is_published?: boolean;
                    display_order?: number;
                    seo_title?: string | null;
                    seo_description?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            page_artwork: {
                Row: {
                    id: string;
                    page_id: string;
                    artwork_id: string;
                    display_order: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    page_id: string;
                    artwork_id: string;
                    display_order?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    page_id?: string;
                    artwork_id?: string;
                    display_order?: number;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'page_artwork_page_id_fkey';
                        columns: ['page_id'];
                        isOneToOne: false;
                        referencedRelation: 'pages';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'page_artwork_artwork_id_fkey';
                        columns: ['artwork_id'];
                        isOneToOne: false;
                        referencedRelation: 'artwork';
                        referencedColumns: ['id'];
                    },
                ];
            };
            projects: {
                Row: {
                    id: string;
                    title: string;
                    slug: string;
                    description: string;
                    status: 'planning' | 'active' | 'completed' | 'archived';
                    progress_percentage: number;
                    expected_completion_date: string | null;
                    image_url: string | null;
                    is_published: boolean;
                    display_order: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    slug: string;
                    description: string;
                    status?: 'planning' | 'active' | 'completed' | 'archived';
                    progress_percentage?: number;
                    expected_completion_date?: string | null;
                    image_url?: string | null;
                    is_published?: boolean;
                    display_order?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    slug?: string;
                    description?: string;
                    status?: 'planning' | 'active' | 'completed' | 'archived';
                    progress_percentage?: number;
                    expected_completion_date?: string | null;
                    image_url?: string | null;
                    is_published?: boolean;
                    display_order?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            events: {
                Row: {
                    id: string;
                    title: string;
                    slug: string;
                    description: string | null;
                    start_date: string;
                    end_date: string;
                    location: string;
                    venue_name: string | null;
                    booth_number: string | null;
                    convention_url: string | null;
                    image_url: string | null;
                    is_published: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    slug: string;
                    description?: string | null;
                    start_date: string;
                    end_date: string;
                    location: string;
                    venue_name?: string | null;
                    booth_number?: string | null;
                    convention_url?: string | null;
                    image_url?: string | null;
                    is_published?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    slug?: string;
                    description?: string | null;
                    start_date?: string;
                    end_date?: string;
                    location?: string;
                    venue_name?: string | null;
                    booth_number?: string | null;
                    convention_url?: string | null;
                    image_url?: string | null;
                    is_published?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            orders: {
                Row: {
                    id: string;
                    order_number: string;
                    customer_name: string;
                    customer_email: string;
                    shipping_address_line1: string;
                    shipping_address_line2: string | null;
                    shipping_city: string;
                    shipping_state: string;
                    shipping_zip: string;
                    shipping_country: string;
                    billing_address_line1: string;
                    billing_address_line2: string | null;
                    billing_city: string;
                    billing_state: string;
                    billing_zip: string;
                    billing_country: string;
                    order_notes: string | null;
                    subtotal: string;
                    shipping_cost: string;
                    tax_amount: string;
                    total: string;
                    status:
                        | 'pending'
                        | 'paid'
                        | 'processing'
                        | 'shipped'
                        | 'delivered'
                        | 'cancelled';
                    payment_intent_id: string | null;
                    payment_status: 'pending' | 'succeeded' | 'failed';
                    shipping_tracking_number: string | null;
                    admin_notes: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    order_number?: string;
                    customer_name: string;
                    customer_email: string;
                    shipping_address_line1: string;
                    shipping_address_line2?: string | null;
                    shipping_city: string;
                    shipping_state: string;
                    shipping_zip: string;
                    shipping_country: string;
                    billing_address_line1: string;
                    billing_address_line2?: string | null;
                    billing_city: string;
                    billing_state: string;
                    billing_zip: string;
                    billing_country: string;
                    order_notes?: string | null;
                    subtotal: string;
                    shipping_cost?: string;
                    tax_amount?: string;
                    total: string;
                    status?:
                        | 'pending'
                        | 'paid'
                        | 'processing'
                        | 'shipped'
                        | 'delivered'
                        | 'cancelled';
                    payment_intent_id?: string | null;
                    payment_status?: 'pending' | 'succeeded' | 'failed';
                    shipping_tracking_number?: string | null;
                    admin_notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    order_number?: string;
                    customer_name?: string;
                    customer_email?: string;
                    shipping_address_line1?: string;
                    shipping_address_line2?: string | null;
                    shipping_city?: string;
                    shipping_state?: string;
                    shipping_zip?: string;
                    shipping_country?: string;
                    billing_address_line1?: string;
                    billing_address_line2?: string | null;
                    billing_city?: string;
                    billing_state?: string;
                    billing_zip?: string;
                    billing_country?: string;
                    order_notes?: string | null;
                    subtotal?: string;
                    shipping_cost?: string;
                    tax_amount?: string;
                    total?: string;
                    status?:
                        | 'pending'
                        | 'paid'
                        | 'processing'
                        | 'shipped'
                        | 'delivered'
                        | 'cancelled';
                    payment_intent_id?: string | null;
                    payment_status?: 'pending' | 'succeeded' | 'failed';
                    shipping_tracking_number?: string | null;
                    admin_notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            order_items: {
                Row: {
                    id: string;
                    order_id: string;
                    artwork_id: string;
                    quantity: number;
                    price_at_purchase: string;
                    line_subtotal: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    order_id: string;
                    artwork_id: string;
                    quantity: number;
                    price_at_purchase: string;
                    line_subtotal: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    order_id?: string;
                    artwork_id?: string;
                    quantity?: number;
                    price_at_purchase?: string;
                    line_subtotal?: string;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'order_items_order_id_fkey';
                        columns: ['order_id'];
                        isOneToOne: false;
                        referencedRelation: 'orders';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'order_items_artwork_id_fkey';
                        columns: ['artwork_id'];
                        isOneToOne: false;
                        referencedRelation: 'artwork';
                        referencedColumns: ['id'];
                    },
                ];
            };
        };
        Views: Record<string, never>;
        Functions: {
            update_updated_at_column: {
                Args: Record<PropertyKey, never>;
                Returns: undefined;
            };
            generate_order_number: {
                Args: Record<PropertyKey, never>;
                Returns: string;
            };
            set_order_number: {
                Args: Record<PropertyKey, never>;
                Returns: undefined;
            };
            decrement_artwork_inventory: {
                Args: Record<PropertyKey, never>;
                Returns: undefined;
            };
        };
        Enums: Record<string, never>;
        CompositeTypes: Record<string, never>;
    };
};
