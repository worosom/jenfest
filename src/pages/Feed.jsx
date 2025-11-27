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
import GamePost from "../components/GamePost";
import { gamesData } from "../utils/gamesData";

const Feed = ({ onViewUserProfile, onNavigateToMap }) => {
  const { user } = useAuth();
  const { users } = useUsers();
  const { toggleRSVP } = useRSVP();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((post) => {
          // Only show published posts
          return post.published !== false; // Default to true if not set
        });

      // Combine regular posts with hardcoded games
      const allPosts = [...gamesData, ...postsData];

      setPosts(allPosts);
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

  // Filter posts based on active filter
  const filteredPosts = posts.filter((post) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "posts")
      return !post.isActivity && post.postType !== "game";
    if (activeFilter === "activities") return post.isActivity;
    if (activeFilter === "games") return post.postType === "game";
    return true;
  });

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
    <div className="max-w-2xl mx-auto px-4 pb-12 pt-4 space-y-4">
      {/* Filter Tabs */}
      <div className="bg-[var(--color-sand-light)] border border-[var(--color-warm-gray-300)] rounded-lg shadow-lg p-2 sticky top-0 z-10">
        <div className="flex gap-2">
          <FilterTab
            label="All"
            active={activeFilter === "all"}
            onClick={() => setActiveFilter("all")}
            count={posts.length}
          />
          <FilterTab
            label="Posts"
            active={activeFilter === "posts"}
            onClick={() => setActiveFilter("posts")}
            count={
              posts.filter((p) => !p.isActivity && p.postType !== "game").length
            }
          />
          <FilterTab
            label="Activities"
            active={activeFilter === "activities"}
            onClick={() => setActiveFilter("activities")}
            count={posts.filter((p) => p.isActivity).length}
          />
          <FilterTab
            label="Games"
            active={activeFilter === "games"}
            onClick={() => setActiveFilter("games")}
            count={posts.filter((p) => p.postType === "game").length}
          />
        </div>
      </div>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <MessageSquare
            size={48}
            className="text-[var(--color-warm-gray-300)] mb-4"
          />
          <p className="text-[var(--color-text-light)] text-center">
            No {activeFilter === "all" ? "posts" : activeFilter} yet.
          </p>
        </div>
      ) : (
        filteredPosts.map((post) => {
          // Render GamePost for games, regular Post for everything else
          if (post.postType === "game") {
            return (
              <GamePost
                key={post.id}
                post={post}
                currentUserId={user?.uid}
                author={users[post.authorId]}
                onViewUserProfile={onViewUserProfile}
              />
            );
          }

          return (
            <Post
              key={post.id}
              post={post}
              currentUserId={user?.uid}
              author={users[post.authorId]}
              onViewUserProfile={onViewUserProfile}
              onNavigateToMap={onNavigateToMap}
              onDelete={deletePost}
              onToggleRSVP={toggleRSVP}
              showEditDelete={true}
            />
          );
        })
      )}
    </div>
  );
};

// Filter Tab Component
const FilterTab = ({ label, active, onClick, count }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
        active
          ? "bg-[var(--color-clay)] text-white shadow-md"
          : "bg-[var(--color-warm-gray-200)] text-[var(--color-text-secondary)] hover:bg-[var(--color-warm-gray-300)]"
      }`}
    >
      {label}
      {count > 0 && (
        <span
          className={`ml-1 text-xs ${active ? "opacity-90" : "opacity-60"}`}
        >
          ({count})
        </span>
      )}
    </button>
  );
};

export default Feed;

