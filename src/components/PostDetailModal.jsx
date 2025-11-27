import { X } from 'lucide-react';
import Post from './Post';

const PostDetailModal = ({ isOpen, onClose, post, currentUserId, author, onViewUserProfile, onNavigateToMap, onDelete, onToggleRSVP }) => {
  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-bg-primary)] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-warm-gray-300)] bg-[var(--color-sand-light)]">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            {post.title || 'Post'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-warm-gray-200)] rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <Post
            post={post}
            currentUserId={currentUserId}
            author={author}
            onViewUserProfile={onViewUserProfile}
            onNavigateToMap={onNavigateToMap}
            onDelete={onDelete}
            onToggleRSVP={onToggleRSVP}
            showEditDelete={true}
            compact={false}
          />
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
