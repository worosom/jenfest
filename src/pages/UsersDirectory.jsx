import { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { Users as UsersIcon, Search, MapPin } from 'lucide-react';
import ProfilePicture from '../components/ProfilePicture';

const UsersDirectory = ({ onViewUserProfile }) => {
  const { users, loading } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-[var(--color-text-light)]">Loading users...</div>
      </div>
    );
  }

  // Convert users object to array and filter by search term
  const usersArray = Object.entries(users).map(([uid, userData]) => ({
    uid,
    ...userData
  }));

  const filteredUsers = usersArray.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.displayName?.toLowerCase().includes(searchLower) ||
      user.bio?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
            <UsersIcon size={28} />
            Festival Attendees
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            {usersArray.length} {usersArray.length === 1 ? 'person' : 'people'} at the festival
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-warm-gray-600)]" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or bio..."
              className="w-full pl-10 pr-4 py-3 border border-[var(--color-warm-gray-300)] bg-white rounded-lg focus:ring-2 focus:ring-[var(--color-clay)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon size={48} className="mx-auto text-[var(--color-warm-gray-300)] mb-3" />
            <p className="text-[var(--color-text-light)]">
              {searchTerm ? 'No users found matching your search' : 'No users yet'}
            </p>
          </div>
        ) : (
          <div className="bg-[var(--color-sand-light)] border border-[var(--color-warm-gray-300)] rounded-lg shadow-lg divide-y divide-[var(--color-warm-gray-300)]">
            {filteredUsers.map((user) => (
              <button
                key={user.uid}
                onClick={() => onViewUserProfile?.(user.uid)}
                className="w-full flex items-center gap-4 p-4 hover:bg-[var(--color-warm-gray-100)] transition-colors text-left"
              >
                <ProfilePicture
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--color-text-primary)] text-lg truncate">
                    {user.displayName || 'Anonymous'}
                  </h3>
                  {user.bio && (
                    <p className="text-sm text-[var(--color-text-secondary)] truncate">
                      {user.bio}
                    </p>
                  )}
                </div>
                {user.campLocation && (
                  <div className="flex items-center gap-1 text-xs text-[var(--color-clay)] flex-shrink-0 font-medium">
                    <MapPin size={14} />
                    <span className="hidden sm:inline">Camp Location Set</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default UsersDirectory;