import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { MessageSquare, Calendar, Users, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';
import ProfilePicture from '../components/ProfilePicture';
import AttendeesModal from '../components/AttendeesModal';
import EditPostModal from '../components/EditPostModal';

const Feed = ({ onViewUserProfile }) => {
  const { user } = useAuth();
  const { users } = useUsers();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-[var(--color-text-light)]">Loading feed...</div>
      </div>
    );
  }

  const toggleRSVP = async (post) => {
    if (!user) return;
    
    try {
      const postRef = doc(db, 'posts', post.id);
      if (post.attendees.includes(user.uid)) {
        await updateDoc(postRef, { attendees: arrayRemove(user.uid) });
      } else {
        await updateDoc(postRef, { attendees: arrayUnion(user.uid) });
      }
    } catch (error) {
      console.error('Error toggling RSVP:', error);
    }
  };

  const deletePost = async (postId) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post. Please try again.');
    }
  };

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 px-4">
        <MessageSquare size={48} className="text-[var(--color-warm-gray-300)] mb-4" />
        <p className="text-[var(--color-text-light)] text-center">No posts yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {posts.map(post => (
        <div key={post.id} className="bg-[var(--color-sand-light)] border border-[var(--color-warm-gray-300)] rounded-lg shadow-lg p-4">
          {/* Header with timestamp */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {post.isActivity && (
                <div className="flex items-center gap-1 text-[var(--color-clay)] text-sm font-medium">
                  <Calendar size={16} />
                  <span>Activity</span>
                </div>
              )}
            </div>
            <p className="text-xs text-[var(--color-text-light)]">
              {post.createdAt?.toDate().toLocaleString()}
            </p>
          </div>
          
          {post.isActivity && post.scheduledAt && (
            <div className="mb-2 text-sm text-[var(--color-text-secondary)] flex items-center gap-1">
              <Calendar size={14} />
              <span>
                {post.scheduledAt.toDate().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}
          
          {post.title && (
            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">{post.title}</h3>
          )}
          
          <p className="text-[var(--color-text-secondary)] mb-3">{post.content}</p>
          
          {post.media && post.media.length > 0 && (
            <div className="rounded-lg overflow-hidden mb-3">
              <img 
                src={post.media[0].url} 
                alt="Post media"
                className="w-full"
              />
            </div>
          )}

          {/* Author info at bottom */}
          <div className="flex items-center justify-between gap-2 mb-3 pt-2 border-t border-[var(--color-warm-gray-300)]">
            <div className="flex items-center gap-2">
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
              <button
                onClick={() => onViewUserProfile?.(post.authorId)}
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-clay)] transition-colors font-medium"
              >
                {users[post.authorId]?.displayName || 'Anonymous'}
              </button>
            </div>
            {post.authorId === user?.uid && (
              <div className="flex gap-1">
                <button
                  onClick={() => setEditingPost(post)}
                  className="p-2 text-[var(--color-lake)] hover:bg-[var(--color-warm-gray-200)] rounded-lg transition-colors"
                  title="Edit post"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => deletePost(post.id)}
                  className="p-2 text-[var(--color-sunset-red)] hover:bg-[var(--color-warm-gray-200)] rounded-lg transition-colors"
                  title="Delete post"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
          
          {post.isActivity && (
            <div className="flex items-center justify-between pt-3 border-t border-[var(--color-warm-gray-300)]">
              <button
                onClick={() => setSelectedActivity(post)}
                className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-clay)] transition-colors font-medium"
              >
                <Users size={16} />
                <span>{post.attendees?.length || 0} attending</span>
              </button>
              <button
                onClick={() => toggleRSVP(post)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  post.attendees?.includes(user?.uid)
                    ? 'bg-[var(--color-clay-light)] text-[var(--color-leather-dark)] hover:bg-[var(--color-clay)]'
                    : 'bg-[var(--color-warm-gray-200)] text-[var(--color-text-secondary)] hover:bg-[var(--color-warm-gray-300)]'
                }`}
              >
                {post.attendees?.includes(user?.uid) ? 'Attending' : 'Join'}
              </button>
            </div>
          )}
        </div>
        ))}
      </div>

      {/* Attendees Modal */}
      <AttendeesModal
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        attendees={selectedActivity?.attendees || []}
        activityTitle={selectedActivity?.content}
        onViewUserProfile={onViewUserProfile}
      />

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        post={editingPost}
      />
    </>
  );
};

export default Feed;