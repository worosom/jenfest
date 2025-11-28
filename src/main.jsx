import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Service Worker Management
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // In development, unregister any existing service workers
      if (import.meta.env.DEV) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          console.log('Development: Unregistered service worker');
        }
        // Clear all caches
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('Development: Cleared all caches');
      }
      
      // In production, register the service worker
      if (import.meta.env.PROD) {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered successfully:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              console.log('New service worker activated. Reloading...');
              window.location.reload();
            }
          });
        });
      }
    } catch (error) {
      console.error('Service Worker error:', error);
    }
  });
}