'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input, TextArea } from '@/components/ui/Input';
import { useState } from 'react';

/**
 * Contact page - Meet The Artist
 *
 * Features:
 * - Black background with white text
 * - Artist image and bio (left side)
 * - Contact information (right side)
 * - Contact form placeholder for Phase 4
 * - Social media links
 * - Responsive design
 */

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Form functionality will be implemented in Phase 4
        console.log('Form submission (Phase 4):', formData);
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', message: '' });
        }, 3000);
    };

    return (
        <div className="bg-black text-white">
            {/* Artist Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-5xl font-bold text-center mb-12">
                    Meet The Artist: Joe Schlottach
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
                    {/* Artist Image */}
                    <div className="relative w-full aspect-square rounded overflow-hidden border-4 border-white">
                        <Image
                            src="/images/pages/meet-the-artist.jpg"
                            alt="The Artist"
                            fill
                            priority
                            className="object-cover"
                        />
                    </div>

                    {/* Artist Bio */}
                    <div>
                        <p className="text-lg text-gray-300 mb-4">
                            I am a Missouri born and raised lover of the arts!
                            Honed my craft before the advent of the internet and
                            now work in both practical and digital. Over the
                            last couple decades I have worked on varried
                            commissions and murals as a freelance artist outside
                            of my 8 to 5's. Being a child of the 80's I was
                            surrounded by nature and heavily influenced by the
                            modern age of comics, the renaissance period of
                            Disney, Hollywood Blockbusters, Saturday morning
                            cartoons and Anime, the rise of the home gaming
                            consoles and the Golden age of arcades as well as
                            the multitudes of fantasy/sci-fi literature.
                            Basically an all you can eat smorgasbord for my
                            imagination!
                        </p>
                    </div>
                </div>

                {/* Contact Information & Form Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Contact Information */}
                    <div className="border-2 border-white rounded p-8">
                        <h2 className="text-2xl font-bold mb-8">
                            Contact Information
                        </h2>

                        <div className="space-y-6">
                            {/* Email */}
                            <div>
                                <h3 className="font-semibold text-white mb-2">
                                    Email
                                </h3>
                                <a
                                    href="mailto:joe@yeoldeartoonist.com"
                                    className="text-blue-400 hover:text-blue-300 text-lg"
                                >
                                    joe@yeoldeartoonist.com
                                </a>
                            </div>

                            {/* Mailing Address */}
                            <div>
                                <h3 className="font-semibold text-white mb-2">
                                    Mailing Address
                                </h3>
                                <p className="text-gray-300">
                                    PO Box 123
                                    <br />
                                    Columbia, MO 65201
                                    <br />
                                    United States
                                </p>
                            </div>

                            {/* Social Media */}
                            <div>
                                <h3 className="font-semibold text-white mb-4">
                                    Follow Us
                                </h3>
                                <div className="flex gap-4">
                                    <a
                                        href="#"
                                        className="text-blue-400 hover:text-blue-300 text-lg"
                                        aria-label="Twitter"
                                    >
                                        Twitter
                                    </a>
                                    <a
                                        href="#"
                                        className="text-blue-400 hover:text-blue-300 text-lg"
                                        aria-label="Instagram"
                                    >
                                        Instagram
                                    </a>
                                    <a
                                        href="#"
                                        className="text-blue-400 hover:text-blue-300 text-lg"
                                        aria-label="Facebook"
                                    >
                                        Facebook
                                    </a>
                                </div>
                            </div>

                            {/* Business Hours */}
                            <div>
                                <h3 className="font-semibold text-white mb-2">
                                    Response Time
                                </h3>
                                <p className="text-gray-300">
                                    I typically respond to emails within 1-2
                                    business days. Thank you for reaching out!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="border-2 border-white rounded p-8">
                        <h2 className="text-2xl font-bold mb-8">
                            Send a Message
                        </h2>

                        {submitted && (
                            <div className="bg-green-500 bg-opacity-20 border-2 border-green-500 text-green-200 px-4 py-3 rounded mb-6">
                                <p>
                                    Thank you for your message! I&apos;ll get
                                    back to you soon.
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="w-full">
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your name"
                                    required
                                    className="w-full border-2 border-white rounded px-4 py-2 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
                                />
                            </div>

                            <div className="w-full">
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                    required
                                    className="w-full border-2 border-white rounded px-4 py-2 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
                                />
                            </div>

                            <div className="w-full">
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Message
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Your message here..."
                                    rows={6}
                                    required
                                    className="w-full border-2 border-white rounded px-4 py-2 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full"
                            >
                                Send Message
                            </Button>
                        </form>

                        <p className="text-sm text-gray-400 mt-4">
                            Note: Full email functionality will be implemented
                            in Phase 4. For now, form submissions aren&apos;t
                            sent.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
