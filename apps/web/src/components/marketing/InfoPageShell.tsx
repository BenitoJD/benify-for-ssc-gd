import Link from 'next/link'
import { ReactNode } from 'react'
import { BrandLogo } from '@/components/ui/BrandLogo'

interface InfoPageShellProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}

export function InfoPageShell({
  eyebrow,
  title,
  description,
  children,
}: InfoPageShellProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <BrandLogo href="/" priority size="md" />
          <nav className="flex items-center gap-6 text-sm font-bold text-[var(--text-muted)]">
            <Link href="/" className="transition-colors hover:text-black">
              Home
            </Link>
            <Link href="/signup" className="transition-colors hover:text-black">
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <section className="mb-8 rounded-[2rem] border border-white/70 bg-gradient-to-br from-[var(--brilliant-yellow-soft)] via-white to-[var(--brilliant-blue-soft)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-12">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[var(--text-muted)]">
            {eyebrow}
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-black tracking-tight text-[var(--text-main)] md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base font-medium leading-8 text-[var(--text-muted)] md:text-lg">
            {description}
          </p>
        </section>

        <section className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] ring-1 ring-black/5 md:p-10">
          <div className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-[var(--text-main)] prose-p:text-[var(--text-muted)] prose-p:leading-8 prose-li:text-[var(--text-muted)]">
            {children}
          </div>
        </section>
      </main>
    </div>
  )
}
