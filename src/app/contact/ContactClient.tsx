'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { siteConfig } from '@/config/site';
import { useState } from 'react';
import { z } from 'zod';
import { SocialMediaIcon } from '@/components/ui/SocialMediaIcon';

// Form validation schema
const contactFormSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name must be less than 100 characters'),
    email: z.string().email('Please enter a valid email address'),
    message: z
        .string()
        .min(10, 'Message must be at least 10 characters')
        .max(5000, 'Message must be less than 5000 characters'),
});

/**
 * Contact page - Meet The Artist
 *
 * Features:
 * - Black background with white text
 * - Artist image and bio (left side)
 * - Contact information (right side)
 * - Contact form placeholder for Phase 4
 * - Social media links (marked as "not yet configured")
 * - Responsive design
 */

type FormErrors = Partial<Record<keyof typeof contactFormSchema.shape, string>>;

export default function ContactClient() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error for this field when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form data
        const result = contactFormSchema.safeParse(formData);

        if (!result.success) {
            // Convert Zod errors to a simpler format
            const newErrors: FormErrors = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0];
                if (typeof path === 'string') {
                    newErrors[path as keyof FormErrors] = issue.message;
                }
            });
            setErrors(newErrors);
            return;
        }

        // Form functionality will be implemented in Phase 4
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', message: '' });
            setErrors({});
        }, 3000);
    };

    return (
        <div className="bg-black text-white">
            {/* Artist Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-5xl font-bold text-center mb-12">
                    Meet The Artist: {siteConfig.artist.name}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
                    {/* Artist Image */}
                    <div className="relative w-full aspect-square rounded overflow-hidden border-4 border-white">
                        <Image
                            src="/images/pages/meet-the-artist.webp"
                            alt="The Artist"
                            fill
                            priority
                            className="object-cover"
                        />
                    </div>

                    {/* Artist Bio */}
                    <div>
                        <p className="text-lg text-gray-300 mb-4">
                            {siteConfig.artist.bio}
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
                                    href={`mailto:${siteConfig.artist.email}`}
                                    className="text-blue-400 hover:text-blue-300 text-lg"
                                >
                                    {siteConfig.artist.email}
                                </a>
                            </div>

                            {/* Mailing Address */}
                            <div>
                                <h3 className="font-semibold text-white mb-2">
                                    Mailing Address
                                </h3>
                                <p className="text-gray-300">
                                    {siteConfig.artist.mailingAddress.poBox}
                                    <br />
                                    {
                                        siteConfig.artist.mailingAddress.city
                                    }, {siteConfig.artist.mailingAddress.state}{' '}
                                    {siteConfig.artist.mailingAddress.zip}
                                    <br />
                                    {siteConfig.artist.mailingAddress.country}
                                </p>
                            </div>

                            {/* Social Media */}
                            <div>
                                <h3 className="font-semibold text-white mb-4">
                                    Follow Us
                                </h3>
                                <div className="space-y-2">
                                    {siteConfig.socialMedia.sites.map(
                                        (site) => (
                                            <SocialMediaIcon
                                                key={site.href}
                                                title={site.title}
                                                handle={site.handle}
                                                href={site.href}
                                                variant="light"
                                            />
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Response Time */}
                            <div>
                                <h3 className="font-semibold text-white mb-2">
                                    Response Time
                                </h3>
                                <p className="text-gray-300">
                                    {siteConfig.artist.responseTime}
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
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-semibold text-white mb-2"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your name"
                                    required
                                    className={`w-full border-2 rounded px-4 py-2 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-white focus:ring-white'}`}
                                    aria-invalid={!!errors.name}
                                    aria-describedby={
                                        errors.name ? 'name-error' : undefined
                                    }
                                />
                                {errors.name && (
                                    <p
                                        id="name-error"
                                        className="text-red-400 text-sm mt-1"
                                    >
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="w-full">
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-semibold text-white mb-2"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                    required
                                    className={`w-full border-2 rounded px-4 py-2 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-white focus:ring-white'}`}
                                    aria-invalid={!!errors.email}
                                    aria-describedby={
                                        errors.email ? 'email-error' : undefined
                                    }
                                />
                                {errors.email && (
                                    <p
                                        id="email-error"
                                        className="text-red-400 text-sm mt-1"
                                    >
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="w-full">
                                <label
                                    htmlFor="message"
                                    className="block text-sm font-semibold text-white mb-2"
                                >
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Your message here..."
                                    rows={6}
                                    required
                                    className={`w-full border-2 rounded px-4 py-2 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${errors.message ? 'border-red-500 focus:ring-red-500' : 'border-white focus:ring-white'}`}
                                    aria-invalid={!!errors.message}
                                    aria-describedby={
                                        errors.message
                                            ? 'message-error'
                                            : undefined
                                    }
                                />
                                {errors.message && (
                                    <p
                                        id="message-error"
                                        className="text-red-400 text-sm mt-1"
                                    >
                                        {errors.message}
                                    </p>
                                )}
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
