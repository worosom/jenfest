import { AuthProvider, useAuth } from './hooks/useAuth';
import { UsersProvider } from './hooks/useUsers';
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

  // Always show Home - public access
  return <Home />;
}

function App() {
  return (
    <AuthProvider>
      <UsersProvider>
        <AppContent />
      </UsersProvider>
    </AuthProvider>
  );
}

export default App;