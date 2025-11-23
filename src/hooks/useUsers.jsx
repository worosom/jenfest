import { createContext, useContext, useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

const UsersContext = createContext({});

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers must be used within UsersProvider');
  }
  return context;
};

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersQuery = query(collection(db, 'users'));
    
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersMap = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        usersMap[data.uid] = {
          displayName: data.displayName,
          photoURL: data.photoURL,
          bio: data.bio,
          campLocation: data.campLocation,
        };
      });
      setUsers(usersMap);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const getUserById = (uid) => {
    return users[uid] || null;
  };

  const value = {
    users,
    loading,
    getUserById,
  };

  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  );
};
