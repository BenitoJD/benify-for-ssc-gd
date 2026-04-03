import Link from 'next/link'
import { InfoPageShell } from '@/components/marketing/InfoPageShell'

export default function ContactPage() {
  return (
    <InfoPageShell
      eyebrow="Contact"
      title="Get in touch with the Benify for SSC GD team."
      description="Use this page for product questions, support requests, partnership conversations, or feedback about the preparation experience."
    >
      <h2>Support</h2>
      <p>
        For account access, onboarding issues, broken pages, or general support,
        email <a href="mailto:benito.josede@gmail.com">benito.josede@gmail.com</a>.
      </p>

      <h2>Feedback</h2>
      <p>
        If you have suggestions for mock tests, study plans, physical modules,
        or dashboard improvements, send them to{' '}
        <a href="mailto:benito.josede@gmail.com">benito.josede@gmail.com</a>.
      </p>

      <h2>Business and partnerships</h2>
      <p>
        For collaborations, content partnerships, or operational inquiries,
        contact <a href="mailto:benito.josede@gmail.com">benito.josede@gmail.com</a>.
      </p>

      <h2>Phone</h2>
      <p>
        You can also reach us on <a href="tel:+918870764795">+91 8870764795</a>.
      </p>

      <h2>Before you write</h2>
      <ul>
        <li>Include the email address tied to your account if support is needed.</li>
        <li>Share screenshots or exact page URLs for bug reports.</li>
        <li>Describe the issue and the expected outcome as clearly as possible.</li>
      </ul>

      <p>
        New here? <Link href="/signup">Join Benify for SSC GD</Link>.
      </p>
    </InfoPageShell>
  )
}
