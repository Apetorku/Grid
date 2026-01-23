import { Metadata } from 'next'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  ogImage?: string
  noIndex?: boolean
  canonical?: string
}

export function generateMetadata({
  title = 'GridNexus - Web Development Marketplace',
  description = 'A comprehensive platform for web development services with escrow protection, automated workflow, and real-time collaboration. Book appointments, get instant quotes, and receive your website securely.',
  keywords = [
    'web development',
    'marketplace',
    'escrow payment',
    'freelance',
    'website development',
    'web design',
    'developer platform',
    'project management',
    'secure payment',
    'real-time collaboration',
    'screen sharing',
    'paystack',
    'Nigeria',
    'African tech',
  ],
  ogImage = '/og-image.png',
  noIndex = false,
  canonical,
}: SEOProps = {}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gridnexus.com'

  return {
    title,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: 'GridNexus Team' }],
    creator: 'GridNexus',
    publisher: 'GridNexus',
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    alternates: {
      canonical: canonical || baseUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: baseUrl,
      siteName: 'GridNexus',
      title,
      description,
      images: [
        {
          url: `${baseUrl}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@gridnexus',
      creator: '@gridnexus',
      title,
      description,
      images: [`${baseUrl}${ogImage}`],
    },
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
    },
    category: 'technology',
  }
}
