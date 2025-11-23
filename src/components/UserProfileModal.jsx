import { useState, useEffect } from 'react';
import { X, MapPin, FileText, Calendar, Loader2 } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUsers } from '../hooks/useUsers';
import ProfilePicture from './ProfilePicture';

const UserProfileModal = ({ isOpen, onClose, userId }) => {
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

  if (!isOpen || !userId) return null;

  const userData = users[userId];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* User Info */}
          <div className="flex items-start gap-4 mb-6">
            <ProfilePicture
              src={userData?.photoURL}
              alt={userData?.displayName || 'User'}
              size="lg"
            />
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-1">
                {userData?.displayName || 'Anonymous'}
              </h3>
              {userData?.bio && (
                <p className="text-gray-600 mb-3">{userData.bio}</p>
              )}
              {userData?.campLocation && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin size={16} className="text-purple-600" />
                  <span>
                    Camp at X: {Math.round(userData.campLocation.x)}, Y: {Math.round(userData.campLocation.y)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* User's Posts */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={18} />
              Posts
            </h3>

            {loadingPosts ? (
              <div className="text-center py-8">
                <Loader2 size={32} className="mx-auto text-purple-600 animate-spin mb-2" />
                <p className="text-gray-500">Loading posts...</p>
              </div>
            ) : userPosts.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No posts yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userPosts.map(post => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    {/* Header with timestamp */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {post.isActivity && (
                          <div className="flex items-center gap-1 text-purple-600 text-sm">
                            <Calendar size={16} />
                            <span>Activity</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {post.createdAt?.toDate().toLocaleString()}
                      </p>
                    </div>

                    {post.isActivity && post.scheduledAt && (
                      <div className="mb-2 text-sm text-gray-600 flex items-center gap-1">
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
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{post.title}</h3>
                    )}

                    <p className="text-gray-700 mb-3">{post.content}</p>

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
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <ProfilePicture
                        src={userData?.photoURL}
                        alt={userData?.displayName || 'User'}
                        size="sm"
                      />
                      <span className="text-xs text-gray-600">
                        {userData?.displayName || 'Anonymous'}
                      </span>
                    </div>

                    {post.isActivity && (
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-3 pt-3 border-t">
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
      </div>
    </div>
  );
};

export default UserProfileModal;