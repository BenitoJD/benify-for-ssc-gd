import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

const inter = Inter({ subsets: ['latin'] })

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3101'

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
      name: 'Is Benify for SSC GD free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Benify for SSC GD is currently free to use, including study materials, practice flows, physical training tools, community features, and document-readiness support.'
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
      name: 'What language is Benify for SSC GD currently focused on?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Benify for SSC GD is currently focused on English-only product flows while the core study and preparation experience is being refined.'
      }
    }
  ]
}

// Course structured data
const courseStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'SSC GD Complete Preparation',
  description: 'Comprehensive SSC GD exam preparation including written exam study materials, mock tests, physical training plans, and document readiness tracking with free access to the full platform.',
  provider: {
    '@type': 'Organization',
    name: 'Benify for SSC GD',
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
  name: 'Benify for SSC GD',
  url: BASE_URL,
  logo: `${BASE_URL}/benify-for-ssc-gd-logo.png`,
  description: 'Your complete SSC GD preparation companion with comprehensive study materials, mock tests, and physical training tracking.',
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: ['en']
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  icons: {
    icon: '/benify-for-ssc-gd-logo.png',
    shortcut: '/benify-for-ssc-gd-logo.png',
    apple: '/benify-for-ssc-gd-logo.png',
  },
  title: {
    default: 'Benify for SSC GD - Complete Preparation | Study Materials, Mock Tests & Physical Training',
    template: '%s | Benify for SSC GD',
    absolute: 'Benify for SSC GD - Complete Preparation | Ace Your Exam'
  },
  description: 'Prepare for SSC GD exam with Benify for SSC GD - Access comprehensive study materials, mock tests, PST/PET training plans, and document readiness tracking with full free access.',
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
  authors: [{ name: 'Benify for SSC GD', url: BASE_URL }],
  creator: 'Benify for SSC GD',
  publisher: 'Benify for SSC GD',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BASE_URL,
    siteName: 'Benify for SSC GD',
    title: 'Benify for SSC GD - Complete Preparation | Study Materials, Mock Tests & Physical Training',
    description: 'Prepare for SSC GD exam with Benify for SSC GD - Access comprehensive study materials, mock tests, PST/PET training plans, and document readiness tracking with full free access.',
    images: [
      {
        url: '/benify-for-ssc-gd-logo.png',
        width: 640,
        height: 640,
        alt: 'Benify for SSC GD - SSC GD Complete Preparation Platform',
        type: 'image/jpeg'
      },
      {
        url: '/benify-for-ssc-gd-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Benify for SSC GD - Prepare for SSC GD with guided support',
        type: 'image/jpeg'
      }
    ],
    videos: [
      {
        url: `${BASE_URL}/benify-for-ssc-gd-demo.mp4`,
        width: 1280,
        height: 720
      }
    ]
  },
  twitter: {
    card: 'summary',
    title: 'Benify for SSC GD - SSC GD Complete Preparation',
    description: 'Prepare for SSC GD exam with comprehensive study materials, mock tests, and physical training.',
    images: ['/benify-for-ssc-gd-logo.png'],
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
      'en': BASE_URL,
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
