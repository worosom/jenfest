import { useState, useEffect } from "react";
import { MessageCircle, Gamepad2, Maximize2, X } from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { useJENbucks } from "../hooks/useJENbucks";
import ProfilePicture from "./ProfilePicture";
import PostRepliesModal from "./PostRepliesModal";

const GamePost = ({ post, currentUserId, author, onViewUserProfile }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replyCount, setReplyCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { postReactions, userReactions, addReaction } = useJENbucks();

  // Listen to reply count in real-time
  useEffect(() => {
    if (!post?.id) return;

    const repliesRef = collection(db, "replies");
    const q = query(repliesRef, where("postId", "==", post.id));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setReplyCount(snapshot.size);
      },
      (error) => {
        console.error("Error listening to reply count:", error);
      },
    );

    return () => unsubscribe();
  }, [post?.id]);

  return (
    <>
      <div className="bg-[var(--color-sand-light)] border border-[var(--color-warm-gray-300)] rounded-lg shadow-lg px-4 py-4">
        {/* Game Badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-[var(--color-sunset-orange)] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Gamepad2 size={14} />
            GAME
          </div>
        </div>

        {/* Title */}
        {post.title && (
          <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
            {post.title}
          </h3>
        )}

        {/* Content */}
        {post.content && (
          <p className="text-[var(--color-text-secondary)] mb-3">
            {post.content}
          </p>
        )}

        {/* Iframe Container - Responsive */}
        {post.gameType === "iframe" && post.iframeUrl && (
          <div className="my-4">
            <div
              className="relative w-full bg-white rounded-lg overflow-hidden"
              style={{
                paddingBottom: `${((post.iframeHeight || 500) / (post.iframeWidth || 500)) * 100}%`,
                maxWidth: `${post.iframeWidth || 500}px`,
                margin: "0 auto",
              }}
            >
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  border: "3px solid black",
                }}
                frameBorder="0"
                src={post.iframeUrl}
                title={post.title || "Game"}
              />
            </div>
          </div>
        )}

        {/* Author info and Fullscreen button at bottom */}
        <div className="flex items-center justify-between gap-2 py-2 border-t border-[var(--color-warm-gray-300)] mt-3">
          <div className="flex items-center gap-2">
            {author && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewUserProfile?.(post.authorId);
                  }}
                  className="flex-shrink-0"
                >
                  <ProfilePicture
                    src={author?.photoURL}
                    alt={author?.displayName || "User"}
                    size="sm"
                  />
                </button>
                <div className="flex flex-col">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewUserProfile?.(post.authorId);
                    }}
                    className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-clay)] transition-colors font-medium text-left"
                  >
                    {author?.displayName || "Anonymous"}
                  </button>
                  <p className="text-xs text-[var(--color-text-light)]">
                    {post.createdAt?.toLocaleString?.() || ""}
                  </p>
                </div>
              </>
            )}
            {!author && post.authorId === "system" && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[var(--color-clay)] rounded-full flex items-center justify-center">
                  <Gamepad2 size={16} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-[var(--color-text-secondary)] font-medium">
                    Jenfest Esports™
                  </span>
                  <p className="text-xs text-[var(--color-text-light)]">
                    {post.createdAt?.toLocaleDateString?.() || ""}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Fullscreen Button */}
          {post.gameType === "iframe" && post.iframeUrl && (
            <button
              onClick={() => setIsFullscreen(true)}
              className="flex items-center gap-1 px-3 py-2 bg-[var(--color-clay)] text-white rounded-lg hover:bg-[var(--color-clay-dark)] transition-colors text-sm font-medium"
              title="Play fullscreen"
            >
              <Maximize2 size={16} />
              Fullscreen
            </button>
          )}
        </div>

        {/* Reply and JENbucks buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-warm-gray-300)]">
          {/* JENbucks Reaction */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              addReaction(post.id, post.authorId);
            }}
            className="flex items-center gap-1.5 px-2 py-1.5 bg-[var(--color-sunset-orange)] text-white hover:bg-[var(--color-sunset-orange)]/90 rounded-lg transition-colors font-medium"
            title="React with JENbucks"
          >
            <img src="/jenbucks.png" alt="JENbucks" className="w-5 h-5" />
            <span className="text-sm">
              {postReactions[post.id] || 0}
            </span>
            {userReactions[post.id] > 0 && (
              <span className="text-xs opacity-80">
                (You: {userReactions[post.id]})
              </span>
            )}
          </button>

          {/* Replies */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowReplies(true);
            }}
            className="flex items-center gap-1 px-3 py-2 text-[var(--color-clay)] hover:bg-[var(--color-warm-gray-200)] rounded-lg transition-colors"
            title="View replies"
          >
            <MessageCircle size={18} />
            {replyCount > 0 && (
              <span className="text-xs font-semibold">{replyCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Modals */}
      <PostRepliesModal
        isOpen={showReplies}
        onClose={() => setShowReplies(false)}
        post={post}
        onViewUserProfile={onViewUserProfile}
      />

      {/* Fullscreen Modal */}
      {isFullscreen && post.gameType === "iframe" && post.iframeUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4">
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {post.title || "Game"}
              </h2>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 bg-[var(--color-clay)] text-white rounded-full hover:bg-[var(--color-clay-dark)] transition-colors"
                title="Close fullscreen"
              >
                <X size={24} />
              </button>
            </div>

            {/* Game Container */}
            <div className="flex-1 bg-white rounded-lg overflow-hidden">
              <iframe
                className="w-full h-full"
                style={{
                  border: "none",
                }}
                frameBorder="0"
                src={post.iframeUrl}
                title={post.title || "Game"}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GamePost;