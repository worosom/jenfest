import { ArrowLeft, Shield } from "lucide-react";

const PrivacyPolicy = ({ onBack }) => {
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
          <Shield size={32} className="text-[var(--color-clay)]" />
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Privacy Policy
          </h1>
        </div>
        <p className="text-[var(--color-text-secondary)]">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Content */}
      <div className="bg-[var(--color-sand-light)] border border-[var(--color-warm-gray-300)] rounded-lg shadow-lg p-6 space-y-6">
        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">1. Information We Collect</h2>
          
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mt-4 mb-2">Account Information</h3>
          <p className="text-[var(--color-text-secondary)]">
            When you sign in with Auth0, we collect your display name, email address, and 
            profile photo from your authentication provider.
          </p>

          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mt-4 mb-2">User-Generated Content</h3>
          <p className="text-[var(--color-text-secondary)]">We collect and store:</p>
          <ul className="list-disc list-inside space-y-2 text-[var(--color-text-secondary)] ml-4">
            <li>Posts and comments you create</li>
            <li>Photos and media you upload</li>
            <li>Your camp location on the festival map (if you choose to set one)</li>
            <li>Your bio and profile information</li>
            <li>Activity RSVPs and attendance</li>
          </ul>

          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mt-4 mb-2">Usage Information</h3>
          <p className="text-[var(--color-text-secondary)]">
            We automatically collect information about how you interact with the service, 
            including pages viewed and features used.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">2. How We Use Your Information</h2>
          <p className="text-[var(--color-text-secondary)]">We use collected information to:</p>
          <ul className="list-disc list-inside space-y-2 text-[var(--color-text-secondary)] ml-4">
            <li>Provide and maintain the Jenfest service</li>
            <li>Display your content to other festival attendees</li>
            <li>Show your camp location and profile to other users</li>
            <li>Enable social features like RSVPs and user discovery</li>
            <li>Improve and optimize the service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">3. Information Sharing</h2>
          
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mt-4 mb-2">Public Information</h3>
          <p className="text-[var(--color-text-secondary)]">
            Most information on Jenfest is <strong>publicly visible</strong> to all users, including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[var(--color-text-secondary)] ml-4">
            <li>Your display name and profile photo</li>
            <li>Your bio and camp location</li>
            <li>Posts, comments, and photos you share</li>
            <li>Activities you RSVP to</li>
          </ul>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Do not share information you wish to keep private. The service is designed for 
            a small, trusted community of festival attendees.
          </p>

          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mt-4 mb-2">Third-Party Services</h3>
          <p className="text-[var(--color-text-secondary)]">We use the following third-party services:</p>
          <ul className="list-disc list-inside space-y-2 text-[var(--color-text-secondary)] ml-4">
            <li><strong>Auth0:</strong> User authentication and login management</li>
            <li><strong>Firebase Firestore:</strong> Database for storing posts and user data</li>
            <li><strong>Firebase Storage:</strong> File storage for photos and media</li>
          </ul>
          <p className="mt-3 text-[var(--color-text-secondary)]">
            These services have their own privacy policies governing their use of your information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">4. Data Retention</h2>
          <p className="text-[var(--color-text-secondary)]">
            We retain your information for as long as your account is active or as needed to 
            provide the service. Content you create remains available to other users unless you 
            delete it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">5. Your Rights</h2>
          <p className="text-[var(--color-text-secondary)]">You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 text-[var(--color-text-secondary)] ml-4">
            <li>Access and update your profile information</li>
            <li>Delete posts and content you've created</li>
            <li>Request deletion of your account and associated data</li>
          </ul>
          <p className="mt-3 text-[var(--color-text-secondary)]">
            To exercise these rights, contact the festival organizers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">6. Security</h2>
          <p className="text-[var(--color-text-secondary)]">
            We use Auth0 authentication and Firebase security rules to protect your data. However, 
            no system is completely secure. Use the service at your own risk and do not share 
            sensitive personal information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">7. Children's Privacy</h2>
          <p className="text-[var(--color-text-secondary)]">
            Jenfest is not intended for users under 18 years of age. We do not knowingly 
            collect information from children.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">8. Changes to This Policy</h2>
          <p className="text-[var(--color-text-secondary)]">
            We may update this Privacy Policy from time to time. Continued use of the service 
            after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">9. Contact</h2>
          <p className="text-[var(--color-text-secondary)]">
            Questions about this Privacy Policy? Contact the festival organizers.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
