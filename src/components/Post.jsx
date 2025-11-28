import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Trash2,
  Edit2,
  MessageCircle,
  X,
  ZoomIn,
} from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { useJENbucks } from "../hooks/useJENbucks";
import ProfilePicture from "./ProfilePicture";
import PostRepliesModal from "./PostRepliesModal";
import AttendeesModal from "./AttendeesModal";
import PostFormModal from "./PostFormModal";

const Post = ({
  post,
  currentUserId,
  author,
  onViewUserProfile,
  onNavigateToMap,
  onDelete,
  onToggleRSVP,
  showEditDelete = true,
  compact = false, // When true, only show title (hide content, media)
  onClick, // Optional click handler for the entire post
}) => {
  const isOwner = post.authorId === currentUserId;
  const [showReplies, setShowReplies] = useState(false);
  const [showAttendees, setShowAttendees] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [replyCount, setReplyCount] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
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
      <div
        className={`bg-[var(--color-sand-light)] border border-[var(--color-warm-gray-300)] rounded-lg shadow-lg px-4 py-1 ${onClick ? "cursor-pointer hover:shadow-xl transition-shadow" : ""}`}
        onClick={onClick}
      >
        {/* Header with scheduled date/time and Location button */}
        <div className="flex items-start justify-between gap-2 my-2">
          {/* Scheduled date/time for activities */}
          {post.isActivity && post.scheduledAt ? (
            <div className="flex items-center gap-1 text-[var(--color-clay)] text-sm font-medium">
              <Calendar size={16} />
              <span>
                {post.scheduledAt.toDate().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ) : (
            <div></div>
          )}

          {/* Location button in top right */}
          {post.mapLocation && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToMap?.(post.mapLocation, post.id);
              }}
              className="text-sm text-[var(--color-clay)] hover:text-[var(--color-clay-dark)] flex items-center gap-1 font-medium transition-colors flex-shrink-0"
            >
              <MapPin size={14} />
              <span>View location</span>
            </button>
          )}
        </div>

        {/* Title/Content */}
        <div className="mb-3">
          {post.title && (
            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
              {post.title}
            </h3>
          )}
          {!compact && (
            <p className="text-[var(--color-text-secondary)]">{post.content}</p>
          )}
        </div>

        {!compact && post.media && post.media.length > 0 && (
          <div className="relative rounded-lg overflow-hidden mb-3 group">
            <img
              src={post.media[0].url}
              alt="Post media"
              className="w-full max-h-[400px] object-contain cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowLightbox(true);
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLightbox(true);
              }}
              className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              title="View full size"
            >
              <ZoomIn size={20} />
            </button>
          </div>
        )}

        {/* Author info at bottom - only show if not compact */}
        {!compact && (
          <div className="flex items-center justify-between gap-2 py-2 border-t border-[var(--color-warm-gray-300)]">
            <div className="flex items-center gap-2">
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
                  {post.createdAt?.toDate().toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {showEditDelete && isOwner && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEditModal(true);
                    }}
                    className="p-2 text-[var(--color-lake)] hover:bg-[var(--color-warm-gray-200)] rounded-lg transition-colors"
                    title="Edit post"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(post.id);
                    }}
                    className="p-2 text-[var(--color-sunset-red)] hover:bg-[var(--color-warm-gray-200)] rounded-lg transition-colors"
                    title="Delete post"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Activity RSVP Section */}
        {post.isActivity && (
          <div className="flex items-center justify-between pt-3 mb-2 border-t border-[var(--color-warm-gray-300)]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAttendees(true);
              }}
              className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-clay)] transition-colors font-medium"
            >
              <Users size={16} />
              <span>{post.attendees?.length || 0} attending</span>
            </button>
            <div className="flex items-center gap-2">
              {currentUserId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleRSVP?.(post);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    post.attendees?.includes(currentUserId)
                      ? "bg-[var(--color-clay-light)] text-[var(--color-leather-dark)] hover:bg-[var(--color-clay)]"
                      : "bg-[var(--color-warm-gray-200)] text-[var(--color-text-secondary)] hover:bg-[var(--color-warm-gray-300)]"
                  }`}
                >
                  {post.attendees?.includes(currentUserId)
                    ? "Attending"
                    : "Join"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Reply and JENbucks buttons (for all posts) */}
        {!compact && (
          <div className="flex items-center justify-between pt-3 mb-2 border-t border-[var(--color-warm-gray-300)]">
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
        )}
      </div>

      {/* Modals - Always rendered with the Post */}
      <PostRepliesModal
        isOpen={showReplies}
        onClose={() => setShowReplies(false)}
        post={post}
        onViewUserProfile={onViewUserProfile}
      />

      {post.isActivity && (
        <AttendeesModal
          isOpen={showAttendees}
          onClose={() => setShowAttendees(false)}
          attendees={post.attendees || []}
          activityTitle={post.title || post.content}
          onViewUserProfile={onViewUserProfile}
        />
      )}

      {showEditDelete && isOwner && (
        <PostFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          post={post}
        />
      )}

      {/* Lightbox for full-size image */}
      {showLightbox && post.media && post.media.length > 0 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            title="Close"
          >
            <X size={24} />
          </button>
          <img
            src={post.media[0].url}
            alt="Post media"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default Post;