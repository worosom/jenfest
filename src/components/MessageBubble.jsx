import { Trash2 } from 'lucide-react';
import ProfilePicture from './ProfilePicture';

const MessageBubble = ({
  message,
  isCurrentUser,
  author,
  onViewUserProfile,
  onDelete,
  showAuthorName = false,
  readByUsers = [],
}) => {
  return (
    <div className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
      <button
        onClick={() => onViewUserProfile?.(message.authorId || message.senderId)}
        className="flex-shrink-0"
      >
        <ProfilePicture
          src={author?.photoURL}
          alt={author?.displayName || 'User'}
          size="sm"
        />
      </button>
      <div className={`flex-1 ${isCurrentUser ? 'flex justify-end' : ''}`}>
        <div className={`inline-flex flex-col gap-1 max-w-[75%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          <div className={`inline-flex items-start gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
            <div
              className={`${
                isCurrentUser
                  ? 'bg-[var(--color-clay)] text-white'
                  : 'bg-white border border-[var(--color-warm-gray-300)]'
              } rounded-lg p-3`}
            >
              {showAuthorName && !isCurrentUser && (
                <button
                  onClick={() => onViewUserProfile?.(message.authorId || message.senderId)}
                  className="text-xs font-semibold mb-1 hover:underline block"
                  style={{
                    color: 'var(--color-clay)',
                  }}
                >
                  {author?.displayName || 'Anonymous'}
                </button>
              )}
              <p
                className={`text-sm ${
                  isCurrentUser ? 'text-white' : 'text-[var(--color-text-primary)]'
                }`}
              >
                {message.content}
              </p>
              <p
                className="text-xs mt-1"
                style={{
                  color: isCurrentUser
                    ? 'rgba(255, 255, 255, 0.7)'
                    : 'var(--color-text-light)',
                }}
              >
                {message.createdAt?.toDate().toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {isCurrentUser && onDelete && (
              <button
                onClick={() => onDelete(message.id)}
                className="p-1 text-[var(--color-sunset-red)] hover:bg-[var(--color-warm-gray-200)] rounded transition-colors flex-shrink-0"
                title="Delete message"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          
          {/* Read receipts - only show for current user's messages */}
          {isCurrentUser && readByUsers.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex -space-x-2">
                {readByUsers.slice(0, 3).map((readByUser) => (
                  <button
                    key={readByUser.uid}
                    onClick={() => onViewUserProfile?.(readByUser.uid)}
                    className="relative"
                    title={`Seen by ${readByUser.displayName || 'Anonymous'}`}
                  >
                    <ProfilePicture
                      src={readByUser.photoURL}
                      alt={readByUser.displayName || 'User'}
                      size="xs"
                      className="ring-2 ring-white"
                    />
                  </button>
                ))}
              </div>
              {readByUsers.length > 3 && (
                <span className="text-xs text-[var(--color-text-light)] ml-1">
                  +{readByUsers.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;