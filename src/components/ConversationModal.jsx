import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { X, Send, MessageCircle, Loader2 } from 'lucide-react';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  or,
  and,
  doc,
  updateDoc,
  writeBatch,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';
import ProfilePicture from './ProfilePicture';
import MessageBubble from './MessageBubble';

const ConversationModal = ({ isOpen, onClose, recipientId, onViewUserProfile }) => {
  const { user } = useAuth();
  const { users } = useUsers();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const recipient = users[recipientId];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when conversation is viewed
  useLayoutEffect(() => {
    if (!isOpen || !user || !recipientId || messages.length === 0) return;

    const markMessagesAsRead = async () => {
      // Find all unread messages sent to current user from this recipient
      const unreadMessages = messages.filter(
        msg => msg.recipientId === user.uid && 
               msg.senderId === recipientId && 
               msg.read === false
      );

      if (unreadMessages.length === 0) return;

      try {
        const batch = writeBatch(db);
        
        unreadMessages.forEach(msg => {
          const messageRef = doc(db, 'messages', msg.id);
          batch.update(messageRef, { read: true });
        });

        await batch.commit();
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    markMessagesAsRead();
  }, [isOpen, user, recipientId, messages]);

  // Listen to messages in real-time
  useEffect(() => {
    if (!isOpen || !user || !recipientId) {
      setMessages([]);
      setLoading(true);
      return;
    }

    const messagesRef = collection(db, 'messages');
    // Get messages between current user and recipient (in both directions)
    const q = query(
      messagesRef,
      or(
        and(
          where('senderId', '==', user.uid),
          where('recipientId', '==', recipientId)
        ),
        and(
          where('senderId', '==', recipientId),
          where('recipientId', '==', user.uid)
        )
      )
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messagesData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => {
            // Handle null timestamps
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return a.createdAt.toMillis() - b.createdAt.toMillis();
          });
        setMessages(messagesData);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to messages:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen, user, recipientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !user || !recipientId) return;

    setSending(true);

    try {
      const messagesRef = collection(db, 'messages');
      await addDoc(messagesRef, {
        senderId: user.uid,
        recipientId: recipientId,
        content: newMessage.trim(),
        createdAt: serverTimestamp(),
        read: false,
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      const messageRef = doc(db, 'messages', messageId);
      await deleteDoc(messageRef);
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Error deleting message. Please try again.');
    }
  };

  if (!isOpen || !recipientId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-sand-light)] border-2 border-[var(--color-leather)] rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-warm-gray-300)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onViewUserProfile?.(recipientId)}
              className="flex-shrink-0"
            >
              <ProfilePicture
                src={recipient?.photoURL}
                alt={recipient?.displayName || 'User'}
                size="sm"
              />
            </button>
            <div>
              <button
                onClick={() => onViewUserProfile?.(recipientId)}
                className="text-lg font-bold text-[var(--color-text-primary)] hover:text-[var(--color-clay)] transition-colors"
              >
                {recipient?.displayName || 'Anonymous'}
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-warm-gray-200)] rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={32} className="animate-spin text-[var(--color-clay)]" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <MessageCircle
                size={48}
                className="text-[var(--color-warm-gray-300)] mb-3"
              />
              <p className="text-[var(--color-text-light)] text-center">
                No messages yet
              </p>
              <p className="text-sm text-[var(--color-text-light)] text-center mt-1">
                Start the conversation!
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                const isCurrentUser = message.senderId === user?.uid;
                const sender = users[message.senderId];

                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isCurrentUser={isCurrentUser}
                    author={sender}
                    onViewUserProfile={onViewUserProfile}
                    onDelete={handleDeleteMessage}
                    showAuthorName={false}
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
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={sending}
                className="flex-1 px-4 py-2 border border-[var(--color-warm-gray-300)] bg-white rounded-lg focus:ring-2 focus:ring-[var(--color-clay)] focus:border-transparent disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
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
              Please log in to send messages
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationModal;