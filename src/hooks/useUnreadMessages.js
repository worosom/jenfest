import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

export const useUnreadMessages = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) {
      setUnreadCount(0);
      return;
    }

    const messagesRef = collection(db, 'messages');
    
    // Get all unread messages where user is the recipient
    const messagesQuery = query(
      messagesRef,
      where('recipientId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribeMessages = onSnapshot(messagesQuery, async (messagesSnapshot) => {
      const unreadDMs = messagesSnapshot.size;

      // Count posts with new replies since last viewed
      try {
        // Get all posts (user's posts and posts user replied to)
        const postsRef = collection(db, 'posts');
        const postsSnapshot = await getDocs(postsRef);
        const postsMap = new Map();
        postsSnapshot.docs.forEach((doc) => {
          const postData = { id: doc.id, ...doc.data() };
          if (postData.published !== false) {
            postsMap.set(doc.id, postData);
          }
        });

        // Get all replies
        const repliesRef = collection(db, 'replies');
        const repliesSnapshot = await getDocs(repliesRef);
        const repliesData = repliesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Get last viewed timestamps
        const postLastViewedRef = collection(db, 'postLastViewed');
        const postLastViewedQuery = query(postLastViewedRef, where('userId', '==', user.uid));
        const postLastViewedSnapshot = await getDocs(postLastViewedQuery);
        const lastViewedMap = new Map();
        postLastViewedSnapshot.docs.forEach(doc => {
          const data = doc.data();
          lastViewedMap.set(data.postId, data.lastViewedAt);
        });

        // Count posts with unread replies (only for posts user owns)
        const postsWithUnreadReplies = new Set();
        repliesData.forEach((reply) => {
          const post = postsMap.get(reply.postId);
          if (!post) return;

          const userOwnsPost = post.authorId === user.uid;

          // Only count unread indicators for posts the user owns
          if (!userOwnsPost) return;
          if (reply.authorId === user.uid) return; // Skip user's own replies

          const lastViewed = lastViewedMap.get(reply.postId);
          
          // If never viewed, or reply is newer than last viewed
          if (!lastViewed || (reply.createdAt && reply.createdAt.toMillis() > lastViewed.toMillis())) {
            postsWithUnreadReplies.add(reply.postId);
          }
        });

        setUnreadCount(unreadDMs + postsWithUnreadReplies.size);
      } catch (error) {
        console.error('Error counting unread post replies:', error);
        setUnreadCount(unreadDMs);
      }
    });

    return () => unsubscribeMessages();
  }, [user?.uid]);

  return unreadCount;
};