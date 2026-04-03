import { InfoPageShell } from '@/components/marketing/InfoPageShell'

export default function PrivacyPage() {
  return (
    <InfoPageShell
      eyebrow="Privacy Policy"
      title="Your privacy matters."
      description="This page explains, at a high level, what information OLLI for SSC GD collects, why it is used, and how users can contact us about privacy concerns."
    >
      <h2>Information we collect</h2>
      <p>
        We may collect account details such as your name, email address,
        profile inputs, study preferences, preparation progress, and product
        activity needed to operate the platform.
      </p>

      <h2>How we use information</h2>
      <ul>
        <li>To create and manage your account.</li>
        <li>To personalize study plans and preparation flows.</li>
        <li>To improve reliability, analytics, and product performance.</li>
        <li>To communicate important updates, reminders, and support messages.</li>
      </ul>

      <h2>Data sharing</h2>
      <p>
        We do not sell personal information. Data may be processed by trusted
        infrastructure and service providers required to operate the product,
        subject to appropriate safeguards.
      </p>

      <h2>Your choices</h2>
      <p>
        You can contact us to request updates or deletion of account-related
        information, subject to applicable legal and operational requirements.
      </p>

      <h2>Questions</h2>
      <p>
        For privacy questions, contact <a href="mailto:privacy@olli.in">privacy@olli.in</a>.
      </p>
    </InfoPageShell>
  )
}
