import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function HomePage() {
  const t = await getTranslations()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary-600">{t('common.appName')}</div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">{t('nav.features')}</Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">{t('nav.dashboard')}</Link>
            <Link href="#faq" className="text-gray-600 hover:text-gray-900">{t('nav.faq')}</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">{t('nav.login')}</Link>
            <Link href="/signup" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
              {t('nav.signup')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
              {t('landing.hero.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('landing.hero.subtitle')}
            </p>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-green-700 mb-8">
              100% free access right now
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition">
                Start Studying
              </Link>
              <Link href="/login" className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition">
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-gray-50 scroll-mt-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t('landing.features.title')}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('landing.features.written.title')}</h3>
                <p className="text-gray-600">{t('landing.features.written.desc')}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('landing.features.physical.title')}</h3>
                <p className="text-gray-600">{t('landing.features.physical.desc')}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('landing.features.document.title')}</h3>
                <p className="text-gray-600">{t('landing.features.document.desc')}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('landing.features.analytics.title')}</h3>
                <p className="text-gray-600">{t('landing.features.analytics.desc')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Everything is unlocked</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              OLLI Academy(SSC GD) is currently free for all learners. Every major workflow in the app is available without plans, trials, or payment steps.
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="border rounded-xl p-6 bg-white">
                <h3 className="text-xl font-semibold mb-3">Written Prep</h3>
                <p className="text-gray-600 mb-4">Use previous year questions, topic practice, and mock-style flows without a paywall.</p>
                <Link href="/pyqs" className="block text-center border border-primary-600 text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition text-sm font-medium">
                  Open Practice
                </Link>
              </div>
              <div className="border rounded-xl p-6 bg-white">
                <h3 className="text-xl font-semibold mb-3">Physical Training</h3>
                <p className="text-gray-600 mb-4">Access fitness readiness, plans, progress tracking, and mock PET tools freely.</p>
                <Link href="/physical" className="block text-center border border-primary-600 text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition text-sm font-medium">
                  Open Training
                </Link>
              </div>
              <div className="border rounded-xl p-6 bg-white">
                <h3 className="text-xl font-semibold mb-3">Community and Docs</h3>
                <p className="text-gray-600 mb-4">Use discussion features, onboarding, and document-readiness tools without billing blockers.</p>
                <Link href="/dashboard" className="block text-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm font-medium">
                  Open Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 bg-gray-50 scroll-mt-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t('landing.faq.title')}</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              <details className="bg-white rounded-lg p-6 shadow-sm group">
                <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                  {t('landing.faq.sscgd.question')}
                  <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-gray-600">{t('landing.faq.sscgd.answer')}</p>
              </details>
              <details className="bg-white rounded-lg p-6 shadow-sm group">
                <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                  {t('landing.faq.duration.question')}
                  <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-gray-600">{t('landing.faq.duration.answer')}</p>
              </details>
              <details className="bg-white rounded-lg p-6 shadow-sm group">
                <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                  {t('landing.faq.subscription.question')}
                  <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-gray-600">{t('landing.faq.subscription.answer')}</p>
              </details>
              <details className="bg-white rounded-lg p-6 shadow-sm group">
                <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                  {t('landing.faq.physical.question')}
                  <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-gray-600">{t('landing.faq.physical.answer')}</p>
              </details>
              <details className="bg-white rounded-lg p-6 shadow-sm group">
                <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                  {t('landing.faq.hindi.question')}
                  <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-gray-600">{t('landing.faq.hindi.answer')}</p>
              </details>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-primary-600 mb-4">{t('common.appName')}</div>
              <p className="text-gray-600">{t('landing.footer.tagline')}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('landing.footer.platform')}</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/pyqs" className="hover:text-gray-900">{t('landing.footer.studyMaterials')}</Link></li>
                <li><Link href="/pyqs" className="hover:text-gray-900">{t('landing.footer.mockTests')}</Link></li>
                <li><Link href="/physical" className="hover:text-gray-900">{t('landing.footer.physicalTraining')}</Link></li>
                <li><Link href="/dashboard" className="hover:text-gray-900">{t('landing.footer.analytics')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('landing.footer.company')}</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/" className="hover:text-gray-900">{t('landing.footer.aboutUs')}</Link></li>
                <li><Link href="/" className="hover:text-gray-900">{t('landing.footer.contact')}</Link></li>
                <li><Link href="/" className="hover:text-gray-900">{t('landing.footer.privacy')}</Link></li>
                <li><Link href="/" className="hover:text-gray-900">{t('landing.footer.terms')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('landing.footer.connect')}</h4>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition" aria-label="Twitter">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition" aria-label="GitHub">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition" aria-label="Instagram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-gray-500">
            <p>{t('landing.footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
