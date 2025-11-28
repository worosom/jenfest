import { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsDismissed(false); // Reset dismissed state when back online
      console.log('🌐 Back online - syncing data...');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsDismissed(false); // Show banner again when going offline
      console.log('📱 Offline mode - using cached data');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline || isDismissed) {
    return null; // Don't show when online or dismissed
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-[var(--color-sunset-red)] text-white px-4 py-2 z-50 flex items-center justify-center gap-2 text-sm font-medium shadow-lg">
      <WifiOff size={16} />
      <span>Offline Mode - Viewing cached data</span>
      <button
        onClick={() => setIsDismissed(true)}
        className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
        title="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default OfflineIndicator;