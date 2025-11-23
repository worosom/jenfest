import { ArrowLeft } from "lucide-react";

const TermsOfService = ({ onBack }) => {
  return (
    <div className="h-full overflow-y-auto bg-[var(--color-bg-primary)]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-[var(--color-leather)] hover:text-[var(--color-leather-dark)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8 border border-[var(--color-warm-gray-300)]">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Terms of Service
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="prose max-w-none space-y-6 text-[var(--color-text-primary)]">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Agreement to Terms</h2>
              <p>
                By accessing Jenfest, you agree to these Terms of Service. If you disagree with any part, 
                you may not use the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Use License</h2>
              <p>
                Jenfest grants you a temporary, non-exclusive, non-transferable license to use this 
                application for personal festival coordination purposes.
              </p>
              <p className="mt-2">You may not:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Use the service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to the service</li>
                <li>Upload malicious code or content</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Impersonate another person or entity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. User Content</h2>
              <p>
                You retain ownership of content you post. By posting content, you grant Jenfest a 
                license to display, distribute, and store your content as necessary to provide the service.
              </p>
              <p className="mt-2">
                You are responsible for the content you post. Do not post content that is illegal, 
                offensive, or violates others' rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Account Termination</h2>
              <p>
                We reserve the right to terminate or suspend access to the service immediately, 
                without prior notice, for conduct that violates these Terms or is harmful to other users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Disclaimer</h2>
              <p>
                The service is provided "as is" without warranties of any kind. We do not guarantee 
                the service will be uninterrupted, secure, or error-free.
              </p>
              <p className="mt-2">
                Jenfest is not responsible for any physical harm, property damage, or incidents that 
                occur at festival events. Users attend events at their own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Limitation of Liability</h2>
              <p>
                Jenfest shall not be liable for any indirect, incidental, special, consequential, or 
                punitive damages resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Continued use of the service 
                after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Contact</h2>
              <p>
                Questions about these Terms? Contact us at the festival organizer's office.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
