/**
 * Supabase Mock Factory
 *
 * Provides reusable mock implementations for Supabase client in tests.
 * Use these to mock database queries and responses consistently across tests.
 */

export const createMockSupabaseClient = () => ({
    from: vitest.fn(),
    auth: {
        getUser: vitest.fn(),
        getSession: vitest.fn(),
        signUp: vitest.fn(),
        signInWithPassword: vitest.fn(),
        signOut: vitest.fn(),
    },
    storage: {
        from: vitest.fn(),
    },
});

export const createMockQueryBuilder = <T, E = null>(
    data: T,
    error: E = null as unknown as E,
) => ({
    select: vitest.fn().mockReturnThis(),
    eq: vitest.fn().mockReturnThis(),
    neq: vitest.fn().mockReturnThis(),
    gt: vitest.fn().mockReturnThis(),
    gte: vitest.fn().mockReturnThis(),
    lt: vitest.fn().mockReturnThis(),
    lte: vitest.fn().mockReturnThis(),
    like: vitest.fn().mockReturnThis(),
    ilike: vitest.fn().mockReturnThis(),
    is: vitest.fn().mockReturnThis(),
    in: vitest.fn().mockReturnThis(),
    contains: vitest.fn().mockReturnThis(),
    containedBy: vitest.fn().mockReturnThis(),
    range: vitest.fn().mockReturnThis(),
    textSearch: vitest.fn().mockReturnThis(),
    order: vitest.fn().mockReturnThis(),
    limit: vitest.fn().mockReturnThis(),
    single: vitest.fn().mockReturnThis(),
    maybeOne: vitest.fn().mockReturnThis(),
    count: vitest.fn().mockReturnThis(),
    then: vitest.fn((resolve) => {
        resolve({ data, error });
        return Promise.resolve({ data, error });
    }),
});

/**
 * Mock artwork data for tests
 */
export const mockArtworkData = {
    id: "1",
    title: "Test Artwork",
    slug: "test-artwork",
    description: "A test artwork",
    image_url: "https://example.com/image.jpg",
    image_thumbnail_url: "https://example.com/thumbnail.jpg",
    image_large_url: "https://example.com/large.jpg",
    is_published: true,
    is_featured: false,
    display_order: 1,
    price: 5000,
    original_price: null,
    sku: "ART-001",
    inventory_count: 10,
    is_limited_edition: false,
    medium: "Digital",
    year_created: 2024,
    tags: ["test", "artwork"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
};

/**
 * Mock project data for tests
 */
export const mockProjectData = {
    id: "1",
    title: "Test Project",
    slug: "test-project",
    description: "A test project",
    image_url: "https://example.com/project.jpg",
    status: "active",
    progress_percentage: 50,
    expected_completion_date: "2024-12-31",
    is_published: true,
    display_order: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
};

/**
 * Mock event data for tests
 */
export const mockEventData = {
    id: "1",
    title: "Test Event",
    slug: "test-event",
    description: "A test event",
    image_url: "https://example.com/event.jpg",
    start_date: "2024-12-01T00:00:00Z",
    end_date: "2024-12-02T00:00:00Z",
    location: "Test Location",
    venue_name: "Test Venue",
    booth_number: "123",
    convention_url: "https://example.com/convention",
    is_published: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
};

/**
 * Mock order data for tests
 */
export const mockOrderData = {
    id: "1",
    order_number: "ORD-001",
    user_email: "test@example.com",
    user_name: "Test User",
    shipping_address_line1: "123 Test St",
    shipping_address_line2: "",
    shipping_city: "Test City",
    shipping_state: "TS",
    shipping_zip: "12345",
    shipping_country: "US",
    billing_address_line1: "123 Test St",
    billing_address_line2: "",
    billing_city: "Test City",
    billing_state: "TS",
    billing_zip: "12345",
    billing_country: "US",
    subtotal: 5000,
    shipping_cost: 500,
    tax: 500,
    total: 6000,
    status: "pending",
    payment_intent_id: "pi_test",
    notes: "",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
};
