# Admin Panel User Guide

This guide explains how to use the Ye Olde Artoonist admin panel to manage your artwork, projects, events, and orders.

## Table of Contents

- [Logging In](#logging-in)
- [Dashboard Overview](#dashboard-overview)
- [Managing Artwork](#managing-artwork)
- [Managing Projects](#managing-projects)
- [Managing Events](#managing-events)
- [Managing Pages](#managing-pages)
- [Managing Orders](#managing-orders)
- [Managing Admin Users](#managing-admin-users)
- [Troubleshooting](#troubleshooting)

## Logging In

### Access the Admin Panel

1. Navigate to: `https://yeoldeartoonist.com/admin/login`
2. Enter your email address
3. Click "Send Magic Link"
4. Check your email inbox
5. Click the magic link to log in

### First-Time Setup

If you're the first admin user, you need to be added to the database first:

1. Sign up via the login page (this creates an auth user)
2. Have a developer run this SQL in Supabase:

    ```sql
    INSERT INTO administrators (auth_id, name, email, role, is_active)
    VALUES (
      '<your-auth-id>',  -- From auth.users table
      'Your Name',
      'your@email.com',
      'super_admin',
      true
    );
    ```

3. Log in again using the magic link

### Security Note

- Sessions expire after 15 minutes of inactivity
- Always log out when done, especially on shared computers
- Magic links expire after 1 hour
- Only use the admin panel on trusted networks

## Dashboard Overview

After logging in, you'll see the admin dashboard at `/admin`.

### Navigation

- **Dashboard** - Overview and quick actions
- **Artwork** - Manage gallery and shop items
- **Projects** - Manage upcoming projects and commissions
- **Events** - Manage calendar events and shows
- **Pages** - Manage static content pages
- **Orders** - View and manage customer orders
- **Admins** - Manage admin users (super admins only)

### Quick Stats

The dashboard shows:

- Total published artwork
- Pending orders
- Total revenue (current month)
- Recent activity

## Managing Artwork

Artwork includes both gallery pieces and shop items.

### Viewing Artwork

1. Navigate to **Artwork** in the admin menu
2. You'll see a list of all artwork with:
    - Thumbnail image
    - Title and description
    - Price and availability
    - Published status
    - Actions (Edit, Delete)

### Adding New Artwork

1. Click **Create New Artwork**
2. Fill in the required fields:

    **Basic Information:**
    - **Title** (required) - Name of the artwork
    - **Slug** - Auto-generated URL-friendly version (editable)
    - **Description** (required) - Detailed description for the artwork page
    - **Short Description** - Brief text for gallery/shop listings

    **Categorization:**
    - **Type** (required):
        - `original` - One-of-a-kind artwork
        - `print` - Art print
        - `merchandise` - Other products
    - **Category** - Select from available categories (optional)
    - **Tags** - Comma-separated keywords

    **Pricing & Availability:**
    - **Price** (required) - In USD (e.g., 50.00)
    - **Inventory Count** - Number available (0 = sold out)
    - **Display Order** - Controls order in gallery/shop (lower = earlier)

    **Publishing:**
    - **Published** - Check to make visible on the site
    - **Featured** - Check to highlight in special sections

3. **Upload Image**:
    - Click **Upload Image**
    - Select a high-quality image (recommended: 2000px minimum width)
    - Accepted formats: JPG, PNG, WebP
    - Max file size: 10MB
    - The image will be automatically optimized

4. Click **Save** to publish

### Editing Artwork

1. Find the artwork in the list
2. Click **Edit**
3. Make changes
4. Click **Save**

### Publishing Workflow

**Draft → Published Flow:**

1. Create artwork with "Published" unchecked
2. Upload image and fill in details
3. Preview the artwork page (if available)
4. Check "Published" when ready
5. Save

**Unpublishing:**

- Uncheck "Published" to hide from public site
- The artwork remains in the database
- Useful for seasonal items or sold-out originals

### Deleting Artwork

⚠️ **Warning**: Deletion is permanent and cannot be undone.

1. Click **Delete** next to the artwork
2. Confirm the deletion
3. The artwork and its image will be permanently removed

**Before deleting**, consider:

- Is it referenced in any orders?
- Do you want to keep it for records?
- Consider unpublishing instead

### Image Management

**Best Practices:**

- Use high-resolution images (2000px+ width)
- Maintain consistent aspect ratios
- Use descriptive filenames
- Compress images before uploading (to save storage)
- Use JPG for photographs, PNG for graphics with transparency

**Image Storage:**

Images are stored in Supabase Storage in the `artwork-images` bucket.

**Replacing Images:**

1. Edit the artwork
2. Upload a new image
3. The old image will be replaced
4. Save changes

## Managing Projects

Projects represent upcoming works, commissions, or special projects.

### Creating a Project

1. Navigate to **Projects**
2. Click **Create New Project**
3. Fill in the fields:
    - **Title** - Project name
    - **Description** - Detailed information
    - **Status** - `planning`, `in_progress`, `completed`, `cancelled`
    - **Priority** - `low`, `medium`, `high` (affects display order)
    - **Display Order** - Manual control of listing order
    - **Published** - Make visible on site

### Project Status Workflow

- **Planning** - Idea stage, gathering information
- **In Progress** - Actively working on the project
- **Completed** - Finished, possibly still shown on site
- **Cancelled** - Abandoned or declined

### Project Visibility

- Unpublished projects are only visible in the admin panel
- Published projects appear on the Projects page (`/projects`)
- Use "Featured" flag for homepage display

## Managing Events

Events include art shows, exhibitions, markets, and other public appearances.

### Creating an Event

1. Navigate to **Events**
2. Click **Create New Event**
3. Fill in the fields:
    - **Title** - Event name
    - **Description** - Event details
    - **Event Date** - When it occurs
    - **Location** - Where it takes place
    - **URL** (optional) - Link to event website or tickets
    - **Published** - Make visible on site

### Event Types

You can use events for:

- Art fairs and markets
- Gallery exhibitions
- Online sales events
- Workshops or classes
- Meet-and-greet appearances

### Event Display

Events are shown:

- On the Events page (`/events`)
- Sorted by date (upcoming first)
- Past events can be hidden by unpublishing

## Managing Pages

Pages are static content pages like About, Policies, etc.

### Available Pages

- **About** - Artist bio and story
- **Contact** - Contact information and form
- **Shipping Policy** - Shipping details
- **Return Policy** - Return and refund information
- **Privacy Policy** - Privacy and data handling
- **Terms of Service** - Legal terms

### Editing a Page

1. Navigate to **Pages**
2. Select the page to edit
3. Edit the content:
    - **Slug** - URL path (usually don't change)
    - **Title** - Page title
    - **Content** - Main page content (supports Markdown)
    - **Published** - Make visible on site

4. Click **Save**

### Content Formatting

Page content supports Markdown:

```markdown
# Heading 1

## Heading 2

**Bold text**
_Italic text_

[Link text](https://example.com)

- Bullet point
- Another point

1. Numbered item
2. Another item
```

## Managing Orders

### Viewing Orders

1. Navigate to **Orders**
2. You'll see a list of all orders with:
    - Order number
    - Customer name and email
    - Items ordered
    - Total amount
    - Order status
    - Order date

### Order Statuses

- **Pending** - Payment received, needs processing
- **Processing** - Being prepared for shipment
- **Shipped** - Sent to customer
- **Delivered** - Confirmed received
- **Cancelled** - Order cancelled
- **Refunded** - Payment refunded

### Processing an Order

1. Click on the order to view details
2. Review:
    - Customer information
    - Shipping address
    - Items ordered (with artwork thumbnails, titles, and SKUs)
    - Payment details

Each order item displays:

- **Artwork thumbnail** - Visual reference for the product (or placeholder if image unavailable)
- **Artwork title** - Linked to the shoppe detail page for quick reference
- **SKU** - Product identifier (displays "N/A" if not set)
- **Quantity** - Number of items ordered
- **Price** - Unit price and total for the line item

**Note**: If an artwork has been deleted from the system, it will show as "Item Unavailable" with limited details.

3. Update status to "Processing"
4. Package the items
5. Ship the order
6. Add tracking number (if available)
7. Update status to "Shipped"
8. Optionally send shipping notification email

### Adding Shipping Tracking

1. Open the order
2. Click **Add Tracking Info**
3. Enter:
    - **Carrier** - USPS, FedEx, UPS, etc.
    - **Tracking Number**
4. Save

Customers will receive an email with the tracking information.

### Refunding Orders

⚠️ **Refunds must be processed through Stripe dashboard**

1. Log into Stripe dashboard
2. Find the payment intent
3. Issue refund through Stripe
4. Update order status to "Refunded" in admin panel

### Order Filtering

Filter orders by:

- **Status** - Show only specific status
- **Date Range** - Orders within date range
- **Customer** - Search by customer name or email

### Exporting Orders

(Feature to be implemented)

## Managing Admin Users

**Note**: This section is only accessible to Super Admins.

### Viewing Admin Users

1. Navigate to **Admins**
2. See list of all administrators

### Adding a New Admin

1. Have the user sign up at `/admin/login` first (creates auth account)
2. Get their auth ID from Supabase dashboard (auth.users table)
3. In admin panel, click **Add Administrator**
4. Fill in:
    - **Auth ID** - From Supabase
    - **Name** - Admin's name
    - **Email** - Admin's email (must match auth email)
    - **Role**:
        - `super_admin` - Full access including user management
        - `admin` - Content management only
        - `editor` - Limited editing permissions
    - **Active** - Check to enable access

5. Click **Save**

### Admin Roles

- **Super Admin**:
    - Full access to all features
    - Can manage other admins
    - Can delete content
    - Should be limited to 1-2 trusted users

- **Admin**:
    - Create, edit, and publish content
    - Manage orders
    - Cannot manage other admins
    - Cannot delete critical content

- **Editor**:
    - Edit existing content
    - Cannot publish without review
    - Cannot access order management
    - Best for content contributors

### Deactivating an Admin

1. Edit the admin user
2. Uncheck **Active**
3. Save

The user will be logged out immediately and cannot access the admin panel.

### Removing an Admin

⚠️ **Permanent action**

1. Click **Delete** next to the admin
2. Confirm deletion
3. The admin record is removed (auth account remains)

## Content Publishing Workflow

### Recommended Workflow

1. **Create** content with "Published" unchecked
2. **Upload** all images and media
3. **Preview** the content (if possible)
4. **Review** for typos and formatting
5. **Publish** by checking the "Published" box
6. **Verify** on the public site

### Scheduling Content

(Feature to be implemented - for now, publish manually)

### Content Versioning

(Feature to be implemented - for now, keep local backups of important content)

## Troubleshooting Common Issues

### Can't Log In

**Problem**: Magic link doesn't work

**Solutions**:

- Check spam/junk folder
- Ensure link hasn't expired (1 hour limit)
- Request a new magic link
- Verify your email is in the administrators table
- Contact site administrator

### Images Not Uploading

**Problem**: Image upload fails

**Solutions**:

- Check file size (max 10MB)
- Verify file format (JPG, PNG, WebP only)
- Ensure stable internet connection
- Try compressing the image first
- Check browser console for errors

### Changes Not Appearing on Site

**Problem**: Published changes don't show up

**Solutions**:

- Wait 30-60 seconds for cache to clear
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Check that "Published" is checked
- Verify no errors in the form

### Lost Admin Access

**Problem**: Accidentally deactivated yourself

**Solutions**:

- Contact another super admin
- If no other admins, database access is required
- Have a developer run this SQL:

    ```sql
    UPDATE administrators
    SET is_active = true
    WHERE email = 'your@email.com';
    ```

### Can't See Orders

**Problem**: Orders aren't showing up

**Solutions**:

- Check status filter (ensure "All" is selected)
- Verify orders exist in database
- Check Stripe dashboard for successful payments
- Review webhook logs for errors
- Contact developer if webhook isn't configured

## Best Practices

### Content Management

- **Write clear descriptions** - Help customers understand your work
- **Use high-quality images** - They're the first thing customers see
- **Keep inventory updated** - Prevent orders for sold-out items
- **Categorize properly** - Makes browsing easier
- **Use consistent formatting** - Professional appearance

### Order Management

- **Process orders promptly** - Ship within 1-2 business days
- **Communicate with customers** - Update order status regularly
- **Add tracking numbers** - Reduces support inquiries
- **Handle issues quickly** - Good customer service builds trust

### Security

- **Log out when done** - Especially on shared computers
- **Use strong password** - For your email account (receives magic links)
- **Don't share admin access** - Create separate accounts for each person
- **Review admin users periodically** - Remove inactive accounts
- **Be cautious with deletions** - They're permanent

### Performance

- **Optimize images before uploading** - Faster page loads
- **Use descriptive slugs** - Better SEO
- **Keep display orders logical** - Easier to manage
- **Archive old content** - Unpublish instead of delete

## Getting Help

### Admin Panel Issues

Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.

### Technical Support

For technical issues:

1. Check the troubleshooting guide
2. Review error messages (if any)
3. Contact the site developer with:
    - What you were trying to do
    - What happened instead
    - Any error messages
    - Screenshots (if helpful)

### Content Questions

For content strategy or creative questions, consult with your team or marketing advisor.

## Feature Requests

Have ideas for improving the admin panel? Document them with:

- What feature you'd like
- Why it would be helpful
- How you'd use it
- Any examples from other sites

Share with the development team for consideration in future updates.
