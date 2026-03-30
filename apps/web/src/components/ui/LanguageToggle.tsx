'use client'

import { useTransition, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'

export function LanguageToggle() {
  const [isPending, startTransition] = useTransition()
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [currentLocale, setCurrentLocale] = useState(locale)

  function toggleLocale(newLocale: string) {
    setCurrentLocale(newLocale)
    startTransition(() => {
      // Set cookie for server-side rendering
      document.cookie = `locale=${newLocale};path=/;max-age=31536000`
      // Trigger a soft navigation to refresh the locale
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => toggleLocale('en')}
        disabled={isPending}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          currentLocale === 'en'
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => toggleLocale('hi')}
        disabled={isPending}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          currentLocale === 'hi'
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        aria-label="Switch to Hindi"
      >
        हिं
      </button>
    </div>
  )
}
