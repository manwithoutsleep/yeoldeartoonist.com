/**
 * Site configuration
 * Centralized configuration for artist info and site settings
 */

export const siteConfig = {
    // Artist Information
    artist: {
        name: "Joe Schlottach",
        email: "joe@yeoldeartoonist.com",
        bio: `I am a Missouri born and raised lover of the arts! Honed my craft before the advent of the internet and now work in both practical and digital. Over the last couple decades I have worked on varied commissions and murals as a freelance artist outside of my 8 to 5's. Being a child of the 80's I was surrounded by nature and heavily influenced by the modern age of comics, the renaissance period of Disney, Hollywood Blockbusters, Saturday morning cartoons and Anime, the rise of the home gaming consoles and the Golden age of arcades as well as the multitudes of fantasy/sci-fi literature. Basically an all you can eat smorgasbord for my imagination!`,
        mailingAddress: {
            poBox: "PO Box 123",
            city: "Columbia",
            state: "MO",
            zip: "65201",
            country: "United States",
        },
        responseTime:
            "I typically respond to emails within 1-2 business days. Thank you for reaching out!",
    },

    // Site Information
    site: {
        title: "Ye Olde Artoonist",
        description:
            "Explore original artwork, prints, and more from Joe Schlottach",
        url: "https://yeoldeartoonist.com",
    },

    // Navigation
    navigation: {
        cards: [
            {
                title: "Gallery",
                href: "/gallery",
                image: "gallery.webp",
                description: "CHECK IT! PEEP THE VISUALS!",
            },
            {
                title: "Shoppe",
                href: "/shoppe",
                image: "shoppe.webp",
                description: "PURVEYOR OF PRINTS, KNICKNACKS & DOOHICKEYS!",
            },
            {
                title: "In The Works",
                href: "/in-the-works",
                image: "in the works.webp",
                description: "STAY UP TO DATE ON UPCOMING PROJECTS AND EVENTS!",
            },
            {
                title: "Contact",
                href: "/contact",
                image: "contact.webp",
                description: "NO CARRIER PIGEON REQUIRED!",
            },
        ],
    },

    // Social Media Links
    socialMedia: {
        sites: [
            {
                title: "instagram",
                href: "https://www.instagram.com/ye_olde_artoonist",
                logo: "instagram-logo-black.png",
            },
            // Future social media links can be added here
        ],
    },
};
