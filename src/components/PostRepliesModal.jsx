import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Loader2 } from 'lucide-react';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';
import ProfilePicture from './ProfilePicture';
import MessageBubble from './MessageBubble';

const PostRepliesModal = ({ isOpen, onClose, post, onViewUserProfile }) => {
  const { user } = useAuth();
  const { users } = useUsers();
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [replies]);

  // Update lastViewed timestamp when modal opens or closes
  useEffect(() => {
    if (!post || !user?.uid) return;

    const updateLastViewed = async () => {
      try {
        const lastViewedRef = doc(db, 'postLastViewed', `${user.uid}_${post.id}`);
        await setDoc(lastViewedRef, {
          userId: user.uid,
          postId: post.id,
          lastViewedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error updating last viewed timestamp:', error);
      }
    };

    if (isOpen) {
      // Update when opening
      updateLastViewed();
    }

    // Cleanup: Update when closing
    return () => {
      if (isOpen && post && user?.uid) {
        updateLastViewed();
      }
    };
  }, [isOpen, post, user?.uid]);

  // Listen to replies in real-time
  useEffect(() => {
    if (!isOpen || !post) {
      setReplies([]);
      setLoading(true);
      return;
    }

    const repliesRef = collection(db, 'replies');
    const q = query(
      repliesRef,
      where('postId', '==', post.id)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const repliesData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => {
            // Handle null timestamps (from serverTimestamp before it resolves)
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return a.createdAt.toMillis() - b.createdAt.toMillis();
          });
        setReplies(repliesData);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to replies:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen, post]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newReply.trim() || !user) return;

    setSending(true);

    try {
      const repliesRef = collection(db, 'replies');
      await addDoc(repliesRef, {
        postId: post.id,
        content: newReply.trim(),
        authorId: user.uid,
        createdAt: serverTimestamp(),
      });

      setNewReply('');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Error sending reply. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!user) return;

    if (!confirm('Delete this reply?')) return;

    try {
      const replyRef = doc(db, 'replies', replyId);
      await deleteDoc(replyRef);
    } catch (error) {
      console.error('Error deleting reply:', error);
      alert('Error deleting reply. Please try again.');
    }
  };

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-sand-light)] border-2 border-[var(--color-leather)] rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-warm-gray-300)]">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="text-[var(--color-clay)]" />
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Replies</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-warm-gray-200)] rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Post Preview */}
        <div className="p-4 bg-[var(--color-warm-gray-100)] border-b border-[var(--color-warm-gray-300)]">
          <div className="flex items-start gap-3">
            <button
              onClick={() => onViewUserProfile?.(post.authorId)}
              className="flex-shrink-0"
            >
              <ProfilePicture
                src={users[post.authorId]?.photoURL}
                alt={users[post.authorId]?.displayName || 'User'}
                size="sm"
              />
            </button>
            <div className="flex-1 min-w-0">
              <button
                onClick={() => onViewUserProfile?.(post.authorId)}
                className="text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-clay)] transition-colors"
              >
                {users[post.authorId]?.displayName || 'Anonymous'}
              </button>
              {post.title && (
                <p className="font-semibold text-[var(--color-text-primary)] mt-1">
                  {post.title}
                </p>
              )}
              <p className="text-sm text-[var(--color-text-secondary)] mt-1 line-clamp-2">
                {post.content}
              </p>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={32} className="animate-spin text-[var(--color-clay)]" />
            </div>
          ) : replies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <MessageCircle
                size={48}
                className="text-[var(--color-warm-gray-300)] mb-3"
              />
              <p className="text-[var(--color-text-light)] text-center">
                No replies yet
              </p>
              <p className="text-sm text-[var(--color-text-light)] text-center mt-1">
                Be the first to reply!
              </p>
            </div>
          ) : (
            <>
              {replies.map((reply) => {
                const author = users[reply.authorId];
                const isCurrentUser = reply.authorId === user?.uid;

                return (
                  <MessageBubble
                    key={reply.id}
                    message={reply}
                    isCurrentUser={isCurrentUser}
                    author={author}
                    onViewUserProfile={onViewUserProfile}
                    onDelete={handleDeleteReply}
                    showAuthorName={true}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        {user ? (
          <form
            onSubmit={handleSubmit}
            className="border-t border-[var(--color-warm-gray-300)] p-4"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Type a reply..."
                disabled={sending}
                className="flex-1 px-4 py-2 border border-[var(--color-warm-gray-300)] bg-white rounded-lg focus:ring-2 focus:ring-[var(--color-clay)] focus:border-transparent disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!newReply.trim() || sending}
                className="bg-[var(--color-clay)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-clay-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sending ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="border-t border-[var(--color-warm-gray-300)] p-4 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Please log in to reply
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostRepliesModal;