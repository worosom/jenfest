import { ArrowLeft, FileText } from "lucide-react";

const TermsOfService = ({ onBack }) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-clay)] transition-colors mb-6 font-medium"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      {/* Header */}
      <div className="bg-[var(--color-sand-light)] border border-[var(--color-warm-gray-300)] rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText size={32} className="text-[var(--color-clay)]" />
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Terms of Service
          </h1>
        </div>
        <p className="text-[var(--color-text-secondary)]">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Content */}
      <div className="bg-[var(--color-sand-light)] border border-[var(--color-warm-gray-300)] rounded-lg shadow-lg p-6 space-y-6">
        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">1. Agreement to Terms</h2>
          <p className="text-[var(--color-text-secondary)]">
            By accessing Jenfest, you agree to these Terms of Service. If you disagree with any part, 
            you may not use the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">2. Use License</h2>
          <p className="text-[var(--color-text-secondary)]">
            Jenfest grants you a temporary, non-exclusive, non-transferable license to use this 
            application for personal festival coordination purposes.
          </p>
          <p className="mt-2 text-[var(--color-text-secondary)]">You may not:</p>
          <ul className="list-disc list-inside space-y-2 text-[var(--color-text-secondary)] ml-4">
            <li>Use the service for any illegal purpose</li>
            <li>Attempt to gain unauthorized access to the service</li>
            <li>Upload malicious code or content</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Impersonate another person or entity</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">3. User Content</h2>
          <p className="text-[var(--color-text-secondary)]">
            You retain ownership of content you post. By posting content, you grant Jenfest a 
            license to display, distribute, and store your content as necessary to provide the service.
          </p>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            You are responsible for the content you post. Do not post content that is illegal, 
            offensive, or violates others' rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">4. Account Termination</h2>
          <p className="text-[var(--color-text-secondary)]">
            We reserve the right to terminate or suspend access to the service immediately, 
            without prior notice, for conduct that violates these Terms or is harmful to other users.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">5. Disclaimer</h2>
          <p className="text-[var(--color-text-secondary)]">
            The service is provided "as is" without warranties of any kind. We do not guarantee 
            the service will be uninterrupted, secure, or error-free.
          </p>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Jenfest is not responsible for any physical harm, property damage, or incidents that 
            occur at festival events. Users attend events at their own risk.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">6. Limitation of Liability</h2>
          <p className="text-[var(--color-text-secondary)]">
            Jenfest shall not be liable for any indirect, incidental, special, consequential, or 
            punitive damages resulting from your use of the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">7. Third-Party Services</h2>
          <p className="text-[var(--color-text-secondary)]">
            The service uses third-party providers (Auth0 for authentication, Firebase for data storage). 
            Your use of these services is subject to their respective terms and policies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">8. Changes to Terms</h2>
          <p className="text-[var(--color-text-secondary)]">
            We reserve the right to modify these terms at any time. Continued use of the service 
            after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">9. Contact</h2>
          <p className="text-[var(--color-text-secondary)]">
            Questions about these Terms? Contact us at the festival organizer's office.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
