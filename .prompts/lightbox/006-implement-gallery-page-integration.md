<objective>
Update the Gallery detail page to integrate the ImageLightbox component, use appropriate image resolutions (800px for main display, 1600px for lightbox), and add visual affordances for user interaction (TDD Green Phase).
</objective>

<context>
You are implementing Step 6 of the lightbox viewer implementation plan (TDD Green Phase for Gallery page).

**CRITICAL CONTEXT FROM PREVIOUS STEP:**
{context_from_step_5}

Reference the full specification at: @.specs/2026-01-06T07-53-44-claude-issue-56.md

Tests have been written and are failing. Your goal is to update the Gallery detail page to make all tests pass.

Read @CLAUDE.md for project conventions.
Read current Gallery detail page: @src/app/gallery/[slug]/page.tsx
</context>

<requirements>
Modify/create these files:
1. `src/app/gallery/[slug]/page.tsx` (Server Component - data fetching, metadata)
2. `src/app/gallery/[slug]/GalleryDetailClient.tsx` (Client Component - NEW FILE for interactive UI)

**Architecture Pattern (Next.js App Router):**

- Server Component (page.tsx): Keep data fetching, metadata generation, SEO
- Client Component (GalleryDetailClient.tsx): Handle state, event handlers, lightbox

**Changes to Implement:**

1. **Image Resolution Update:**
    - Main display: Use `artwork.image_large_url` (800px) instead of `artwork.image_url` (1600px)
    - Lightbox: Pass `artwork.image_url` (1600px) to ImageLightbox component
    - Fallback: If `image_large_url` is missing, fall back to `image_url`

2. **Visual Affordances (Approved Design):**
    - **"Click to enlarge" text hint:** Persistent text below or near image, always visible, high contrast
    - **Zoom icon overlay on hover:** Centered magnifying glass icon with semi-transparent background (desktop only)
    - **Keyboard accessibility:** Image wrapper with role="button", tabindex="0", clear focus indicator
    - **ARIA attributes:** Proper labels for screen reader users

3. **Lightbox Integration:**
    - Import ImageLightbox component
    - Add state: `const [lightboxOpen, setLightboxOpen] = useState(false)`
    - Click handler to open lightbox: `onClick={() => setLightboxOpen(true)}`
    - Keyboard handler for Enter/Space keys
    - Render ImageLightbox with proper props:
        - `isOpen={lightboxOpen}`
        - `onClose={() => setLightboxOpen(false)}`
        - `imageSrc={artwork.image_url}` (1600px)
        - `imageAlt={artwork.alt_text || artwork.title}`
        - `imageTitle={artwork.title}`

4. **Preserve Server-Side Rendering:**
    - Keep metadata generation in server component (page.tsx)
    - Keep data fetching in server component
    - Pass artwork data as props to client component
      </requirements>

<implementation>
**Step-by-step approach:**

1. Read the current Gallery detail page implementation
2. Create GalleryDetailClient.tsx as a client component ("use client")
3. Move interactive image display logic from page.tsx to GalleryDetailClient.tsx
4. Update page.tsx to use GalleryDetailClient as a child component
5. Implement visual affordances with Tailwind CSS:
    - Text hint: Always visible, semantic HTML, accessible
    - Zoom icon: CSS hover state, SVG icon, aria-hidden="true" (decorative)
6. Test each change incrementally using verify-code skill

**Styling Notes:**

- Use Tailwind CSS 4 for all styling
- Cursor: `cursor-pointer` or `cursor-zoom-in` on clickable image
- Focus indicator: Visible outline/ring for keyboard navigation
- Responsive: Image and hint work on mobile and desktop
  </implementation>

<verification>
After implementing changes, use the verify-code skill to ensure:
- TypeScript compilation passes
- ESLint validation passes
- Prettier formatting maintained
- ALL tests now PASS (Green Phase complete)

Use the Skill tool to invoke: `verify-code`

If tests fail after 3 attempts to fix, STOP and report the issue.
</verification>

<output>
Create/update files:
- `src/app/gallery/[slug]/page.tsx`
- `src/app/gallery/[slug]/GalleryDetailClient.tsx` (new file)

Report back:

- Summary of changes made to both files
- Test results: All tests now passing
- Image resolution strategy confirmed (800px main, 1600px lightbox)
- Visual affordances implemented (text hint + zoom icon)
- Any challenges encountered
- Context for next step: Integration complete, ready for refactoring
  </output>

<success_criteria>

- GalleryDetailClient.tsx created with lightbox integration
- page.tsx updated to use client component
- Image display uses 800px (image_large_url) for main view
- Lightbox receives 1600px (image_url) for full-size viewing
- Visual affordances implemented (text hint + zoom icon overlay)
- Keyboard accessibility implemented
- ALL tests pass (Green Phase complete)
- Server-side rendering preserved for SEO
- Ready to proceed with Step 7 (refactoring)
  </success_criteria>
