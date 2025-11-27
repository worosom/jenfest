import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';
import { ArrowLeft } from 'lucide-react';
import Post from '../components/Post';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { users } = useUsers();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = doc(db, 'posts', postId);
        const postSnap = await getDoc(postRef);
        
        if (postSnap.exists()) {
          setPost({ id: postSnap.id, ...postSnap.data() });
        } else {
          console.error('Post not found');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deleteDoc(doc(db, 'posts', postId));
        navigate(-1);
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post');
      }
    }
  };

  const handleToggleRSVP = async (post) => {
    if (!user) return;

    try {
      const postRef = doc(db, 'posts', post.id);
      const isAttending = post.attendees?.includes(user.uid);

      await updateDoc(postRef, {
        attendees: isAttending
          ? arrayRemove(user.uid)
          : arrayUnion(user.uid),
      });

      // Update local state
      setPost({
        ...post,
        attendees: isAttending
          ? post.attendees.filter(id => id !== user.uid)
          : [...(post.attendees || []), user.uid],
      });
    } catch (error) {
      console.error('Error toggling RSVP:', error);
      alert('Failed to update RSVP');
    }
  };

  const handleViewUserProfile = (userId) => {
    navigate(`/user/${userId}`);
  };

  const handleNavigateToMap = (location, postId) => {
    navigate('/map', { state: { centerLocation: location, highlightMarkerId: postId ? `post-${postId}` : null } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
        <p className="text-[var(--color-text-secondary)]">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex flex-col items-center justify-center">
        <p className="text-[var(--color-text-secondary)] mb-4">Post not found</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-[var(--color-clay)] text-white rounded-lg hover:bg-[var(--color-clay-dark)] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const author = users[post.authorId];

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Header */}
      <div className="bg-[var(--color-sand-light)] border-b border-[var(--color-warm-gray-300)] sticky top-0 z-10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-[var(--color-warm-gray-200)] rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-[var(--color-text-primary)]">
            {post.title || 'Post'}
          </h1>
        </div>
      </div>

      {/* Post Content */}
      <div className="max-w-2xl mx-auto p-4">
        <Post
          post={post}
          currentUserId={user?.uid}
          author={author}
          onViewUserProfile={handleViewUserProfile}
          onNavigateToMap={handleNavigateToMap}
          onDelete={handleDelete}
          onToggleRSVP={handleToggleRSVP}
          showEditDelete={true}
          compact={false}
        />
      </div>
    </div>
  );
};

export default PostDetail;