import Link from 'next/link'
import { InfoPageShell } from '@/components/marketing/InfoPageShell'

export default function AboutPage() {
  return (
    <InfoPageShell
      eyebrow="About Benify"
      title="Benify for SSC GD helps aspirants prepare with clarity, structure, and consistency."
      description="We are building a focused preparation platform for SSC GD candidates who want one place for study, practice, physical readiness, and exam support."
    >
      <h2>What we are building</h2>
      <p>
        Benify for SSC GD brings together written exam preparation, practice
        sessions, previous year questions, dashboards, physical training
        tracking, and document-readiness guidance in one product flow.
      </p>

      <h2>Why this exists</h2>
      <p>
        SSC GD preparation is usually fragmented across notes, videos, test
        series, messaging groups, and offline reminders. We want to reduce that
        fragmentation and make progress easier to track every day.
      </p>

      <h2>What matters to us</h2>
      <ul>
        <li>Simple product flows that reduce friction for serious aspirants.</li>
        <li>Accessible preparation tools without unnecessary gating.</li>
        <li>Practical support for both written and physical preparation.</li>
        <li>Clear progress tracking so learners know what to do next.</li>
      </ul>

      <p>
        Want to start preparing? <Link href="/signup">Create your account</Link>.
      </p>
    </InfoPageShell>
  )
}
