# 2025-11-06T11-08-00-mvp-phase-3-admin-03: Image Upload System

## Parent Specification

This is sub-task 03 of the parent specification: `2025-11-06T11-08-00-mvp-phase-3-admin.md`

## Objective

Build a complete image upload system with Sharp-based optimization, WebP conversion, multiple size variants (thumbnail, preview, large), and Supabase Storage integration.

## Dependencies

**Prerequisites** (must be completed before this task):

- Task 01: Dashboard & Navigation Infrastructure (provides admin layout)
- Task 02: Artwork Management CRUD (provides ArtworkForm to integrate ImageUploader)

**Blocks** (tasks that depend on this one):

- None - other tasks can proceed independently

**Parallel Opportunities**:

- Task 04: Order Management (can run in parallel - independent feature)
- Task 05: Projects & Events Management (can run in parallel - independent feature)

## Scope

### In Scope

**Image Optimization Utilities** (`src/lib/utils/image.ts`):

- `generateImageVariants(buffer, filename)` - Generates 3 WebP variants from uploaded image
- Thumbnail variant: 300px wide
- Preview variant: 800px wide
- Large variant: 1600px wide
- Maintains aspect ratio for all variants
- Converts all variants to WebP format using Sharp

**Upload API Route** (`src/app/api/admin/upload/route.ts`):

- POST endpoint accepting multipart/form-data with image file
- Validates file type (only image/jpeg, image/png, image/webp)
- Validates file size (max 10MB)
- Generates 3 variants using `generateImageVariants()`
- Uploads all variants to Supabase Storage `artwork` bucket
- Returns URLs for all 3 variants
- Requires authentication (checks `admin_session` cookie)
- Returns proper HTTP status codes (400, 413, 500, 200)

**ImageUploader Component** (`src/components/admin/ImageUploader.tsx`):

- Client component with file input and drag-and-drop support
- Props: `onUploadComplete`, `existingImageUrl?`, `maxSizeMB?`
- File input with `accept="image/jpeg,image/png,image/webp"`
- Image preview using `URL.createObjectURL()`
- Upload button calls `/api/admin/upload` endpoint
- Progress tracking during upload (0-100%)
- Error handling with user-friendly messages
- Clear/reset button to remove selected file
- Displays existing image in edit mode

**Integration with ArtworkForm**:

- Replace placeholder image input with ImageUploader component
- Store uploaded URLs (thumbnail, preview, large) in form state
- Pass URLs to `onSubmit` handler
- Show existing image in edit mode
- Allow replacing/changing image

**Testing**:

- Unit tests for image optimization utilities (100% coverage)
- API route tests with mocked Supabase Storage (90%+ coverage)
- Component tests for ImageUploader (80-85% coverage)
- Integration tests for ImageUploader in ArtworkForm

### Out of Scope

- Multiple image uploads (single image only for MVP)
- Image cropping/editing tools (future enhancement)
- Image compression settings (use Sharp defaults)
- CDN integration (Supabase Storage URLs are sufficient)
- Image deletion from storage (orphaned images cleanup is future enhancement)
- Video uploads (images only)

## Implementation Requirements

### TDD Workflow

Follow strict Red/Green/Refactor pattern:

1. **Red**: Write failing tests first
2. **Green**: Implement minimal code to pass tests
3. **Refactor**: Improve code quality while keeping tests green

### Code Verification Procedure

Run after each TDD Green/Refactor step:

1. `npx tsc --noEmit` - TypeScript check
2. `npx eslint --fix {modified-files}` - Lint with auto-fix
3. `npx prettier --write {modified-files}` - Format code
4. `npx vitest related run {modified-files}` - Run related tests

### Image Variant Specifications

**Thumbnail (300px)**:

- Width: 300px
- Height: Auto (maintain aspect ratio)
- Format: WebP
- Quality: 80 (Sharp default)
- Use case: Grid views, thumbnails in lists

**Preview (800px)**:

- Width: 800px
- Height: Auto (maintain aspect ratio)
- Format: WebP
- Quality: 80 (Sharp default)
- Use case: Detail pages, primary display image

**Large (1600px)**:

- Width: 1600px
- Height: Auto (maintain aspect ratio)
- Format: WebP
- Quality: 80 (Sharp default)
- Use case: Full-size viewing, high-resolution display

### File Naming Convention

Original filename: `artwork-painting.jpg`

Generated variants:

- `{timestamp}-artwork-painting-thumb.webp`
- `{timestamp}-artwork-painting-preview.webp`
- `{timestamp}-artwork-painting-large.webp`

Timestamp format: `Date.now()` for uniqueness

### Storage Structure

Supabase Storage bucket: `artwork`

All variants stored in root of bucket:

```
artwork/
├── 1699123456789-artwork-1-thumb.webp
├── 1699123456789-artwork-1-preview.webp
├── 1699123456789-artwork-1-large.webp
├── 1699123457890-artwork-2-thumb.webp
├── ...
```

Public access enabled for all files (bucket is public).

### API Response Format

Success response (200):

```json
{
    "image_thumbnail_url": "https://[project].supabase.co/storage/v1/object/public/artwork/123-file-thumb.webp",
    "image_url": "https://[project].supabase.co/storage/v1/object/public/artwork/123-file-preview.webp",
    "image_large_url": "https://[project].supabase.co/storage/v1/object/public/artwork/123-file-large.webp"
}
```

Error responses:

- 400: Invalid file type
- 401: Unauthorized (no session)
- 413: File too large
- 500: Processing or upload error

### Authentication in API Route

```typescript
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');

    if (!sessionCookie) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const session = JSON.parse(sessionCookie.value);

        if (
            !session.userId ||
            !session.expiresAt ||
            session.expiresAt < Date.now()
        ) {
            return NextResponse.json(
                { error: 'Session expired' },
                { status: 401 }
            );
        }

        // Proceed with upload logic
    } catch (error) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
}
```

## Files to Create/Modify

**Create**:

- `src/lib/utils/image.ts` - Image optimization utilities
- `src/app/api/admin/upload/route.ts` - Upload API endpoint
- `src/components/admin/ImageUploader.tsx` - Image uploader component
- `__tests__/lib/utils/image.test.ts` - Image utility tests
- `__tests__/app/api/admin/upload/route.test.ts` - Upload API tests
- `__tests__/components/admin/ImageUploader.test.tsx` - ImageUploader component tests

**Modify**:

- `src/components/admin/ArtworkForm.tsx` - Integrate ImageUploader component
- `__tests__/components/admin/ArtworkForm.test.tsx` - Update tests for image upload

**Dependencies to Install**:

- `sharp` - Image processing library (if not already installed)

## Testing Requirements

### Coverage Targets

- Image optimization utilities: 100% coverage
- Upload API route: 90%+ coverage
- ImageUploader component: 80-85% coverage
- ArtworkForm integration: Existing coverage maintained

### Test Scenarios

**Image Optimization Utilities**:

- `generateImageVariants()` creates 3 size variants
- Thumbnail is 300px wide
- Preview is 800px wide
- Large is 1600px wide
- All variants converted to WebP format
- Aspect ratio maintained for all variants
- Handles corrupt/invalid image files gracefully
- Returns `{ data, error }` format
- Error on invalid buffer

**Upload API Route**:

- Accepts multipart/form-data with image file
- Returns 401 if no session cookie
- Returns 401 if session expired
- Returns 400 for non-image file types
- Returns 413 for files >10MB
- Generates 3 variants successfully
- Uploads all variants to Supabase Storage
- Returns URLs for all 3 variants (200 status)
- Returns 500 on storage upload failure
- Validates authentication before processing

**ImageUploader Component**:

- Renders file input with correct accept attribute
- Shows "Choose File" button
- Displays selected filename after selection
- Shows image preview after file selection
- Upload button disabled until file selected
- Upload button calls `/api/admin/upload`
- Shows upload progress (0-100%)
- Calls `onUploadComplete` with URLs on success
- Shows error message on upload failure
- Clear button removes selected file and preview
- Displays existing image when `existingImageUrl` provided
- Drag-and-drop file selection works (optional)
- Validates file size before upload
- Validates file type before upload

**ArtworkForm Integration**:

- ImageUploader component appears in form
- Uploaded URLs stored in form state
- URLs passed to `onSubmit` handler
- Existing image shown in edit mode
- Form submission includes image URLs
- Form validation handles missing images (if required)

### Manual Testing Checklist

- [ ] Navigate to `/admin/artwork/new`
- [ ] Click "Choose File" in ImageUploader
- [ ] Select valid image file (JPG/PNG) - preview appears
- [ ] Click Upload button - progress shows
- [ ] Verify upload succeeds and URLs appear
- [ ] Check Supabase Storage dashboard - 3 variants exist
- [ ] Copy URL and open in browser - image displays
- [ ] Try uploading invalid file type (.txt) - error shows
- [ ] Try uploading large file (>10MB) - error shows
- [ ] Create artwork with uploaded image - saves successfully
- [ ] Edit artwork - existing image displays
- [ ] Upload new image to replace - old image replaced
- [ ] Test drag-and-drop file selection (if implemented)
- [ ] Test Clear button - selection removed

## Success Criteria

- [ ] All image utility tests pass (100% coverage)
- [ ] All API route tests pass (90%+ coverage)
- [ ] All ImageUploader tests pass (80-85% coverage)
- [ ] TypeScript compiles without errors
- [ ] ESLint passes with no warnings
- [ ] Prettier formatting applied
- [ ] Can upload image in create artwork form
- [ ] 3 variants created in Supabase Storage
- [ ] URLs stored correctly in database
- [ ] File type validation works
- [ ] File size validation works
- [ ] Image preview displays correctly
- [ ] Can replace image in edit mode
- [ ] Upload progress indicator works
- [ ] Error messages display correctly
- [ ] Manual testing checklist complete
- [ ] The verify-code skill has been successfully executed

## Notes

### Sharp Installation

Install Sharp if not already present:

```bash
npm install sharp
```

Sharp is a native Node.js module. If installation issues occur on Windows, see Sharp documentation for Windows-specific instructions.

### Image Processing Performance

Sharp is significantly faster than alternatives (canvas, ImageMagick):

- Processes images in parallel (3 variants generated simultaneously)
- Streaming API reduces memory usage
- WebP conversion is hardware-accelerated where available

For MVP, default quality settings (80) are sufficient. Future enhancement: Allow quality customization.

### Error Handling Strategy

**Client-side (ImageUploader)**:

- File type check before upload (instant feedback)
- File size check before upload (instant feedback)
- Display network errors from API
- Show upload progress to indicate activity
- Allow retry on failure

**Server-side (Upload API)**:

- Validate session before processing
- Validate file type and size
- Wrap image processing in try/catch
- Wrap storage upload in try/catch
- Return specific error codes for different failure modes
- Log errors for debugging (development mode)

### Memory Management

Large image processing can consume significant memory:

- Sharp streams data to reduce memory footprint
- API route processes one upload at a time (no concurrency)
- Garbage collection after each upload
- For production: Consider serverless function memory limits (increase if needed)

### Supabase Storage Configuration

Verify Supabase Storage setup before implementing:

1. ✅ Bucket `artwork` exists and is public
2. ✅ RLS policies allow public read, authenticated insert/delete
3. ✅ File size limit set to 10MB in bucket settings
4. ✅ Test upload via Supabase dashboard works

### Database Field Mapping

ImageUploader returns object with keys matching database columns:

```typescript
{
    image_thumbnail_url: string,  // 300px variant
    image_url: string,             // 800px variant (preview)
    image_large_url: string        // 1600px variant
}
```

ArtworkForm stores these directly in form state and passes to `createArtwork()`/`updateArtwork()`.

### Future Enhancements

Not in scope for this task but documented for future:

- Multiple image uploads (gallery support)
- Image cropping before upload
- Compression quality slider
- Automatic image optimization (lazy loading, responsive images)
- Orphaned image cleanup (delete from storage when artwork deleted)
- Image CDN integration
- Progress resumption for large uploads

### Accessibility

- File input has accessible label
- Upload button has clear text ("Upload Image")
- Progress indicator announced to screen readers
- Error messages associated with file input (ARIA)
- Image preview has alt text
- Keyboard navigation support for all controls
