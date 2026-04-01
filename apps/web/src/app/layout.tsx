import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

const inter = Inter({ subsets: ['latin'] })

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://benify.app'

// FAQ structured data for JSON-LD
const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is SSC GD?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SSC GD (Staff Selection Commission - General Duty) is a competitive exam conducted by SSC for recruitment of Constables in various forces like BSF, CRPF, CISF, ITBP, etc.'
      }
    },
    {
      '@type': 'Question',
      name: 'How long is the SSC GD exam preparation?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most candidates prepare for 6-12 months. Our platform provides structured study plans that adapt to your timeline and help you cover the entire syllabus efficiently.'
      }
    },
    {
      '@type': 'Question',
      name: 'What does the subscription include?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Premium subscriptions include unlimited mock tests, all study materials, AI-powered recommendations, physical training plans, document checklists, and priority support.'
      }
    },
    {
      '@type': 'Question',
      name: 'Can I track my physical training progress?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Our platform includes comprehensive PST/PET training plans with progress tracking for running, long jump, high jump, and more with charts showing your improvement over time.'
      }
    },
    {
      '@type': 'Question',
      name: 'Is the content available in Hindi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, we support both English and Hindi languages. You can switch between languages anytime from your profile settings.'
      }
    }
  ]
}

// Course structured data
const courseStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'SSC GD Complete Preparation',
  description: 'Comprehensive SSC GD exam preparation including written exam study materials, mock tests, physical training plans, and document readiness tracking.',
  provider: {
    '@type': 'Organization',
    name: 'Benify',
    url: BASE_URL
  },
  hasCourseInstance: [
    {
      '@type': 'CourseInstance',
      name: 'SSC GD Written Exam Prep',
      courseMode: 'online',
      courseWorkload: 'PT20H'
    },
    {
      '@type': 'CourseInstance',
      name: 'SSC GD Physical Training',
      courseMode: 'online',
      courseWorkload: 'PT10H'
    }
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250'
  }
}

// Organization structured data
const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Benify',
  url: BASE_URL,
  logo: `${BASE_URL}/benify_logo.png`,
  description: 'Your complete SSC GD preparation companion with AI-powered guidance, comprehensive study materials, mock tests, and physical training tracking.',
  sameAs: [
    'https://twitter.com/benifyapp',
    'https://github.com/benifyapp',
    'https://instagram.com/benifyapp'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: ['en', 'hi']
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Benify - SSC GD Complete Preparation | Study Materials, Mock Tests & Physical Training',
    template: '%s | Benify - SSC GD Preparation',
    absolute: 'Benify - SSC GD Complete Preparation | Ace Your Exam'
  },
  description: 'Prepare for SSC GD exam with Benify - Access comprehensive study materials, unlimited mock tests, AI-powered recommendations, PST/PET training plans, and document readiness tracking. Start your free trial today!',
  keywords: [
    'SSC GD preparation',
    'SSC GD study material',
    'SSC GD mock tests',
    'SSC GD online course',
    'SSC GD physical training',
    'SSC GD PST PET',
    'SSC GD previous year questions',
    'SSC GD practice tests',
    'SSC GD exam preparation',
    'SSC GD syllabus',
    'SSC GD result',
    'SSC GD admit card',
    'SSC GD document checklist',
    'SSC GD physical test',
    'SSC GD Hindi medium',
    'SSC GD English medium',
    'SSC GD study plan',
    'SSC GD analytics',
    'SSC GD preparation app',
    'SSC GD online preparation',
    'SSC GD practice app'
  ],
  authors: [{ name: 'Benify', url: BASE_URL }],
  creator: 'Benify',
  publisher: 'Benify',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    alternateLocale: ['hi_IN'],
    url: BASE_URL,
    siteName: 'Benify - SSC GD Preparation',
    title: 'Benify - SSC GD Complete Preparation | Study Materials, Mock Tests & Physical Training',
    description: 'Prepare for SSC GD exam with Benify - Access comprehensive study materials, unlimited mock tests, AI-powered recommendations, PST/PET training plans, and document readiness tracking.',
    images: [
      {
        url: '/benify_logo.png',
        width: 800,
        height: 600,
        alt: 'Benify - SSC GD Complete Preparation Platform',
        type: 'image/png'
      },
      {
        url: '/benify_og_image.jpg',
        width: 1200,
        height: 630,
        alt: 'Benify - Prepare for SSC GD with AI-powered guidance',
        type: 'image/jpeg'
      }
    ],
    videos: [
      {
        url: `${BASE_URL}/benify_demo.mp4`,
        width: 1280,
        height: 720
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Benify - SSC GD Complete Preparation',
    description: 'Prepare for SSC GD exam with comprehensive study materials, mock tests, AI recommendations & physical training.',
    images: ['/benify_logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',
    yandex: 'YOUR_YANDEX_VERIFICATION_CODE',
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      'en': `${BASE_URL}/en`,
      'hi': `${BASE_URL}/hi`,
    },
    types: {
      'application/rss+xml': `${BASE_URL}/rss.xml`,
    }
  },
  category: 'Education',
}

// JSON-LD structured data for the entire site
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationStructuredData,
    courseStructuredData,
    faqStructuredData
  ]
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const messages = await getMessages()

  return (
    <html lang="en">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
