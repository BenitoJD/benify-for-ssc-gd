import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3101'

// Static pages that don't require authentication
const staticPages = [
  { url: '', priority: 1.0, changeFrequency: 'weekly' as const },
  { url: '/faq', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/login', priority: 0.6, changeFrequency: 'monthly' as const },
]

// Protected pages (still indexable but require auth to access fully)
const protectedPages = [
  { url: '/dashboard', priority: 0.9, changeFrequency: 'daily' as const },
  { url: '/study', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/study/syllabus', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/tests', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/pyqs', priority: 0.7, changeFrequency: 'weekly' as const },
  { url: '/analytics', priority: 0.7, changeFrequency: 'weekly' as const },
  { url: '/study-plan', priority: 0.7, changeFrequency: 'weekly' as const },
  { url: '/physical', priority: 0.7, changeFrequency: 'weekly' as const },
  { url: '/documents', priority: 0.6, changeFrequency: 'weekly' as const },
  { url: '/community', priority: 0.6, changeFrequency: 'daily' as const },
  { url: '/notifications', priority: 0.5, changeFrequency: 'weekly' as const },
  { url: '/profile', priority: 0.5, changeFrequency: 'monthly' as const },
  { url: '/onboarding', priority: 0.6, changeFrequency: 'monthly' as const },
]

// Admin pages (noindex as they're internal)
const adminPages = [
  { url: '/admin', priority: 0.4, changeFrequency: 'daily' as const },
  { url: '/admin/users', priority: 0.4, changeFrequency: 'daily' as const },
  { url: '/admin/content', priority: 0.4, changeFrequency: 'weekly' as const },
  { url: '/admin/physical', priority: 0.4, changeFrequency: 'weekly' as const },
  { url: '/admin/documents', priority: 0.4, changeFrequency: 'weekly' as const },
  { url: '/admin/analytics', priority: 0.4, changeFrequency: 'daily' as const },
  { url: '/admin/announcements', priority: 0.4, changeFrequency: 'weekly' as const },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const allPages = [...staticPages, ...protectedPages, ...adminPages]

  return allPages.map((page) => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))
}
