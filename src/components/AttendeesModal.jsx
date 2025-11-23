import { X, Users as UsersIcon } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import ProfilePicture from './ProfilePicture';

const AttendeesModal = ({ isOpen, onClose, attendees, activityTitle, onViewUserProfile }) => {
  const { users } = useUsers();

  if (!isOpen) return null;

  const attendeesList = attendees || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-sand-light)] border-2 border-[var(--color-leather)] rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-warm-gray-300)]">
          <div className="flex items-center gap-2">
            <UsersIcon size={20} className="text-[var(--color-clay)]" />
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
              {attendeesList.length} {attendeesList.length === 1 ? 'Person' : 'People'} Attending
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-warm-gray-200)] rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Activity Title */}
        {activityTitle && (
          <div className="px-4 py-3 bg-[var(--color-warm-gray-100)] border-b border-[var(--color-warm-gray-300)]">
            <p className="text-sm text-[var(--color-text-secondary)]">{activityTitle}</p>
          </div>
        )}

        {/* Attendees List */}
        <div className="flex-1 overflow-y-auto">
          {attendeesList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <UsersIcon size={48} className="text-[var(--color-warm-gray-300)] mb-3" />
              <p className="text-[var(--color-text-light)] text-center">No one is attending yet</p>
              <p className="text-sm text-[var(--color-text-light)] text-center mt-1">
                Be the first to RSVP!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-warm-gray-300)]">
              {attendeesList.map((attendeeId) => {
                const attendee = users[attendeeId];
                return (
                  <button
                    key={attendeeId}
                    onClick={() => {
                      onViewUserProfile?.(attendeeId);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 p-4 hover:bg-[var(--color-warm-gray-100)] transition-colors text-left"
                  >
                    <ProfilePicture
                      src={attendee?.photoURL}
                      alt={attendee?.displayName || 'User'}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--color-text-primary)] truncate hover:text-[var(--color-clay)] transition-colors">
                        {attendee?.displayName || 'Anonymous'}
                      </p>
                      {attendee?.bio && (
                        <p className="text-sm text-[var(--color-text-secondary)] truncate">
                          {attendee.bio}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--color-warm-gray-300)] p-4">
          <button
            onClick={onClose}
            className="w-full bg-[var(--color-warm-gray-200)] text-[var(--color-text-secondary)] py-2 px-4 rounded-lg hover:bg-[var(--color-warm-gray-300)] transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendeesModal;