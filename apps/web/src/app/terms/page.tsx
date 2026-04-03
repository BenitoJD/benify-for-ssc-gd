import { InfoPageShell } from '@/components/marketing/InfoPageShell'

export default function TermsPage() {
  return (
    <InfoPageShell
      eyebrow="Terms of Service"
      title="Basic terms for using Benify for SSC GD."
      description="These terms provide a straightforward overview of expected platform use, account responsibility, and service limitations."
    >
      <h2>Using the platform</h2>
      <p>
        Benify for SSC GD is provided to help aspirants prepare for the SSC GD
        exam. You agree to use the platform lawfully and in a way that does not
        disrupt service for other users.
      </p>

      <h2>Account responsibility</h2>
      <p>
        You are responsible for the accuracy of the information you provide and
        for maintaining the confidentiality of your login credentials.
      </p>

      <h2>Content and availability</h2>
      <p>
        We work to keep content accurate and the service available, but we do
        not guarantee uninterrupted access or that all content will always be
        complete, current, or error-free.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not misuse the platform, scrape it abusively, or attempt unauthorized access.</li>
        <li>Do not upload or share unlawful, harmful, or infringing content.</li>
        <li>Do not interfere with platform performance, security, or other users.</li>
      </ul>

      <h2>Contact</h2>
      <p>
        For questions about these terms, email <a href="mailto:legal@benify.in">legal@benify.in</a>.
      </p>
    </InfoPageShell>
  )
}
