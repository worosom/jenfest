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
import { MessageSquare, ArrowUpDown, ChevronDown, Home, Calendar, Gamepad2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useUsers } from "../hooks/useUsers";
import { useRSVP } from "../hooks/useRSVP";
import { useJENbucks } from "../hooks/useJENbucks";
import Post from "../components/Post";
import GamePost from "../components/GamePost";
import { gamesData } from "../utils/gamesData";

const Feed = ({ onViewUserProfile, onNavigateToMap }) => {
  const { user } = useAuth();
  const { users } = useUsers();
  const { toggleRSVP } = useRSVP();
  const { postReactions } = useJENbucks();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const [replyCounts, setReplyCounts] = useState({});

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

      // Combine regular posts with hardcoded games and sort by timestamp
      const allPosts = [...gamesData, ...postsData].sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt;
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt;
        return dateB - dateA; // Sort descending (newest first)
      });

      setPosts(allPosts);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Listen to all replies to track counts per post
  useEffect(() => {
    const repliesRef = collection(db, "replies");
    const unsubscribe = onSnapshot(repliesRef, (snapshot) => {
      const counts = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (!counts[data.postId]) {
          counts[data.postId] = 0;
        }
        counts[data.postId]++;
      });
      setReplyCounts(counts);
    });

    return () => unsubscribe();
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

  // Sort posts based on sortBy state
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "recent") {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt;
      return dateB - dateA; // Newest first
    } else if (sortBy === "jenbucks") {
      const reactionsA = postReactions[a.id] || 0;
      const reactionsB = postReactions[b.id] || 0;
      return reactionsB - reactionsA; // Most JENbucks first
    } else if (sortBy === "replies") {
      const repliesA = replyCounts[a.id] || 0;
      const repliesB = replyCounts[b.id] || 0;
      return repliesB - repliesA; // Most replies first
    }
    return 0;
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

  const sortLabels = {
    recent: "Recent",
    jenbucks: "JENbucks",
    replies: "Replies",
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-12 pt-4 space-y-4">
      {/* Filter Tabs */}
      <div className="bg-[var(--color-sand-light)] border border-[var(--color-warm-gray-300)] rounded-lg shadow-lg p-2 sticky top-0 z-10">
        <div className="flex gap-2">
          <FilterTab
            label="All"
            icon={<Home size={18} />}
            active={activeFilter === "all"}
            onClick={() => setActiveFilter("all")}
            count={posts.length}
          />
          <FilterTab
            label="Posts"
            icon={<MessageSquare size={18} />}
            active={activeFilter === "posts"}
            onClick={() => setActiveFilter("posts")}
            count={
              posts.filter((p) => !p.isActivity && p.postType !== "game").length
            }
          />
          <FilterTab
            label="Activities"
            icon={<Calendar size={18} />}
            active={activeFilter === "activities"}
            onClick={() => setActiveFilter("activities")}
            count={posts.filter((p) => p.isActivity).length}
          />
          <FilterTab
            label="Games"
            icon={<Gamepad2 size={18} />}
            active={activeFilter === "games"}
            onClick={() => setActiveFilter("games")}
            count={posts.filter((p) => p.postType === "game").length}
          />
          
          {/* Sort Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="h-full flex items-center gap-1 px-3 py-2 rounded-lg font-medium text-sm bg-white border border-[var(--color-warm-gray-300)] text-[var(--color-text-secondary)] hover:bg-[var(--color-warm-gray-100)] transition-all"
            >
              <ArrowUpDown size={18} />
              <span className="hidden sm:inline">{sortLabels[sortBy]}</span>
              <ChevronDown size={16} />
            </button>
            
            {/* Dropdown Menu */}
            {sortDropdownOpen && (
              <div className="absolute right-0 mt-1 bg-white border border-[var(--color-warm-gray-300)] rounded-lg shadow-lg overflow-hidden z-20 min-w-[140px]">
                <button
                  onClick={() => {
                    setSortBy("recent");
                    setSortDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-warm-gray-100)] transition-colors ${
                    sortBy === "recent"
                      ? "bg-[var(--color-sunset-orange)] text-white hover:bg-[var(--color-sunset-orange)]"
                      : "text-[var(--color-text-secondary)]"
                  }`}
                >
                  Recent
                </button>
                <button
                  onClick={() => {
                    setSortBy("jenbucks");
                    setSortDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-warm-gray-100)] transition-colors ${
                    sortBy === "jenbucks"
                      ? "bg-[var(--color-sunset-orange)] text-white hover:bg-[var(--color-sunset-orange)]"
                      : "text-[var(--color-text-secondary)]"
                  }`}
                >
                  JENbucks
                </button>
                <button
                  onClick={() => {
                    setSortBy("replies");
                    setSortDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-warm-gray-100)] transition-colors ${
                    sortBy === "replies"
                      ? "bg-[var(--color-sunset-orange)] text-white hover:bg-[var(--color-sunset-orange)]"
                      : "text-[var(--color-text-secondary)]"
                  }`}
                >
                  Replies
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Posts List */}
      {sortedPosts.length === 0 ? (
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
        sortedPosts.map((post) => {
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
const FilterTab = ({ label, icon, active, onClick, count }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1.5 ${
        active
          ? "bg-[var(--color-clay)] text-white shadow-md"
          : "bg-[var(--color-warm-gray-200)] text-[var(--color-text-secondary)] hover:bg-[var(--color-warm-gray-300)]"
      }`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="hidden sm:inline">{label}</span>
      {count > 0 && (
        <span
          className={`hidden sm:inline text-xs ${active ? "opacity-90" : "opacity-60"}`}
        >
          ({count})
        </span>
      )}
    </button>
  );
};

export default Feed;