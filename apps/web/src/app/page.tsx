import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { BrandLogo } from '@/components/ui/BrandLogo'

export default async function HomePage() {
  const t = await getTranslations()

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAFAFA] text-[#111827]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#EAEAEA]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <BrandLogo href="/" priority size="md" />
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors">{t('nav.features')}</Link>
            <Link href="/dashboard" className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors">{t('nav.dashboard')}</Link>
            <Link href="#faq" className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors">{t('nav.faq')}</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors hidden sm:block">{t('nav.login')}</Link>
            <Link href="/signup" className="bg-[#111827] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-gray-900 shadow-sm">
              {t('nav.signup')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance tracking-tight text-[#111827]">
              {t('landing.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-[#6B7280] mb-10 max-w-2xl mx-auto font-medium">
              {t('landing.hero.subtitle')}
            </p>
            <div className="mb-10">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold uppercase tracking-wider border border-green-200">
                100% free access right now
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup" className="w-full sm:w-auto bg-[#111827] text-white px-8 py-3.5 rounded-[10px] text-base font-medium hover:bg-black transition-all focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-sm">
                Start Studying
              </Link>
              <Link href="/login" className="w-full sm:w-auto bg-white border border-[#EAEAEA] text-[#111827] px-8 py-3.5 rounded-[10px] text-base font-medium hover:bg-[#F9FAFB] hover:border-gray-300 transition-all shadow-sm">
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28 bg-white border-y border-[#EAEAEA] scroll-mt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#111827]">{t('landing.features.title')}</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              <div className="bg-[#FAFAFA] border border-[#EAEAEA] p-8 rounded-[16px] hover:border-gray-300 transition-colors group">
                <div className="w-10 h-10 bg-white border border-[#EAEAEA] rounded-[10px] flex items-center justify-center mb-6 text-[#111827] group-hover:shadow-sm transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[#111827] tracking-tight">{t('landing.features.written.title')}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{t('landing.features.written.desc')}</p>
              </div>
              <div className="bg-[#FAFAFA] border border-[#EAEAEA] p-8 rounded-[16px] hover:border-gray-300 transition-colors group">
                <div className="w-10 h-10 bg-white border border-[#EAEAEA] rounded-[10px] flex items-center justify-center mb-6 text-[#111827] group-hover:shadow-sm transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[#111827] tracking-tight">{t('landing.features.physical.title')}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{t('landing.features.physical.desc')}</p>
              </div>
              <div className="bg-[#FAFAFA] border border-[#EAEAEA] p-8 rounded-[16px] hover:border-gray-300 transition-colors group">
                <div className="w-10 h-10 bg-white border border-[#EAEAEA] rounded-[10px] flex items-center justify-center mb-6 text-[#111827] group-hover:shadow-sm transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[#111827] tracking-tight">{t('landing.features.document.title')}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{t('landing.features.document.desc')}</p>
              </div>
              <div className="bg-[#FAFAFA] border border-[#EAEAEA] p-8 rounded-[16px] hover:border-gray-300 transition-colors group">
                <div className="w-10 h-10 bg-white border border-[#EAEAEA] rounded-[10px] flex items-center justify-center mb-6 text-[#111827] group-hover:shadow-sm transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[#111827] tracking-tight">{t('landing.features.analytics.title')}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{t('landing.features.analytics.desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Unlocked Section */}
        <section className="py-20 md:py-28 bg-[#FAFAFA]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#111827] mb-4">Everything is unlocked</h2>
              <p className="text-base text-[#6B7280]">
                OLLI Academy(SSC GD) is currently free for all learners. Every major workflow in the app is available without plans, trials, or payment steps.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-white border border-[#EAEAEA] rounded-[16px] p-8 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold mb-3 text-[#111827] tracking-tight">Written Prep</h3>
                <p className="text-[#6B7280] text-sm mb-8 leading-relaxed">Use previous year questions, topic practice, and mock-style flows without a paywall.</p>
                <Link href="/pyqs" className="mt-auto block text-center bg-white border border-[#EAEAEA] text-[#111827] px-4 py-2.5 rounded-[8px] hover:bg-[#F9FAFB] hover:border-gray-300 transition-colors text-sm font-medium">
                  Open Practice
                </Link>
              </div>
              <div className="bg-white border border-[#EAEAEA] rounded-[16px] p-8 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold mb-3 text-[#111827] tracking-tight">Physical Training</h3>
                <p className="text-[#6B7280] text-sm mb-8 leading-relaxed">Access fitness readiness, plans, progress tracking, and mock PET tools freely.</p>
                <Link href="/physical" className="mt-auto block text-center bg-white border border-[#EAEAEA] text-[#111827] px-4 py-2.5 rounded-[8px] hover:bg-[#F9FAFB] hover:border-gray-300 transition-colors text-sm font-medium">
                  Open Training
                </Link>
              </div>
              <div className="bg-white border border-[#EAEAEA] rounded-[16px] p-8 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold mb-3 text-[#111827] tracking-tight">Community & Docs</h3>
                <p className="text-[#6B7280] text-sm mb-8 leading-relaxed">Use discussion features, onboarding, and document-readiness tools without billing blockers.</p>
                <Link href="/dashboard" className="mt-auto block text-center bg-[#111827] text-white border border-[#111827] px-4 py-2.5 rounded-[8px] hover:bg-black transition-colors text-sm font-medium">
                  Open Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 md:py-28 bg-white border-t border-[#EAEAEA] scroll-mt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12 text-[#111827] tracking-tight">{t('landing.faq.title')}</h2>
            <div className="max-w-3xl mx-auto divide-y divide-[#EAEAEA] border-y border-[#EAEAEA]">
              <details className="group py-5 marker:content-['']">
                <summary className="font-medium cursor-pointer list-none flex justify-between items-center text-[#111827] hover:text-[#6B7280] transition-colors pr-1">
                  {t('landing.faq.sscgd.question')}
                  <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform flex-shrink-0 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-[#6B7280] text-sm leading-relaxed pr-8">{t('landing.faq.sscgd.answer')}</p>
              </details>
              <details className="group py-5 marker:content-['']">
                <summary className="font-medium cursor-pointer list-none flex justify-between items-center text-[#111827] hover:text-[#6B7280] transition-colors pr-1">
                  {t('landing.faq.duration.question')}
                  <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform flex-shrink-0 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-[#6B7280] text-sm leading-relaxed pr-8">{t('landing.faq.duration.answer')}</p>
              </details>
              <details className="group py-5 marker:content-['']">
                <summary className="font-medium cursor-pointer list-none flex justify-between items-center text-[#111827] hover:text-[#6B7280] transition-colors pr-1">
                  {t('landing.faq.subscription.question')}
                  <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform flex-shrink-0 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-[#6B7280] text-sm leading-relaxed pr-8">{t('landing.faq.subscription.answer')}</p>
              </details>
              <details className="group py-5 marker:content-['']">
                <summary className="font-medium cursor-pointer list-none flex justify-between items-center text-[#111827] hover:text-[#6B7280] transition-colors pr-1">
                  {t('landing.faq.physical.question')}
                  <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform flex-shrink-0 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-[#6B7280] text-sm leading-relaxed pr-8">{t('landing.faq.physical.answer')}</p>
              </details>
              <details className="group py-5 marker:content-['']">
                <summary className="font-medium cursor-pointer list-none flex justify-between items-center text-[#111827] hover:text-[#6B7280] transition-colors pr-1">
                  {t('landing.faq.hindi.question')}
                  <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform flex-shrink-0 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-[#6B7280] text-sm leading-relaxed pr-8">{t('landing.faq.hindi.answer')}</p>
              </details>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#EAEAEA]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <BrandLogo href="/" size="md" className="mb-4" />
              <p className="text-[#6B7280] text-sm leading-relaxed pr-4">{t('landing.footer.tagline')}</p>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-[#111827] text-sm tracking-tight">{t('landing.footer.platform')}</h4>
              <ul className="space-y-3 text-sm text-[#6B7280]">
                <li><Link href="/pyqs" className="hover:text-[#111827] transition-colors">{t('landing.footer.studyMaterials')}</Link></li>
                <li><Link href="/pyqs" className="hover:text-[#111827] transition-colors">{t('landing.footer.mockTests')}</Link></li>
                <li><Link href="/physical" className="hover:text-[#111827] transition-colors">{t('landing.footer.physicalTraining')}</Link></li>
                <li><Link href="/dashboard" className="hover:text-[#111827] transition-colors">{t('landing.footer.analytics')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-[#111827] text-sm tracking-tight">{t('landing.footer.company')}</h4>
              <ul className="space-y-3 text-sm text-[#6B7280]">
                <li><Link href="/" className="hover:text-[#111827] transition-colors">{t('landing.footer.aboutUs')}</Link></li>
                <li><Link href="/" className="hover:text-[#111827] transition-colors">{t('landing.footer.contact')}</Link></li>
                <li><Link href="/" className="hover:text-[#111827] transition-colors">{t('landing.footer.privacy')}</Link></li>
                <li><Link href="/" className="hover:text-[#111827] transition-colors">{t('landing.footer.terms')}</Link></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-medium mb-4 text-[#111827] text-sm tracking-tight">{t('landing.footer.connect')}</h4>
              <p className="text-sm text-[#6B7280]">
                Social channels will be added once the official profiles are ready.
              </p>
            </div>
          </div>
          <div className="border-t border-[#EAEAEA] mt-12 pt-8 text-center text-xs text-[#6B7280]">
            <p>{t('landing.footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
