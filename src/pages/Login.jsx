import { useAuth } from '../hooks/useAuth';
import { LogIn } from 'lucide-react';

const Login = () => {
  const { signInWithGoogle } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Jenfest</h1>
          <p className="text-gray-600">Your Festival Companion</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleSignIn}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 shadow-sm"
          >
            <LogIn size={20} />
            Sign in with Google
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Join your friends at the festival</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
