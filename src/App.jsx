import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { UsersProvider } from './hooks/useUsers';
import { JENbucksProvider } from './hooks/useJENbucks';
import Home from './pages/Home';

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return <Home />;
}

function App() {
  return (
    <BrowserRouter>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: window.location.origin,
        }}
        cacheLocation="localstorage"
      >
        <AuthProvider>
          <UsersProvider>
            <JENbucksWrapper>
              <AppContent />
            </JENbucksWrapper>
          </UsersProvider>
        </AuthProvider>
      </Auth0Provider>
    </BrowserRouter>
  );
}

function JENbucksWrapper({ children }) {
  const { user } = useAuth();
  return (
    <JENbucksProvider user={user}>
      {children}
    </JENbucksProvider>
  );
}

export default App;