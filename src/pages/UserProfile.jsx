import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUsers } from '../hooks/useUsers';
import { MapPin, FileText, Calendar, Loader2, ArrowLeft } from 'lucide-react';
import ProfilePicture from '../components/ProfilePicture';

const UserProfile = ({ onBack }) => {
  const { userId } = useParams();
  const { users } = useUsers();
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    if (!userId) return;

    setLoadingPosts(true);
    const q = query(
      collection(db, 'posts'),
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserPosts(postsData);
      setLoadingPosts(false);
    });

    return unsubscribe;
  }, [userId]);

  if (!userId) return null;

  const userData = users[userId];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-clay)] transition-colors mb-6 font-medium"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      {/* User Info */}
      <div className="bg-[var(--color-sand-light)] border border-[var(--color-warm-gray-300)] rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          <ProfilePicture
            src={userData?.photoURL}
            alt={userData?.displayName || 'User'}
            size="lg"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">
              {userData?.displayName || 'Anonymous'}
            </h1>
            {userData?.bio && (
              <p className="text-[var(--color-text-secondary)] mb-3">{userData.bio}</p>
            )}
            {userData?.campLocation && (
              <div className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
                <MapPin size={16} className="text-[var(--color-clay)]" />
                <span>
                  Camp at X: {Math.round(userData.campLocation.x)}, Y: {Math.round(userData.campLocation.y)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User's Posts */}
      <div className="bg-[var(--color-sand-light)] border border-[var(--color-warm-gray-300)] rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <FileText size={18} />
          Posts
        </h2>

        {loadingPosts ? (
          <div className="text-center py-8">
            <Loader2 size={32} className="mx-auto text-[var(--color-clay)] animate-spin mb-2" />
            <p className="text-[var(--color-text-light)]">Loading posts...</p>
          </div>
        ) : userPosts.length === 0 ? (
          <div className="text-center py-8">
            <FileText size={48} className="mx-auto text-[var(--color-warm-gray-300)] mb-3" />
            <p className="text-[var(--color-text-light)]">No posts yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userPosts.map(post => (
              <div key={post.id} className="border border-[var(--color-warm-gray-300)] bg-white rounded-lg p-4">
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
                      className="w-full max-h-64 object-cover"
                    />
                  </div>
                )}

                {/* Author info at bottom */}
                <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-warm-gray-300)]">
                  <ProfilePicture
                    src={userData?.photoURL}
                    alt={userData?.displayName || 'User'}
                    size="sm"
                  />
                  <span className="text-xs text-[var(--color-text-secondary)] font-medium">
                    {userData?.displayName || 'Anonymous'}
                  </span>
                </div>

                {post.isActivity && (
                  <div className="flex items-center gap-4 text-sm text-[var(--color-text-light)] mt-3 pt-3 border-t border-[var(--color-warm-gray-300)]">
                    <span>{post.attendees?.length || 0} attending</span>
                    {post.mapLocation && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        Location tagged
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;