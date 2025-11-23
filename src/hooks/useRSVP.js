import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

export const useRSVP = () => {
  const { user } = useAuth();

  const toggleRSVP = async (post) => {
    if (!user) return;

    try {
      const postRef = doc(db, 'posts', post.id);
      if (post.attendees?.includes(user.uid)) {
        await updateDoc(postRef, { attendees: arrayRemove(user.uid) });
      } else {
        await updateDoc(postRef, { attendees: arrayUnion(user.uid) });
      }
    } catch (error) {
      console.error('Error toggling RSVP:', error);
    }
  };

  return { toggleRSVP };
};
