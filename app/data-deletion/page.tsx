export const metadata = {
  title: "Data Deletion Instructions | Antistatic",
  description: "How to request deletion of your personal data from Antistatic",
};

export default function DataDeletion() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Data Deletion Instructions</h1>
        <p className="text-gray-600 mb-8">Effective date: January 10, 2026</p>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-8">
            Antistatic provides an email-based process to request deletion of personal data and connected platform data.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How to request deletion</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Send an email to: <a href="mailto:hello@sagentics.ai" className="text-blue-600 hover:underline">hello@sagentics.ai</a>
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>Subject:</strong> "Data Deletion Request – Antistatic"
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              Please include:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>The email address used for your Antistatic account</li>
              <li>Your business name</li>
              <li>Any connected platform accounts you want removed (e.g., Instagram/Facebook/WhatsApp)</li>
              <li>Optional: a description of what you want deleted (account only, integrations only, all data)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">What we delete</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Upon verification, we will delete or permanently de-identify from our active systems:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Your Antistatic account profile information</li>
              <li>Stored Customer Data associated with your account (contacts/leads you uploaded)</li>
              <li>Messaging history stored in Antistatic (subject to the retention policy below)</li>
              <li>Connected platform tokens and integration data (Instagram/Facebook tokens are deleted immediately upon disconnect; deletion requests remove any remaining stored data)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Retention notes</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Message content logs</strong> are retained for <strong>up to 60 days</strong> and then removed, unless you request earlier deletion (where feasible) or we must retain data for legal/security reasons.</li>
              <li>Backup data may persist briefly until backups cycle out, after which deleted data is no longer recoverable from active systems.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Identity verification</h2>
            <p className="text-gray-700 leading-relaxed">
              To protect your account, we may request verification before deleting data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Confirmation</h2>
            <p className="text-gray-700 leading-relaxed">
              We will confirm once deletion has been completed.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

