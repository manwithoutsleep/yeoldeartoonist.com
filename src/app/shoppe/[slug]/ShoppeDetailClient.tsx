/**
 * ShoppeDetailClient Component
 *
 * Client-side interactive component for Shoppe detail page.
 * Wraps the shared ArtworkDetailClient component with Shoppe-specific exports.
 *
 * This is a thin wrapper that delegates to the shared ArtworkDetailClient
 * component to avoid code duplication with GalleryDetailClient.
 */

import { ArtworkDetailClient } from '@/components/ui/ArtworkDetailClient';

// Re-export the shared component with Shoppe-specific name for backwards compatibility
export { ArtworkDetailClient as ShoppeDetailClient };
