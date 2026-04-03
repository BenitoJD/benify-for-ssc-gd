import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default async function HomePage() {
  const t = await getTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* ── Announcement Bar ───────────────────────────────────────── */}
      <div className="bg-[var(--brilliant-green)] text-white text-xs font-bold py-2 text-center tracking-wide">
        🎉 Free access for all SSC GD {currentYear} aspirants —{" "}
        <Link
          href="/signup"
          className="underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          Join now →
        </Link>
      </div>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between max-w-7xl">
          {/* Left Side: Logo & Nav */}
          <div className="flex items-center gap-10">
            <BrandLogo href="/" priority size="md" />

            <nav className="hidden md:flex items-center gap-8 font-bold text-[#4B5563]">
              <Link
                href="#features"
                className="hover:text-black transition-colors"
              >
                {t("nav.features")}
              </Link>
              <Link href="#faq" className="hover:text-black transition-colors">
                {t("nav.faq")}
              </Link>
            </nav>
          </div>

          {/* Right Side: Auth */}
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="hidden sm:block text-sm font-bold text-[#4B5563] hover:text-black transition-colors"
            >
              {t("nav.login")}
            </Link>
            <Link
              href="/signup"
              className="btn-3d btn-3d-green px-6 py-2 rounded-full text-sm"
            >
              {t("nav.signup")}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ───────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36 bg-[var(--bg-page)]">
          {/* Subtle green radial glow top-left */}
          <div
            className="hero-glow w-[600px] h-[600px] top-[-200px] left-[-150px] opacity-40"
            style={{
              background:
                "radial-gradient(circle, rgba(34,197,94,0.18) 0%, transparent 70%)",
            }}
          />
          {/* Subtle blue glow bottom-right */}
          <div
            className="hero-glow w-[500px] h-[500px] bottom-[-180px] right-[-120px] opacity-30"
            style={{
              background:
                "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-14 lg:gap-10">
              {/* Left: Text */}
              <div className="flex-1 max-w-2xl text-center lg:text-left">
                {/* Badge */}
                <div
                  className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
                  style={{
                    background: "rgba(34,197,94,0.10)",
                    border: "1px solid rgba(34,197,94,0.22)",
                    color: "var(--brilliant-green)",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  SSC GD 2025 Prep Platform
                </div>

                <h1
                  className="font-display font-bold mb-6 text-balance tracking-tight leading-[1.08] text-[var(--text-main)]"
                  style={{ fontSize: "clamp(2.8rem, 7vw, 5rem)" }}
                >
                  Learn by <span className="text-gradient">doing</span>.
                </h1>

                <p className="text-lg md:text-xl mb-10 font-medium leading-relaxed text-[var(--text-muted)]">
                  Interactive, bite-sized SSC GD preparation. Master written
                  exams and physical training with guided, hands-on practice.
                </p>

                {/* CTA row */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-10">
                  <Link
                    href="/signup"
                    className="btn-3d btn-3d-green btn-shimmer w-full sm:w-auto px-10 py-4 rounded-full text-base"
                  >
                    Get started — it&apos;s free
                  </Link>
                  <Link
                    href="#features"
                    className="btn-3d btn-3d-white w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm"
                  >
                    See features
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </Link>
                </div>

                {/* Social proof */}
                <div className="flex items-center justify-center lg:justify-start gap-4">
                  <div className="flex -space-x-2.5">
                    {["#3b82f6", "#22c55e", "#a855f7", "#f59e0b"].map(
                      (c, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: c }}
                        >
                          {["A", "B", "C", "D"][i]}
                        </div>
                      ),
                    )}
                  </div>
                  <p className="text-sm font-bold text-[var(--text-muted)]">
                    Joined by{" "}
                    <span className="text-[var(--text-main)]">10,000+</span>{" "}
                    aspirants
                  </p>
                </div>
              </div>

              {/* Right: Glassmorphic score card mockup */}
              <div className="flex-1 w-full max-w-sm lg:max-w-md relative">
                <div className="animate-float rounded-3xl p-6 relative overflow-hidden bg-white border border-[#EAEAEA] shadow-[0_20px_60px_rgba(0,0,0,0.07)]">
                  {/* Card header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs font-bold tracking-widest uppercase text-[var(--text-muted)]">
                        Your Progress
                      </p>
                      <p className="text-lg font-bold mt-0.5 text-[var(--text-main)]">
                        SSC GD Mock #4
                      </p>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{
                        background: "rgba(34,197,94,0.12)",
                        color: "var(--brilliant-green)",
                      }}
                    >
                      Live •
                    </div>
                  </div>

                  {/* Score ring + stats */}
                  <div className="flex items-center gap-6 mb-6">
                    <div className="relative shrink-0">
                      <svg width="90" height="90" viewBox="0 0 90 90">
                        <circle
                          cx="45"
                          cy="45"
                          r="38"
                          fill="none"
                          stroke="#F3F4F6"
                          strokeWidth="8"
                        />
                        <circle
                          cx="45"
                          cy="45"
                          r="38"
                          fill="none"
                          stroke="url(#heroRing)"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray="238.76"
                          strokeDashoffset="57.1"
                          transform="rotate(-90 45 45)"
                        />
                        <defs>
                          <linearGradient
                            id="heroRing"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#22c55e" />
                            <stop offset="100%" stopColor="#4ade80" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-[var(--text-main)]">
                          76%
                        </span>
                        <span className="text-[10px] font-bold text-[var(--text-muted)]">
                          Score
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 flex-1">
                      {[
                        { label: "Correct", val: "38", color: "#22c55e" },
                        { label: "Wrong", val: "12", color: "#f87171" },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm font-bold text-[var(--text-muted)]">
                            {s.label}
                          </span>
                          <div
                            className="flex-1 mx-3 rounded-full overflow-hidden bg-gray-100"
                            style={{ height: "6px" }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: s.label === "Correct" ? "76%" : "24%",
                                background: s.color,
                              }}
                            />
                          </div>
                          <span className="text-sm font-bold text-[var(--text-main)]">
                            {s.val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subject chips */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {[
                      { name: "Math", score: "82%", c: "#3b82f6" },
                      { name: "GK", score: "91%", c: "#22c55e" },
                      { name: "English", score: "68%", c: "#a855f7" },
                      { name: "Reasoning", score: "79%", c: "#f59e0b" },
                    ].map((sub) => (
                      <div
                        key={sub.name}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-50 border border-[#EAEAEA] text-[var(--text-main)]"
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: sub.c }}
                        />
                        {sub.name} · {sub.score}
                      </div>
                    ))}
                  </div>

                  {/* Streak row */}
                  <div className="flex items-center gap-3 pt-4 border-t border-[#EAEAEA]">
                    <span className="text-lg">🔥</span>
                    <div>
                      <p className="text-sm font-bold text-[var(--text-main)]">
                        7-day streak
                      </p>
                      <p className="text-xs font-bold text-[var(--text-muted)]">
                        Keep it going!
                      </p>
                    </div>
                    <Link
                      href="/signup"
                      className="ml-auto btn-3d btn-3d-green btn-shimmer px-4 py-2 rounded-full text-xs"
                    >
                      Continue →
                    </Link>
                  </div>
                </div>

                {/* XP badge */}
                <div
                  className="absolute -top-4 -right-4 px-4 py-2 rounded-2xl text-xs font-bold text-white"
                  style={{
                    background: "var(--brilliant-green)",
                    boxShadow:
                      "0 4px 0 var(--brilliant-green-shadow), 0 8px 20px rgba(34,197,94,0.3)",
                  }}
                >
                  +240 XP today 🎯
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features Grid ───────────────────────────────────────────── */}
        <section id="features" className="py-24 md:py-32 bg-white relative">
          {/* Top wavy separator */}
          <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180 text-[var(--bg-page)]">
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="block w-full h-10"
            >
              <path
                d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Concepts that{" "}
                <span className="text-[var(--brilliant-green)]">click</span>.
              </h2>
              <p className="text-lg text-gray-500 font-medium">
                Bite-sized, interactive lessons make learning SSC GD topics
                effective and fun.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {[
                {
                  title: t("landing.features.written.title"),
                  desc: t("landing.features.written.desc"),
                  img: "https://api.dicebear.com/7.x/shapes/svg?seed=written&backgroundColor=3b82f6",
                },
                {
                  title: t("landing.features.physical.title"),
                  desc: t("landing.features.physical.desc"),
                  img: "https://api.dicebear.com/7.x/shapes/svg?seed=phys&backgroundColor=22c55e",
                },
                {
                  title: t("landing.features.document.title"),
                  desc: t("landing.features.document.desc"),
                  img: "https://api.dicebear.com/7.x/shapes/svg?seed=docs&backgroundColor=ec4899",
                },
                {
                  title: t("landing.features.analytics.title"),
                  desc: t("landing.features.analytics.desc"),
                  img: "https://api.dicebear.com/7.x/shapes/svg?seed=analytics&backgroundColor=f59e0b",
                },
              ].map((feat, i) => (
                <div
                  key={i}
                  className="card-brilliant p-8 flex flex-col items-center text-center"
                >
                  <div className="w-24 h-24 mb-6 rounded-2xl overflow-hidden shadow-sm">
                    <img
                      src={feat.img}
                      alt={feat.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-black">
                    {feat.title}
                  </h3>
                  <p className="font-medium text-gray-500 text-sm leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Unlocked Learning Path ───────────────────────────────────── */}
        <section className="py-24 md:py-32 bg-[var(--bg-page)] relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Everything is unlocked.
              </h2>
              <p className="text-lg text-gray-500 font-medium">
                No paywalls, no trials. The entire SSC GD preparation roadmap is
                available to you.
              </p>
            </div>

            <div className="relative max-w-3xl mx-auto pt-4 pb-10">
              {/* Vertical line connecting path */}
              <div className="absolute top-0 bottom-0 left-1/2 w-1.5 -ml-[3px] bg-gray-200 rounded-full z-0"></div>

              {/* Node 1 */}
              <div className="relative z-10 flex items-center justify-center mb-12">
                <div className="flex-1 text-right pr-8 lg:pr-12">
                  <h3 className="font-bold text-2xl text-black">
                    Written Practice
                  </h3>
                  <p className="font-medium text-gray-500 mt-2">
                    Topic-wise mock tests
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-[var(--bg-page)] bg-white flex items-center justify-center shadow-lg relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-500"></div>
                </div>
                <div className="flex-1 pl-8 lg:pl-12 text-left">
                  <Link
                    href="/pyqs"
                    className="btn-3d btn-3d-white px-5 py-2 rounded-full text-sm"
                  >
                    Open Practice
                  </Link>
                </div>
              </div>

              {/* Node 2 */}
              <div className="relative z-10 flex items-center justify-center mb-12">
                <div className="flex-1 text-right pr-8 lg:pr-12">
                  <Link
                    href="/physical"
                    className="btn-3d btn-3d-white px-5 py-2 rounded-full text-sm"
                  >
                    Open Training
                  </Link>
                </div>
                <div className="w-20 h-20 rounded-full border-4 border-[var(--bg-page)] bg-white flex items-center justify-center shadow-lg relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 pl-8 lg:pl-12 text-left">
                  <h3 className="font-bold text-2xl text-black">
                    Physical Training
                  </h3>
                  <p className="font-medium text-gray-500 mt-2">
                    PST/PET tracking plans
                  </p>
                </div>
              </div>

              {/* Node 3 */}
              <div className="relative z-10 flex items-center justify-center">
                <div className="flex-1 text-right pr-8 lg:pr-12">
                  <h3 className="font-bold text-2xl text-black">
                    Community & Docs
                  </h3>
                  <p className="font-medium text-gray-500 mt-2">
                    Document verification guides
                  </p>
                </div>
                <div className="w-24 h-24 rounded-full border-4 border-[var(--bg-page)] bg-white flex items-center justify-center shadow-lg relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center text-white">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 pl-8 lg:pl-12 text-left">
                  <Link
                    href="/dashboard"
                    className="btn-3d btn-3d-white px-5 py-2 rounded-full text-sm"
                  >
                    Open Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────────── */}
        <section
          id="faq"
          className="py-24 md:py-32 bg-white scroll-mt-10 border-t-2 border-gray-100"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>

            <div className="max-w-3xl mx-auto shadow-sm border-2 border-gray-100 rounded-3xl p-4 sm:p-8">
              {[
                {
                  q: t("landing.faq.sscgd.question"),
                  a: t("landing.faq.sscgd.answer"),
                },
                {
                  q: t("landing.faq.duration.question"),
                  a: t("landing.faq.duration.answer"),
                },
                {
                  q: t("landing.faq.subscription.question"),
                  a: t("landing.faq.subscription.answer"),
                },
                {
                  q: t("landing.faq.physical.question"),
                  a: t("landing.faq.physical.answer"),
                },
              ].map((item, i) => (
                <details
                  key={i}
                  className="group border-b-2 border-gray-100 last:border-b-0"
                >
                  <summary className="flex justify-between items-center py-5 cursor-pointer font-bold text-lg select-none hover:text-green-600 transition-colors">
                    {item.q}
                    <div className="ml-4 flex-shrink-0 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-open:bg-green-50 transition-colors">
                      <svg
                        className="w-5 h-5 text-gray-500 group-open:text-green-600 transform transition-transform duration-300 group-open:rotate-45"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                  </summary>
                  <p className="pb-6 pr-12 text-gray-500 font-medium leading-relaxed">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-[var(--bg-page)] border-t-2 border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <div className="col-span-2 md:col-span-1">
              <BrandLogo href="/" size="md" className="mb-4" />
              <p className="text-gray-500 font-bold mb-6">
                {t("landing.footer.tagline")}
              </p>
              <div className="flex gap-4">
                {/* Social placeholders */}
                <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-gray-400 cursor-pointer transition-colors">
                  F
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-gray-400 cursor-pointer transition-colors">
                  T
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-gray-400 cursor-pointer transition-colors">
                  I
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-6">
                {t("landing.footer.platform")}
              </h4>
              <ul className="space-y-4 font-bold text-gray-600">
                <li>
                  <Link
                    href="/pyqs"
                    className="hover:text-black transition-colors"
                  >
                    {t("landing.footer.studyMaterials")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pyqs"
                    className="hover:text-black transition-colors"
                  >
                    {t("landing.footer.mockTests")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/physical"
                    className="hover:text-black transition-colors"
                  >
                    {t("landing.footer.physicalTraining")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-black transition-colors"
                  >
                    {t("landing.footer.analytics")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-6">
                {t("landing.footer.company")}
              </h4>
              <ul className="space-y-4 font-bold text-gray-600">
                <li>
                  <Link href="/about" className="hover:text-black transition-colors">
                    {t("landing.footer.aboutUs")}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-black transition-colors">
                    {t("landing.footer.contact")}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-black transition-colors">
                    {t("landing.footer.privacy")}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-black transition-colors">
                    {t("landing.footer.terms")}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <div className="card-brilliant p-6 bg-white border-none shadow-none ring-2 ring-gray-100">
                <h4 className="font-bold text-black mb-2">Ready to start?</h4>
                <p className="text-sm font-medium text-gray-500 mb-4">
                  Join 10,000+ top aspirants.
                </p>
                <Link
                  href="/signup"
                  className="btn-3d btn-3d-green w-full px-5 py-2 rounded-full text-sm text-center block"
                >
                  Sign up free
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t-2 border-gray-200 text-center font-bold text-gray-400 text-sm">
            <p>{t("landing.footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
