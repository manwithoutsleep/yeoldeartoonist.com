# yeoldeartoonist.com website design conversation

## Overview

I'm preparing to build a website on this Next.js platform with Tailwind CSS for Joe, a visual artist who wants to display his work and offer an online store to buy it. I'd like your help designing the application.

The website is for a visual artist named Joe. The site will have images well-placed throughout. All images will be supplied by Joe and will be his artwork.

## Main pages

The specs include:

1. A home page with a few samples of Joe's work and links to all the other pages.
2. A "Gallery" page with a grid of thumbnails of Joe's work.
3. A "Shoppe" page with a grid of thumbnails of Joe's work. This page offers items for sale, so we will need a shopping cart and checkout system.
4. An "In the works" page with information about Joe's upcoming projects and convention appearances.
5. A "Meet The Artist" page with contact details for Joe.

The images in @specs\wireframes show the general layout for each page.

## Database

To manage the content we will need a Supabase database. My initial stab at a database design is:

### Table: `administrators`

**Columns:**

- `id` int -- (foreign key to auth.users.id)
- `name` text
- `bio` text
- `image_url` text

### Table: `artwork`

**Columns:**

- `id` int
- `title` text
- `description` text
- `price` int -- (cents)
- `storage_path` text -- (We'll use Supabase storage for these images for now, perhaps move to AWS later)

### Table: `pages`

**Columns:**

- `id` int
- `title` text
- `description` text

### Table: `page_artwork`

**Columns:**

- `page_id`
- `artwork_id`

### Table: `projects`

**Columns:**

- `id` int
- `title` text
- `description` text
- `storage_path` text

### Table: `events`

**Columns:**

- `id` int
- `title` text
- `description` text
- `location` text
- `storage_path` text
- `start_date` date
- `end_date` date

Note: All tables will have `created_at` and `updated_at` timestamp columns.

## Layout Notes

The files in @specs\wireframes show a wireframe of the main pages. These layouts are for the full-sized desktop version of the pages. The site needs to be responsive and mobile-friendly.

All images will be supplied by Joe.

The primary site colors will be black and white. Some sections will have black background with white text, others will have white background with black text.

The site does not support switching between light mode and dark mode. All colors are static.

### Header

The header and nav bar will be consistent across all pages on the site.

The header will have a large header image at the top.

Beneath the header will be the primary navigation bar with four links:

1. Gallery
2. Shoppe
3. In The Works
4. Contact

Each of these links will be displayed as a custom image on the desktop site.

### Footer

The footer will be consistent across all pages on the site.

It will include:

- Contact information for Joe
- Copyright & licensing information
- Accessiblity statement
- Social media links
- A small image / logo

### Home Page

The Home Page layout can be seen in @specs\wireframes\01-Home-Page.jpg

The Home Page has the standard header, navigation, and footer.

Beneath the nav bar will be the home page text displayed atop an image of a scroll.

Beneath the scroll will be images corresponding to each of the pages.

### Gallery

The Gallery layout can be seen in @specs\wireframes\01-Gallery.jpg

The Gallery has the standard header, navigation, and footer.

Below the nav bar will be a short paragraph describing the Gallery.

Below the nav bar will be a gallery of images. Each image will have a title and optionally a description.

The price is not displayed on the images on the Gallery page.

### Shoppe

The Shoppe layout can be seen in @specs\wireframes\01-Shoppe.jpg

The Shoppe has the standard header, navigation, and footer.

The Shoppe is nearly identical to the Gallery except that for each image, in addition to the title and optional description, it displays

- Price
- Quantity the shopper would like to purchase
- Add to Cart button

### In The Works

The In The Works layout can be seen in @specs\wireframes\01-In-The-Works.jpg

The In The Works page has the standard header, navigation, and footer.

Below the nav bar will be a list of projects Joe is working on.

Below the projects will be a list of events at which Joe will appear. These will typically be artist or comic book conventions at which Joe will have a booth in the "artist alley".

### Contact

The Contact layout can be seen in @specs\wireframes\01-Contact.jpg

The Contact page has the standard header, navigation, and footer.

Below the navigation is the page title: "Meet The Artist: Joe Schlottach"

Below the title there will be an image of Joe on the left and a paragraph of descriptive text on the right.

### Shopping Cart

The Shoppe page necessitates the creation of a shopping cart. This should be a minimal shopping cart component with the ability to add and remove items, edit quantities, and checkout.

For MVP we will not allow customers to create an account on the site.

I'd like suggestions of how best to handle this functionality in a way that minimizes risk of security breaches and other liablilities.

## Discussion

I'd like to discussion a plan for designing and implementing this website.
