import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../hooks/useAuth";
import { useUsers } from "../hooks/useUsers";
import { useRSVP } from "../hooks/useRSVP";
import { MapPin, FileText, Loader2, ArrowLeft } from "lucide-react";
import ProfilePicture from "../components/ProfilePicture";
import Post from "../components/Post";
import AttendeesModal from "../components/AttendeesModal";

const UserProfile = ({ onBack, onNavigateToMap }) => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { users } = useUsers();
  const { toggleRSVP } = useRSVP();
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    if (!userId) return;

    setLoadingPosts(true);
    const q = query(
      collection(db, "posts"),
      where("authorId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserPosts(postsData);
      setLoadingPosts(false);
    });

    return unsubscribe;
  }, [userId]);

  if (!userId) return null;

  const userData = users[userId];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-clay)] transition-colors mb-6 font-medium"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      {/* User Info */}
      <div className="bg-[var(--color-sand-light)] border border-[var(--color-warm-gray-300)] rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          <ProfilePicture
            src={userData?.photoURL}
            alt={userData?.displayName || "User"}
            size="lg"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              {userData?.displayName || "Anonymous"}
            </h1>
            {userData?.bio && (
              <p className="text-[var(--color-text-secondary)] mb-1">
                {userData.bio}
              </p>
            )}
            {userData?.campLocation && (
              <button
                onClick={() => onNavigateToMap?.(userData.campLocation)}
                className="flex items-center gap-1 text-sm text-[var(--color-clay)] hover:text-[var(--color-clay-dark)] font-medium transition-colors"
              >
                <MapPin size={16} />
                <span>View camp location</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User's Posts */}
      {loadingPosts ? (
        <div className="text-center py-8">
          <Loader2
            size={32}
            className="mx-auto text-[var(--color-clay)] animate-spin mb-2"
          />
          <p className="text-[var(--color-text-light)]">Loading posts...</p>
        </div>
      ) : userPosts.length === 0 ? (
        <div className="text-center py-8">
          <FileText
            size={48}
            className="mx-auto text-[var(--color-warm-gray-300)] mb-3"
          />
          <p className="text-[var(--color-text-light)]">No posts yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {userPosts.map((post) => (
            <Post
              key={post.id}
              post={post}
              currentUserId={user?.uid}
              author={userData}
              onNavigateToMap={onNavigateToMap}
              onToggleRSVP={toggleRSVP}
              onViewAttendees={setSelectedActivity}
              showEditDelete={false}
            />
          ))}
        </div>
      )}
      
      {/* Attendees Modal */}
      <AttendeesModal
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        attendees={selectedActivity?.attendees || []}
        activityTitle={selectedActivity?.title || selectedActivity?.content}
        onViewUserProfile={onBack}
      />
    </div>
  );
};

export default UserProfile;