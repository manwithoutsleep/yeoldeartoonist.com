/**
 * Site configuration
 * Centralized configuration for artist info and site settings
 */

export const siteConfig = {
    // Artist Information
    artist: {
        name: 'Joe Schlottach',
        email: 'joe@yeoldeartoonist.com',
        bio: `I am a Missouri born and raised lover of the arts! Honed my craft before the advent of the internet and now work in both practical and digital. Over the last couple decades I have worked on varied commissions and murals as a freelance artist outside of my 8 to 5's. Being a child of the 80's I was surrounded by nature and heavily influenced by the modern age of comics, the renaissance period of Disney, Hollywood Blockbusters, Saturday morning cartoons and Anime, the rise of the home gaming consoles and the Golden age of arcades as well as the multitudes of fantasy/sci-fi literature. Basically an all you can eat smorgasbord for my imagination!`,
        mailingAddress: {
            poBox: 'PO Box 30799',
            city: 'Columbia',
            state: 'MO',
            zip: '65205',
            country: 'United States',
        },
        responseTime:
            'I typically respond to emails within 1-2 business days. Thank you for reaching out!',
    },

    // Shipping Information
    shipping: {
        flat_rate: 800,
        free_shipping_minimum: 10000,
    },

    // Site Information
    site: {
        title: 'Ye Olde Artoonist',
        description:
            'Explore original artwork, prints, and more from Joe Schlottach',
        url: 'https://yeoldeartoonist.com',
    },

    // Navigation
    navigation: {
        cards: [
            {
                title: 'Gallery',
                href: '/gallery',
                image: 'gallery.webp',
                description: 'CHECK IT! PEEP THE VISUALS!',
                aspectRatio: '1152:795',
            },
            {
                title: 'Shoppe',
                href: '/shoppe',
                image: 'shoppe.webp',
                description: 'PURVEYOR OF PRINTS, KNICKNACKS & DOOHICKEYS!',
                aspectRatio: '1152:807',
            },
            {
                title: 'In The Works',
                href: '/in-the-works',
                image: 'in the works.webp',
                description: 'STAY UP TO DATE ON UPCOMING PROJECTS AND EVENTS!',
                aspectRatio: '1152:890',
            },
            {
                title: 'Contact',
                href: '/contact',
                image: 'contact.webp',
                description: 'NO CARRIER PIGEON REQUIRED!',
                aspectRatio: '1152:926',
            },
        ],
    },

    // Social Media Links
    socialMedia: {
        sites: [
            {
                title: 'Instagram',
                handle: '@ye_olde_artoonist',
                href: 'https://www.instagram.com/ye_olde_artoonist',
            },
            // Future social media links can be added here
        ],
    },
};
