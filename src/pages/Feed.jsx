import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { MessageSquare } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useUsers } from "../hooks/useUsers";
import { useRSVP } from "../hooks/useRSVP";
import Post from "../components/Post";
import AttendeesModal from "../components/AttendeesModal";
import PostFormModal from "../components/PostFormModal";

const Feed = ({ onViewUserProfile, onNavigateToMap }) => {
  const { user } = useAuth();
  const { users } = useUsers();
  const { toggleRSVP } = useRSVP();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
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

  const deletePost = async (postId) => {
    if (!user) return;

    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "posts", postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Error deleting post. Please try again.");
    }
  };

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 px-4">
        <MessageSquare
          size={48}
          className="text-[var(--color-warm-gray-300)] mb-4"
        />
        <p className="text-[var(--color-text-light)] text-center">
          No posts yet. Be the first to share!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            currentUserId={user?.uid}
            author={users[post.authorId]}
            onViewUserProfile={onViewUserProfile}
            onNavigateToMap={onNavigateToMap}
            onEdit={setEditingPost}
            onDelete={deletePost}
            onToggleRSVP={toggleRSVP}
            onViewAttendees={setSelectedActivity}
            showEditDelete={true}
          />
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
      <PostFormModal
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        post={editingPost}
      />
    </>
  );
};

export default Feed;