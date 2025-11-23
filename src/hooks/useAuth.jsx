import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { signInWithCustomToken } from 'firebase/auth';
import { db, auth } from '../config/firebase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { user: auth0User, isLoading, loginWithRedirect, logout: auth0Logout, getAccessTokenSilently } = useAuth0();
  const [userProfile, setUserProfile] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Authenticate with Firebase using Auth0 token
  useEffect(() => {
    const authenticateWithFirebase = async () => {
      if (!auth0User) {
        setFirebaseUser(null);
        return;
      }

      try {
        // Get Auth0 access token
        const auth0Token = await getAccessTokenSilently();

        // Exchange for Firebase custom token
        const response = await fetch('/.netlify/functions/getFirebaseToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ auth0Token }),
        });

        if (!response.ok) {
          throw new Error('Failed to get Firebase token');
        }

        const { firebaseToken } = await response.json();

        // Sign in to Firebase with custom token
        await signInWithCustomToken(auth, firebaseToken);
        setFirebaseUser(auth.currentUser);
      } catch (error) {
        console.error('Error authenticating with Firebase:', error);
      }
    };

    authenticateWithFirebase();
  }, [auth0User, getAccessTokenSilently]);

  // Create a normalized user object that matches Firebase structure
  const user = auth0User ? {
    uid: auth0User.sub, // Auth0 user ID (e.g., "auth0|123456")
    displayName: auth0User.name || auth0User.nickname || 'Anonymous',
    photoURL: auth0User.picture || '',
    email: auth0User.email || '',
  } : null;

  useEffect(() => {
    let unsubscribeProfile = null;
    
    const syncUserProfile = async () => {
      // Wait for both Auth0 user AND Firebase auth to be ready
      if (!user || !firebaseUser) {
        setUserProfile(null);
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        return;
      }

      setSyncing(true);
      
      try {
        const userRef = doc(db, 'users', user.uid);
        
        // Check if profile exists
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          // Create new user profile
          const newProfile = {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
            email: user.email,
            campLocation: null,
            bio: '',
          };
          await setDoc(userRef, newProfile);
        }
        
        // Listen for profile updates in real-time
        unsubscribeProfile = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUserProfile(doc.data());
          }
          setSyncing(false);
        });
      } catch (error) {
        console.error('Error syncing user profile:', error);
        setSyncing(false);
      }
    };

    syncUserProfile();

    return () => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, [user?.uid, firebaseUser]);

  const signInWithGoogle = async () => {
    try {
      await loginWithRedirect({
        authorizationParams: {
          connection: 'google-oauth2',
        },
      });
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await auth0Logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      });
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading: isLoading || syncing,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};