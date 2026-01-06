<objective>
Implement the ImageLightbox component to make all tests pass (TDD Green Phase). Create a fully accessible, reusable lightbox component following the existing CartDrawer pattern.
</objective>

<context>
You are implementing Step 3 of the lightbox viewer implementation plan (TDD Green Phase).

**CRITICAL CONTEXT FROM PREVIOUS STEP:**
{context_from_step_2}

Reference the full specification at: @.specs/2026-01-06T07-53-44-claude-issue-56.md

The tests have been written and are currently failing. Your goal is to implement the component with the MINIMUM code needed to make all tests pass.

Read @CLAUDE.md for project conventions.
Examine @src/components/ui/CartDrawer.tsx (if it exists) for modal/overlay patterns to follow.
</context>

<requirements>
Create file: `src/components/ui/ImageLightbox.tsx`

Implement a client component ("use client") with these features:

1. **Props Interface:**

    ```typescript
    interface ImageLightboxProps {
        isOpen: boolean;
        onClose: () => void;
        imageSrc: string;
        imageAlt: string;
        imageTitle?: string;
    }
    ```

2. **Core Features:**
    - Render overlay (dark backdrop) with click-to-close functionality
    - Render lightbox dialog with close button (X)
    - Display full-size image using Next.js `Image` component
    - Handle Escape key to close lightbox
    - Implement focus trap (Tab/Shift+Tab stay within lightbox)
    - Prevent body scroll when lightbox is open
    - Restore focus to trigger element when closed
    - Return null when `isOpen={false}`

3. **Styling Requirements:**
    - Overlay: `fixed inset-0 bg-black/80 z-40` (darker than CartDrawer for better image viewing)
    - Lightbox container: `fixed inset-0 z-50 flex items-center justify-center p-4`
    - Close button: positioned top-right, white text/icon on dark background, easily tappable
    - Image: centered, responsive, `object-contain`, max width/height

4. **Accessibility (WCAG 2.1 AA):**
    - `role="dialog"` on lightbox container
    - `aria-modal="true"` on lightbox container
    - `aria-labelledby` pointing to image title element
    - Focus close button automatically when lightbox opens
    - Trap focus within lightbox (prevent Tab from escaping)
    - Screen reader announcements for dialog opening
    - Proper ARIA labels on close button
      </requirements>

<implementation>
- Use React hooks: `useEffect` for focus management and body scroll lock, `useRef` for element references
- Follow the CartDrawer pattern for overlay/modal behavior if that component exists in the codebase
- Use Tailwind CSS classes for all styling (this project uses Tailwind CSS 4)
- For Next.js Image component: Use `fill` prop with `object-contain` for responsive full-size display
- For focus trap: Track focusable elements and manage Tab/Shift+Tab keyboard events
- For body scroll lock: Add/remove class or style on document.body
- Keep implementation SIMPLE - only add code needed to pass tests (YAGNI principle)
</implementation>

<verification>
After implementing the component, use the verify-code skill to ensure all quality checks pass:
- TypeScript compilation
- ESLint validation
- Prettier formatting
- ALL tests must now PASS (Green Phase complete)

Use the Skill tool to invoke: `verify-code`

If tests still fail after 3 attempts to fix issues, STOP and report the problem.
</verification>

<output>
Create file: `src/components/ui/ImageLightbox.tsx`

Report back:

- Confirmation that component was implemented
- Test results: Number of tests passing vs failing
- Any challenges encountered during implementation
- Context for next step: Component is functional and all tests pass, ready for refactoring
  </output>

<success_criteria>

- Component file created at correct path
- ALL 17+ tests now pass (Green Phase complete)
- TypeScript compiles without errors
- No ESLint warnings or errors
- Code follows Prettier formatting
- Component is accessible and follows WCAG 2.1 AA standards
- Ready to proceed with Step 4 (refactoring)
  </success_criteria>
