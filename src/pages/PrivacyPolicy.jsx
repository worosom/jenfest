import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = ({ onBack }) => {
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
            Privacy Policy
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="prose max-w-none space-y-6 text-[var(--color-text-primary)]">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mt-4 mb-2">Account Information</h3>
              <p>
                When you sign in with Google, we collect your display name, email address, and 
                profile photo from your Google account.
              </p>

              <h3 className="text-xl font-semibold mt-4 mb-2">User-Generated Content</h3>
              <p>We collect and store:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Posts and comments you create</li>
                <li>Photos and media you upload</li>
                <li>Your camp location on the festival map (if you choose to set one)</li>
                <li>Your bio and profile information</li>
                <li>Activity RSVPs and attendance</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">Usage Information</h3>
              <p>
                We automatically collect information about how you interact with the service, 
                including pages viewed and features used.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
              <p>We use collected information to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Provide and maintain the Jenfest service</li>
                <li>Display your content to other festival attendees</li>
                <li>Show your camp location and profile to other users</li>
                <li>Enable social features like RSVPs and user discovery</li>
                <li>Improve and optimize the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Information Sharing</h2>
              
              <h3 className="text-xl font-semibold mt-4 mb-2">Public Information</h3>
              <p>
                Most information on Jenfest is <strong>publicly visible</strong> to all users, including:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Your display name and profile photo</li>
                <li>Your bio and camp location</li>
                <li>Posts, comments, and photos you share</li>
                <li>Activities you RSVP to</li>
              </ul>
              <p className="mt-2">
                Do not share information you wish to keep private. The service is designed for 
                a small, trusted community of festival attendees.
              </p>

              <h3 className="text-xl font-semibold mt-4 mb-2">Third-Party Services</h3>
              <p>We use the following third-party services:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Google Firebase:</strong> Authentication, database, and file storage</li>
                <li><strong>Google OAuth:</strong> Sign-in authentication</li>
              </ul>
              <p className="mt-2">
                These services have their own privacy policies governing their use of your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Data Retention</h2>
              <p>
                We retain your information for as long as your account is active or as needed to 
                provide the service. Content you create remains available to other users unless you 
                delete it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Access and update your profile information</li>
                <li>Delete posts and content you've created</li>
                <li>Request deletion of your account and associated data</li>
              </ul>
              <p className="mt-2">
                To exercise these rights, contact the festival organizers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Security</h2>
              <p>
                We use Firebase security rules and authentication to protect your data. However, 
                no system is completely secure. Use the service at your own risk and do not share 
                sensitive personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Children's Privacy</h2>
              <p>
                Jenfest is not intended for users under 18 years of age. We do not knowingly 
                collect information from children.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Continued use of the service 
                after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Contact</h2>
              <p>
                Questions about this Privacy Policy? Contact the festival organizers.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
