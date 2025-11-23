import { Calendar, MapPin, Users, Trash2, Edit2 } from "lucide-react";
import ProfilePicture from "./ProfilePicture";

const Post = ({
  post,
  currentUserId,
  author,
  onViewUserProfile,
  onNavigateToMap,
  onEdit,
  onDelete,
  onToggleRSVP,
  onViewAttendees,
  showEditDelete = true,
}) => {
  const isOwner = post.authorId === currentUserId;

  return (
    <div className="bg-[var(--color-sand-light)] border border-[var(--color-warm-gray-300)] rounded-lg shadow-lg p-4">
      {/* Header with Activity badge and Location button */}
      <div className="flex items-start justify-between gap-2 mb-2">
        {/* Activity badge if applicable */}
        {post.isActivity && (
          <div className="flex items-center gap-1 text-[var(--color-clay)] text-sm font-medium">
            <Calendar size={16} />
            <span>Activity</span>
          </div>
        )}

        {/* Spacer if no activity badge */}
        {!post.isActivity && <div></div>}

        {/* Location button in top right */}
        {post.mapLocation && (
          <button
            onClick={() => onNavigateToMap?.(post.mapLocation)}
            className="text-sm text-[var(--color-clay)] hover:text-[var(--color-clay-dark)] flex items-center gap-1 font-medium transition-colors flex-shrink-0"
          >
            <MapPin size={14} />
            <span>View location</span>
          </button>
        )}
      </div>

      {post.isActivity && post.scheduledAt && (
        <div className="mb-2 text-sm text-[var(--color-text-secondary)] flex items-center gap-1">
          <Calendar size={14} />
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
      )}

      {/* Title/Content with timestamp */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {post.title && (
            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
              {post.title}
            </h3>
          )}
          <p className="text-[var(--color-text-secondary)]">{post.content}</p>
        </div>
        <p className="text-xs text-[var(--color-text-light)] whitespace-nowrap flex-shrink-0">
          {post.createdAt?.toDate().toLocaleString()}
        </p>
      </div>

      {post.media && post.media.length > 0 && (
        <div className="rounded-lg overflow-hidden mb-3">
          <img src={post.media[0].url} alt="Post media" className="w-full" />
        </div>
      )}

      {/* Author info at bottom */}
      <div className="flex items-center justify-between gap-2 py-2 border-t border-[var(--color-warm-gray-300)]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewUserProfile?.(post.authorId)}
            className="flex-shrink-0"
          >
            <ProfilePicture
              src={author?.photoURL}
              alt={author?.displayName || "User"}
              size="sm"
            />
          </button>
          <button
            onClick={() => onViewUserProfile?.(post.authorId)}
            className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-clay)] transition-colors font-medium"
          >
            {author?.displayName || "Anonymous"}
          </button>
        </div>
        {showEditDelete && isOwner && (
          <div className="flex gap-1">
            <button
              onClick={() => onEdit?.(post)}
              className="p-2 text-[var(--color-lake)] hover:bg-[var(--color-warm-gray-200)] rounded-lg transition-colors"
              title="Edit post"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => onDelete?.(post.id)}
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
            onClick={() => onViewAttendees?.(post)}
            className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-clay)] transition-colors font-medium"
          >
            <Users size={16} />
            <span>{post.attendees?.length || 0} attending</span>
          </button>
          {currentUserId && (
            <button
              onClick={() => onToggleRSVP?.(post)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                post.attendees?.includes(currentUserId)
                  ? "bg-[var(--color-clay-light)] text-[var(--color-leather-dark)] hover:bg-[var(--color-clay)]"
                  : "bg-[var(--color-warm-gray-200)] text-[var(--color-text-secondary)] hover:bg-[var(--color-warm-gray-300)]"
              }`}
            >
              {post.attendees?.includes(currentUserId) ? "Attending" : "Join"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Post;