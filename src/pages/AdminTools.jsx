import { useState } from 'react';
import { auth } from '../config/firebase';

const AdminTools = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleInitializeBalances = async () => {
    if (!confirm('Initialize JENbucks balances for all users? This is safe to run multiple times.')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Get the current user's ID token
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to use admin tools');
      }

      const idToken = await user.getIdToken();

      const response = await fetch('/.netlify/functions/initializeJENbucksBalances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize balances');
      }

      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[var(--color-text)] mb-8">
        Admin Tools
      </h1>

      <div className="bg-[var(--color-sand-light)] border border-[var(--color-warm-gray-300)] rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
          JENbucks Balance Initialization
        </h2>
        
        <p className="text-[var(--color-text-secondary)] mb-4">
          Initialize JENbucks balances for all existing users who don't have one yet.
          This is safe to run multiple times - it will skip users who already have a balance.
        </p>

        <p className="text-sm text-[var(--color-text-light)] mb-4">
          ⚠️ Admin access required: This function is only available to alexander.morosow@gmail.com
        </p>

        <div className="space-y-4">
          <button
            onClick={handleInitializeBalances}
            disabled={loading}
            className="bg-[var(--color-clay)] text-white px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-clay-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Initializing...' : 'Initialize Balances'}
          </button>
        </div>

        {result && (
          <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {result.success ? (
              <>
                <h3 className="font-semibold text-green-800 mb-2">✅ Success!</h3>
                <div className="text-green-700 space-y-1">
                  <p>✅ Initialized: {result.initialized} users</p>
                  <p>ℹ️ Already existed: {result.alreadyExists} users</p>
                  {result.errors > 0 && <p>❌ Errors: {result.errors} users</p>}
                  <p className="font-semibold mt-2">📊 Total processed: {result.total} users</p>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-red-800 mb-2">❌ Error</h3>
                <p className="text-red-700">{result.error}</p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="bg-[var(--color-sand-light)] border border-[var(--color-warm-gray-300)] rounded-lg shadow-lg p-6">
        <h3 className="font-semibold text-[var(--color-text)] mb-2">How it works:</h3>
        <ul className="list-disc list-inside text-[var(--color-text-secondary)] space-y-2">
          <li>Fetches all users from the users collection</li>
          <li>Checks if each user has a JENbucks balance</li>
          <li>Creates a balance of 500 JENbucks for users without one</li>
          <li>Skips users who already have a balance</li>
          <li>Reports summary of initialization results</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminTools;