import { createContext, useContext, useEffect, useState } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const JENbucksContext = createContext({});

export const useJENbucks = () => {
  const context = useContext(JENbucksContext);
  if (!context) {
    throw new Error('useJENbucks must be used within JENbucksProvider');
  }
  return context;
};

const INITIAL_JENBUCKS = 500;

export const JENbucksProvider = ({ children, user }) => {
  const [balance, setBalance] = useState(INITIAL_JENBUCKS);
  const [postReactions, setPostReactions] = useState({}); // { postId: count }
  const [userReactions, setUserReactions] = useState({}); // { postId: count } - current user's reactions
  const [earnedReactions, setEarnedReactions] = useState(0); // Total JENbucks earned from others reacting to user's posts
  const [loading, setLoading] = useState(true);

  // Calculate balance: Initial - Spent + Earned
  useEffect(() => {
    if (!user?.uid) {
      setBalance(INITIAL_JENBUCKS);
      setLoading(false);
      return;
    }

    const spentAmount = Object.values(userReactions).reduce((sum, count) => sum + count, 0);
    const calculatedBalance = INITIAL_JENBUCKS - spentAmount + earnedReactions;
    setBalance(calculatedBalance);
    setLoading(false);
  }, [user?.uid, userReactions, earnedReactions]);

  // Listen to all reactions to track total per post
  useEffect(() => {
    const reactionsRef = collection(db, 'jenbucksReactions');
    const unsubscribe = onSnapshot(
      reactionsRef,
      (snapshot) => {
        const reactions = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (!reactions[data.postId]) {
            reactions[data.postId] = 0;
          }
          reactions[data.postId] += data.amount || 1;
        });
        setPostReactions(reactions);
      },
      (error) => {
        console.error('Error listening to reactions:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Listen to current user's reactions (spent JENbucks)
  useEffect(() => {
    if (!user?.uid) {
      setUserReactions({});
      return;
    }

    const reactionsRef = collection(db, 'jenbucksReactions');
    const q = query(reactionsRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reactions = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (!reactions[data.postId]) {
            reactions[data.postId] = 0;
          }
          reactions[data.postId] += data.amount || 1;
        });
        setUserReactions(reactions);
      },
      (error) => {
        console.error('Error listening to user reactions:', error);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Listen to reactions on current user's posts (earned JENbucks)
  useEffect(() => {
    if (!user?.uid) {
      setEarnedReactions(0);
      return;
    }

    const reactionsRef = collection(db, 'jenbucksReactions');
    const q = query(reactionsRef, where('authorId', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let totalEarned = 0;
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          // Don't count self-reactions
          if (data.userId !== user.uid) {
            totalEarned += data.amount || 1;
          }
        });
        setEarnedReactions(totalEarned);
      },
      (error) => {
        console.error('Error listening to earned reactions:', error);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const addReaction = async (postId, authorId) => {
    if (!user?.uid) {
      alert('Please sign in to react with JENbucks');
      return false;
    }

    // Calculate available balance (initial - spent)
    const spentAmount = Object.values(userReactions).reduce((sum, count) => sum + count, 0);
    const availableBalance = INITIAL_JENBUCKS - spentAmount;

    if (availableBalance <= 0) {
      alert('You have no JENbucks left!');
      return false;
    }

    try {
      // Add reaction document
      const reactionsRef = collection(db, 'jenbucksReactions');
      await addDoc(reactionsRef, {
        postId,
        userId: user.uid,
        authorId, // Track who receives the JENbucks
        amount: 1,
        createdAt: serverTimestamp(),
      });

      return true;
    } catch (error) {
      console.error('Error adding reaction:', error);
      alert('Error adding reaction. Please try again.');
      return false;
    }
  };

  const value = {
    balance,
    postReactions,
    userReactions,
    addReaction,
    loading,
  };

  return (
    <JENbucksContext.Provider value={value}>
      {children}
    </JENbucksContext.Provider>
  );
};