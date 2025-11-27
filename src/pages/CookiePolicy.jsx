import { ArrowLeft, Cookie } from 'lucide-react';

const CookiePolicy = ({ onBack }) => {
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
          <Cookie size={32} className="text-[var(--color-clay)]" />
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Cookie Policy
          </h1>
        </div>
        <p className="text-[var(--color-text-secondary)]">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Content */}
      <div className="bg-[var(--color-sand-light)] border border-[var(--color-warm-gray-300)] rounded-lg shadow-lg p-6 space-y-6">
        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">
            What Are Cookies?
          </h2>
          <p className="text-[var(--color-text-secondary)]">
            Cookies are small text files stored on your device when you use our app. 
            We use cookies and browser local storage to provide essential functionality.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">
            How We Use Cookies
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-3">
            This festival app uses cookies and local storage for the following purposes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[var(--color-text-secondary)] ml-4">
            <li>
              <strong>Authentication:</strong> Auth0 uses cookies to maintain your login session
            </li>
            <li>
              <strong>Session Management:</strong> Keeping you logged in as you navigate the app
            </li>
            <li>
              <strong>User Preferences:</strong> Remembering your settings and preferences
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">
            What We Don't Do
          </h2>
          <ul className="list-disc list-inside space-y-2 text-[var(--color-text-secondary)] ml-4">
            <li>We do not use tracking cookies</li>
            <li>We do not use analytics cookies</li>
            <li>We do not sell your data to third parties</li>
            <li>We do not use advertising cookies</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">
            Third-Party Services
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-3">
            We use the following third-party services:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[var(--color-text-secondary)] ml-4">
            <li>
              <strong>Auth0:</strong> Manages user authentication and login sessions
            </li>
            <li>
              <strong>Firebase Firestore:</strong> Stores app data (posts, user profiles)
            </li>
            <li>
              <strong>Firebase Storage:</strong> Stores user photos
            </li>
          </ul>
          <p className="text-[var(--color-text-secondary)] mt-3">
            Auth0's use of cookies is governed by{' '}
            <a
              href="https://auth0.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-clay)] hover:text-[var(--color-clay-dark)] underline font-medium"
            >
              Auth0's Privacy Policy
            </a>
            . Firebase's data handling is governed by{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-clay)] hover:text-[var(--color-clay-dark)] underline font-medium"
            >
              Google's Privacy Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">
            Managing Cookies
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-3">
            You can control cookies through your browser settings. However, disabling cookies 
            will prevent you from using this app, as authentication requires cookies to function.
          </p>
          <p className="text-[var(--color-text-secondary)]">
            To clear cookies and local storage for this app, you can:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[var(--color-text-secondary)] ml-4 mt-2">
            <li>Sign out of the app</li>
            <li>Clear your browser's cookies and site data</li>
            <li>Use your browser's incognito/private mode</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">
            Questions?
          </h2>
          <p className="text-[var(--color-text-secondary)]">
            This is a festival companion app built for convenience and community. 
            If you have questions about how we handle your data, feel free to reach out.
          </p>
        </section>
      </div>
    </div>
  );
};

export default CookiePolicy;