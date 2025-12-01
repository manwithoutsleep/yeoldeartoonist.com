# User Guide: Add New Artwork (Admin)

This guide provides step-by-step instructions for adding new artwork to your website using the Admin panel's "Add New Artwork" page.

## Accessing the Page

1. Log in to the admin panel at `/admin`
2. Click on "Artwork" in the admin navigation
3. Click the "Add New Artwork" button

You will be taken to `/admin/artwork/new`

---

## Step-by-Step Instructions

### 1. Upload the Artwork Image

The first section at the top of the form is dedicated to uploading the artwork image.

#### Supported File Types

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

#### Maximum File Size

- 4 MB

#### Upload Process

1. **Click "Choose File"** - This opens your computer's file browser
2. **Select an image file** from your computer
3. **Preview** - After selecting, you'll see a preview of the image
4. **Click "Upload Image"** - This uploads the file to the server
5. **Wait for confirmation** - A progress bar shows the upload status

**Important:** The upload creates three optimized versions of your image:

- **Thumbnail** (300px wide) - Used in gallery grids and shop listings (displayed at ~300×300px)
- **Standard** (800px wide) - **Currently not used** (reserved for future features)
- **Large** (1600px wide) - Used on artwork detail pages (displayed at ~484×484px due to CSS constraints)

All variants maintain the original aspect ratio (height scales proportionally to preserve image proportions). All images are converted to WebP format for optimal web performance.

**Note:** The larger images (800px and 1600px) are currently underutilized due to CSS display constraints. The 1600px image is downloaded on detail pages but displayed at only ~484px. These larger variants may be used in future features such as image zoom, lightbox viewing, or responsive layouts for larger screens.

If you encounter an error during upload, check:

- File size is under 4 MB
- File type is JPEG, PNG, or WebP
- You have a stable internet connection

---

## Form Fields Reference

Each field on the form is described below, including what it does, where it appears on the public website, and examples of appropriate entries.

### Basic Information

#### Title (Required)

**What it is:** The name of the artwork

**Where it appears:**

- Gallery page: Displayed under each thumbnail
- Shoppe page: Displayed as the product title
- Artwork detail page: Large heading at the top
- Browser tab: Used in the page title
- Search results: Used in search engine listings

**Requirements:** Must not be empty

**Examples:**

- "Sunset Over the Mountains"
- "Portrait of a Lady"
- "Abstract Composition No. 7"

---

#### Slug (Required)

**What it is:** The URL-friendly version of the title used in the web address

**Where it appears:**

- In the URL: `yoursite.com/gallery/[slug]`
- Not visible to visitors

**Requirements:**

- Must not be empty
- Must contain only lowercase letters and numbers
- Must use hyphens (-) to separate words
- No spaces, underscores, or special characters allowed

**How to create a slug:**

1. Start with your title
2. Convert to lowercase
3. Replace spaces with hyphens
4. Remove filler words (the, a, an, of, etc.)

**Examples:**

- Title: "Sunset Over the Mountains" → Slug: `sunset-over-mountains`
- Title: "Portrait of a Lady" → Slug: `portrait-lady`
- Title: "Abstract Composition No. 7" → Slug: `abstract-composition-7`

**Tips:**

- Keep it short but descriptive
- Once published, avoid changing the slug (it breaks existing links)

---

#### Description (Optional)

**What it is:** A detailed description of the artwork

**Where it appears:**

- Gallery page: Shows first 2 lines under the title
- Shoppe page: Shows first 2 lines under the title
- Artwork detail page: Full description displayed prominently
- Search results: May be used in search engine snippets

**Requirements:** None (optional field)

**What to include:**

- Visual description of the artwork
- Story or inspiration behind the piece
- Techniques or materials used
- Any interesting details viewers should notice

**Examples:**

- "This vibrant landscape captures the golden hour as the sun sets behind jagged mountain peaks. Painted en plein air during a hiking trip in the Rockies."
- "A contemplative portrait study exploring light and shadow through traditional oil painting techniques. The subject's gaze invites the viewer into a moment of quiet reflection."
- "Part of my geometric abstraction series, this piece explores the relationship between color, form, and negative space using bold primary colors."

---

### Pricing & Inventory

#### Price (Required)

**What it is:** The selling price in US dollars

**Where it appears:**

- Shoppe page: Large price display on product card
- Not shown on Gallery page (gallery items without price don't need inventory)

**Requirements:**

- Must be a positive number
- Can include cents (decimals)

**Format:** Enter numbers only (no $ symbol)

**Examples:**

- `49.99`
- `150.00`
- `1250.50`

**Tips:**

- For prints, consider standard price points: $25, $50, $75, $100
- For originals, price based on size, medium, and time invested
- Leave at 0 if the artwork is not for sale (display only)

---

#### Original Price (Optional)

**What it is:** The price before a sale or discount

**Where it appears:**

- Shoppe page: Shown with strikethrough text above the current price

**Requirements:**

- Must be a positive number (if provided)
- Should be higher than the regular Price

**Use when:**

- Running a sale or promotion
- Offering a limited-time discount
- Showing the original price of a marked-down item

**Examples:**

- Price: `39.99`, Original Price: `59.99` (shows 33% off)
- Price: `100.00`, Original Price: `150.00` (shows discount)

**Tips:**

- Leave empty if the item is not on sale
- Make sure the original price is genuinely higher than the sale price

---

#### SKU (Optional)

**What it is:** Stock Keeping Unit - an internal tracking code for inventory management

**Where it appears:**

- Not visible to website visitors
- Used for internal inventory tracking and order management

**Requirements:** None (optional field)

**Format:** Any alphanumeric code that makes sense for your inventory system

**Examples:**

- `PRINT-MTN-001`
- `OIL-PORT-24X36-01`
- `ABS-007-BLUE`
- `2024-SUNSET-01`

**Tips:**

- Create a consistent naming system
- Include information that helps you identify the item (type, subject, size, etc.)
- Keep it short and memorable

---

#### Inventory Count (Required)

**What it is:** Number of items available for sale

**Where it appears:**

- Shoppe page: Shows "Only X left in stock" warning if count is below 5
- Determines if the item appears in the Shoppe at all (must be > 0)

**Requirements:**

- Must be a non-negative whole number (0 or greater)

**Behavior:**

- **0** - Item does NOT appear in the Shoppe (sold out or display-only)
- **1-4** - Item appears with "Only X left in stock" warning in red
- **5+** - Item appears normally without stock warning

**Examples:**

- `0` - Original painting (sold or not for sale)
- `1` - One-of-a-kind original
- `25` - Limited edition print run
- `100` - Open edition, plenty in stock

**Tips:**

- For original artwork (one-of-a-kind), use `1` if for sale, `0` if not
- For prints, set to your actual inventory quantity
- Gallery-only items should have `0` inventory

---

### Artwork Details

#### Medium (Optional)

**What it is:** The materials and techniques used to create the artwork

**Where it appears:**

- Artwork detail page: Listed in the metadata section

**Requirements:** None (optional field)

**Examples:**

- "Oil on canvas"
- "Watercolor on paper"
- "Digital painting"
- "Acrylic on wood panel"
- "Graphite and charcoal on paper"
- "Mixed media: ink, watercolor, and gold leaf"
- "Giclee print on archival paper"

**Tips:**

- Be specific about materials
- For prints, specify the print type (giclee, lithograph, etc.)
- For digital works, note if it's a print or the original file

---

#### Dimensions (Optional)

**What it is:** The physical size of the artwork

**Where it appears:**

- Artwork detail page: Listed in the metadata section

**Requirements:** None (optional field)

**Format:** Use inches or centimeters, be consistent

**Examples:**

- `24" × 36"`
- `18 × 24 inches`
- `30 × 40 cm`
- `12" × 16" (framed: 16" × 20")`
- `Digital: 3000 × 4000 pixels`

**Tips:**

- Include units (inches or cm)
- For framed works, consider noting both artwork and frame size
- For prints, specify the print size (not the original artwork size)
- Use the × symbol for clarity

---

#### Year Created (Optional)

**What it is:** The year the artwork was completed

**Where it appears:**

- Artwork detail page: Listed in the metadata section

**Requirements:** Must be a valid year (whole number)

**Default value:** Current year

**Examples:**

- `2024`
- `2023`
- `2019`

**Tips:**

- Use the year the artwork was finished, not started
- For prints of older originals, use the year the original was created
- For commissions, use the year you completed the work

---

#### Display Order (Required)

**What it is:** Controls the order in which artwork appears in lists

**Where it appears:**

- Gallery page: Artwork is sorted by this number (lowest first)
- Shoppe page: Products are sorted by this number (lowest first)

**Requirements:** Must be a whole number

**Default value:** 0

**How it works:**

- Lower numbers appear first
- Higher numbers appear later
- Items with the same number are sorted alphabetically by title

**Examples:**

- Set your newest or most important pieces to `0` or `1`
- Set older or less important pieces to higher numbers like `100`, `200`, etc.
- Use increments of 10 to allow easy reordering: `0, 10, 20, 30...`

**Tips:**

- Use multiples of 10 (0, 10, 20...) to leave room for insertions
- Periodically review and adjust the order as you add new work
- Consider featuring seasonal or special pieces by temporarily lowering their number

---

### Publishing Options

#### Published (Checkbox)

**What it is:** Controls whether the artwork is visible to the public

**Behavior:**

- **Checked** - Artwork appears on Gallery and Shoppe pages
- **Unchecked** - Artwork is hidden from public view (draft mode)

**Use cases for unpublished:**

- Draft entries you're still working on
- Seasonal artwork you want to publish later
- Sold items you want to keep in the database but hide from the site
- Testing new entries before making them live

**Tip:** Always uncheck this when creating a new entry, then publish after you've verified all information is correct.

---

#### Featured (Checkbox)

**What it is:** Marks artwork as featured (currently not actively used on the site)

**Where it appears:**

- Not currently displayed anywhere on the public site
- Reserved for future features (homepage carousel, featured section, etc.)

**Tip:** This field is not currently functional but is included for future development.

---

#### Limited Edition (Checkbox)

**What it is:** Indicates whether the artwork is a limited edition print or piece

**Where it appears:**

- Not currently displayed on the public site
- Used for internal classification
- May be used in future features

**When to check:**

- Limited edition prints with numbered runs
- Series with a fixed number of pieces
- Special releases with limited availability

**Tip:** This is primarily for your internal organization at this time.

---

### SEO & Accessibility

#### Alt Text (Optional)

**What it is:** Descriptive text for screen readers and when images fail to load

**Where it appears:**

- In the HTML `alt` attribute of the image
- Read aloud by screen readers for visually impaired visitors
- Shown when images fail to load
- Used by search engines to understand image content

**Requirements:** None (optional but highly recommended)

**Best practices:**

- Describe what's in the image concisely
- Don't start with "Image of" or "Picture of" (screen readers already announce it's an image)
- Include important details but keep it under 125 characters
- Describe the content, not your interpretation

**Examples:**

- "Mountain landscape at sunset with purple and orange sky"
- "Portrait of woman in profile with dramatic side lighting"
- "Abstract geometric composition with red, blue, and yellow triangles"
- "Watercolor painting of flowers in a blue vase on a table"

**Why it matters:**

- Accessibility for visually impaired visitors
- Better SEO (search engines can't "see" images)
- Context when images don't load

---

#### Tags (Optional)

**What it is:** A comma-separated list of keywords for categorization

**Where it appears:**

- Artwork detail page: Displayed as rounded gray badges/chips
- May be used for filtering in future features

**Format:** Enter tags separated by commas

**Requirements:** None (optional field)

**Examples:**

- `landscape, mountains, sunset, nature`
- `portrait, oil painting, classical`
- `abstract, geometric, colorful, modern`
- `watercolor, floral, still life`
- `digital art, fantasy, surreal`

**Tips:**

- Use lowercase for consistency
- Keep tags broad enough to group similar works
- Include subject matter, style, medium, and mood
- 3-6 tags per artwork is usually sufficient
- Think about how visitors might search or filter

**Common tag categories:**

- **Subject:** landscape, portrait, still life, abstract, figure
- **Medium:** oil, watercolor, digital, acrylic, graphite
- **Style:** realistic, impressionist, abstract, surreal, contemporary
- **Mood:** peaceful, dramatic, whimsical, somber, energetic
- **Theme:** nature, urban, fantasy, historical, seasonal

---

#### SEO Title (Optional)

**What it is:** A custom title specifically for search engine results pages

**Where it appears:**

- Search engine results: The blue clickable link
- Browser tab: The text shown in the tab
- Social media shares: The title when shared on social platforms

**Requirements:** None (optional field)

**Default behavior:** If left empty, the regular Title field is used

**When to use a custom SEO title:**

- To include keywords not in the artwork title
- To make the title more search-friendly
- To add your brand name
- To provide more context

**Best practices:**

- Keep it under 60 characters (or it gets cut off in search results)
- Include your most important keywords
- Make it compelling and clickable
- Consider including your name or brand

**Examples:**

- Artwork Title: "Sunset Over Mountains"
  SEO Title: "Mountain Sunset Landscape Painting | Jane Smith Art"

- Artwork Title: "Abstract Composition 7"
  SEO Title: "Bold Geometric Abstract Art Print - Abstract Composition 7"

- Artwork Title: "Portrait Study"
  SEO Title: "Classical Oil Portrait Painting | Original Fine Art"

**Tip:** If you're happy with your artwork title as-is, leave this field empty.

---

#### SEO Description (Optional)

**What it is:** A custom description specifically for search engine results pages

**Where it appears:**

- Search engine results: The gray text below the blue link
- Social media shares: The description when shared on social platforms

**Requirements:** None (optional field)

**Default behavior:** If left empty, search engines may use your Description field or generate their own

**Best practices:**

- Keep it between 120-160 characters (longer descriptions get cut off)
- Include relevant keywords naturally
- Make it compelling - this is your "sales pitch" in search results
- Include a call-to-action if appropriate
- Front-load the most important information

**Examples:**

- "Discover this vibrant mountain sunset landscape oil painting. Original artwork available for purchase. View details and pricing."

- "Bold geometric abstract art print with primary colors. Limited edition giclee print on archival paper. Shop now."

- "Classical oil portrait study exploring light and shadow. Original fine art painting by Jane Smith. View in gallery."

**Tip:** If your regular Description field is already optimized and compelling, you can leave this empty.

---

## Saving Your Work

### Save Button

After filling out all desired fields, click the **"Save Artwork"** button at the bottom right of the form.

**What happens when you save:**

1. The form validates all required fields
2. If validation passes, the artwork is saved to the database
3. You're redirected to the Artwork List page
4. You'll see a success message

**If there are errors:**

- Red error messages appear under the problematic fields
- Fix the errors and try saving again
- Common errors:
    - Empty Title field
    - Invalid Slug format (must be lowercase with hyphens)
    - Invalid Price format (must be a positive number)
    - Missing required fields

### Cancel Button

Click the **"Cancel"** button to return to the previous page without saving changes.

Alternatively, click the **"← Back to Artwork List"** link at the bottom left.

---

## Quick Reference Checklist

Use this checklist when adding new artwork:

- [ ] Upload and process artwork image
- [ ] Enter Title (required)
- [ ] Create URL-friendly Slug (required)
- [ ] Write Description (recommended)
- [ ] Set Price (required if selling)
- [ ] Set Inventory Count (required, 0 for display-only)
- [ ] Enter Medium (recommended)
- [ ] Enter Dimensions (recommended)
- [ ] Set Year Created (optional)
- [ ] Set Display Order (lower = appears first)
- [ ] Check "Published" when ready to go live
- [ ] Add Alt Text (recommended for accessibility)
- [ ] Add relevant Tags (optional but useful)
- [ ] Set SEO Title and Description if needed (optional)
- [ ] Click "Save Artwork"

---

## Common Workflows

### Adding a Gallery-Only Item (Not for Sale)

1. Upload image
2. Enter Title and Slug
3. Write Description
4. Set Price to any value (it won't be displayed)
5. **Set Inventory Count to 0** (this keeps it out of the Shoppe)
6. Fill in Medium, Dimensions, Year
7. Add Alt Text and Tags
8. Check "Published"
9. Save

**Result:** Appears in Gallery only, not in Shoppe.

---

### Adding a Print for Sale

1. Upload image
2. Enter Title and Slug
3. Write Description
4. Set Price (e.g., 49.99)
5. **Set Inventory Count to your available stock** (e.g., 25)
6. Add SKU for tracking (e.g., PRINT-MTN-001)
7. Set Medium to "Giclee print on archival paper" or similar
8. Add Dimensions of the print
9. Add Alt Text and Tags
10. Check "Published" when ready
11. Save

**Result:** Appears in both Gallery and Shoppe with "Add to Cart" option.

---

### Adding a One-of-a-Kind Original

1. Upload image
2. Enter Title and Slug
3. Write detailed Description (buyers want to know about originals)
4. Set Price
5. **Set Inventory Count to 1** (only one available)
6. Add Medium (e.g., "Oil on canvas")
7. Add Dimensions
8. Set Year Created
9. Add Alt Text and Tags
10. Consider adding "original" or "one-of-a-kind" to Tags
11. Check "Published" when ready
12. Save

**Result:** Appears in both Gallery and Shoppe with "Only 1 left in stock" warning.

---

### Creating a Draft (Not Yet Published)

1. Upload image
2. Fill in basic fields (Title, Slug, Price, Inventory Count)
3. **Leave "Published" UNCHECKED**
4. Save

**Result:** Saved in database but not visible to public. You can edit and publish later.

---

## Tips & Best Practices

### Images

- Use high-quality images (at least 2000px on the longest side for best quality)
- Images are automatically resized to 300px, 800px, and 1600px widths
- **Current display sizes:** Gallery thumbnails ~300px, detail pages ~484px (larger variants reserved for future use)
- Ensure good lighting and accurate color representation
- Keep file sizes under 4 MB (compress if needed before uploading)
- Use consistent backgrounds for a professional look
- Avoid watermarks in the main image area (if needed, place them subtly)
- Images are automatically converted to WebP format for optimal performance
- **Tip:** Since images are currently displayed at smaller sizes, focus on images that look good as thumbnails

### Titles & Descriptions

- Use clear, descriptive titles that help visitors understand the artwork
- Write descriptions that tell a story or provide context
- Proofread for spelling and grammar
- Be authentic and personal in your voice

### Pricing

- Research similar artwork to price competitively
- Consider your time, materials, and skill level
- Be consistent with pricing for similar-sized works
- Factor in framing costs if applicable
- Don't undervalue your work

### Organization

- Use Display Order strategically to highlight your best work
- Review and update Display Order regularly as you add new pieces
- Use consistent tagging to make future filtering easier
- Create a SKU naming system and stick to it
- Keep inventory counts accurate (update after sales)

### SEO

- Always fill in Alt Text for accessibility and SEO
- Add Tags to help with organization and future search features
- Use SEO Title/Description for competitive keywords
- Include your name or brand in SEO fields

### Publishing Strategy

- Create items as drafts first (unpublished)
- Review all information before publishing
- Check how it looks on the public site after publishing
- Schedule regular reviews of published items

---

## Troubleshooting

### "Slug must be lowercase with hyphens" error

- Remove spaces, underscores, and special characters
- Convert all letters to lowercase
- Use only hyphens (-) to separate words
- Example: "My Art Work!" → "my-art-work"

### "Price must be a valid positive number" error

- Enter numbers only (no $ symbol)
- Use a decimal point for cents (not a comma)
- Ensure the value is greater than 0
- Example: 49.99 (not $49.99 or 49,99)

### Image upload fails

- Check file size (must be under 4 MB)
- Verify file type (JPEG, PNG, or WebP only)
- Ensure stable internet connection
- Try compressing the image if it's too large (tools like TinyPNG or Squoosh can help)
- Try a different file format (JPEG usually produces smaller files than PNG)

### Artwork doesn't appear in Gallery or Shoppe

- Check that "Published" is checked
- Verify inventory count is greater than 0 (for Shoppe)
- Clear your browser cache and refresh
- Wait an hour for the cache to update (ISR revalidation)

### Changes don't show up on public site

- The public pages cache for 1 hour
- Wait up to 1 hour for changes to appear
- Clear your browser cache
- Try viewing in an incognito/private window

---

## Known Limitations & Future Enhancements

### Image Display Sizes

**Current State:**

- The system generates three image sizes (300px, 800px, 1600px) during upload
- **Gallery page:** Uses 300px thumbnails, displayed at ~300×300px ✓ Optimal
- **Shoppe page:** Uses 300px thumbnails, displayed at ~300×300px ✓ Optimal
- **Detail page:** Uses 1600px large images, but displays at only ~484×484px ⚠️ Underutilized
- **800px variant:** Not currently used anywhere ⚠️

**Impact:**

- Larger images (especially 1600px) are downloaded but not displayed at full size
- This uses more bandwidth than necessary without visual benefit to users
- No way for visitors to view artwork at larger sizes or zoom in

**Potential Future Enhancements:**

- Add lightbox/zoom functionality to view images at full size
- Implement responsive image loading (serve appropriate size based on screen)
- Add click-to-enlarge feature on detail pages
- Use 800px variant for tablet/medium screen sizes
- Adjust CSS to allow larger display on detail pages

**Current Recommendation:**
Focus on images that look good as thumbnails (~300px) since that's the most common viewing size. The larger variants are stored for future use when image viewing features are enhanced.

---

## Getting Help

If you encounter issues not covered in this guide:

1. Check the main documentation in `.docs/INDEX.md`
2. Review the migration guide for database schema details
3. Contact your developer or system administrator
4. Check the error logs if you have access

---

## Related Documentation

- `.docs/INDEX.md` - Full documentation index
- `.docs/SETUP.md` - Initial setup and configuration
- `.docs/MIGRATIONS_GUIDE.md` - Database schema reference

---

**Last Updated:** December 2024
**Version:** 1.0
