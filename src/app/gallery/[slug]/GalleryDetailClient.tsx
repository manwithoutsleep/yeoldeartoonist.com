/**
 * GalleryDetailClient Component
 *
 * Client-side interactive component for Gallery detail page.
 * Wraps the shared ArtworkDetailClient component with Gallery-specific exports.
 *
 * This is a thin wrapper that delegates to the shared ArtworkDetailClient
 * component to avoid code duplication with ShoppeDetailClient.
 */

import { ArtworkDetailClient } from '@/components/ui/ArtworkDetailClient';

// Re-export the shared component with Gallery-specific name for backwards compatibility
export { ArtworkDetailClient as GalleryDetailClient };
