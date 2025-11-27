import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import {
  MapPin,
  FileText,
  Loader2,
  ArrowLeft,
  Calendar,
  MessageCircle,
} from "lucide-react";
import ProfilePicture from "../components/ProfilePicture";
import Post from "../components/Post";
import ConversationModal from "../components/ConversationModal";

const UserProfile = ({ onBack, onNavigateToMap }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { users } = useUsers();
  const { toggleRSVP } = useRSVP();
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [rsvpActivities, setRsvpActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [showConversation, setShowConversation] = useState(false);

  useEffect(() => {
    if (!userId) return;

    setLoadingPosts(true);
    const q = query(
      collection(db, "posts"),
      where("authorId", "==", userId),
      orderBy("createdAt", "desc"),
    );

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
      setUserPosts(postsData);
      setLoadingPosts(false);
    });

    return unsubscribe;
  }, [userId]);

  // Load activities user has RSVP'd to
  useEffect(() => {
    if (!userId) return;

    setLoadingActivities(true);
    const q = query(
      collection(db, "posts"),
      where("isActivity", "==", true),
      where("attendees", "array-contains", userId),
      orderBy("scheduledAt", "asc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activitiesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRsvpActivities(activitiesData);
      setLoadingActivities(false);
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
            <div className="flex items-center gap-4 mt-2">
              {userData?.campLocation?.lat &&
                userData?.campLocation?.lng &&
                userData.campLocation.lat >= 29 &&
                userData.campLocation.lat <= 31 &&
                userData.campLocation.lng >= -98 &&
                userData.campLocation.lng <= -96 && (
                  <button
                    onClick={() => onNavigateToMap?.(userData.campLocation)}
                    className="flex items-center gap-1 text-sm text-[var(--color-clay)] hover:text-[var(--color-clay-dark)] font-medium transition-colors"
                  >
                    <MapPin size={16} />
                    <span>View camp location</span>
                  </button>
                )}
              {user && user.uid !== userId && (
                <button
                  onClick={() => setShowConversation(true)}
                  className="flex items-center gap-1 text-sm text-[var(--color-clay)] hover:text-[var(--color-clay-dark)] font-medium transition-colors"
                >
                  <MessageCircle size={16} />
                  <span>Send Message</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RSVP'd Activities Section */}
      <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
        <Calendar size={20} />
        RSVP'd Activities
      </h2>

      {loadingActivities ? (
        <div className="text-center py-8 text-[var(--color-text-light)]">
          Loading activities...
        </div>
      ) : rsvpActivities.length === 0 ? (
        <div className="text-center py-8">
          <Calendar
            size={48}
            className="mx-auto text-[var(--color-warm-gray-300)] mb-3"
          />
          <p className="text-[var(--color-text-light)]">No RSVP'd activities</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rsvpActivities.map((activity) => (
            <Post
              key={activity.id}
              post={activity}
              currentUserId={user?.uid}
              author={users[activity.authorId]}
              onViewUserProfile={onBack}
              onNavigateToMap={onNavigateToMap}
              onToggleRSVP={toggleRSVP}
              showEditDelete={false}
              compact={true}
              onClick={() => navigate(`/post/${activity.id}`)}
            />
          ))}
        </div>
      )}

      {/* User's Posts */}
      {/* RSVP'd Activities Section */}
      <h2 className="text-xl font-bold text-[var(--color-text-primary)] my-4 flex items-center gap-2">
        Posts
      </h2>
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
              onViewUserProfile={onBack}
              onNavigateToMap={onNavigateToMap}
              onToggleRSVP={toggleRSVP}
              showEditDelete={false}
              compact={true}
              onClick={() => navigate(`/post/${post.id}`)}
            />
          ))}
        </div>
      )}

      {/* Conversation Modal */}
      <ConversationModal
        isOpen={showConversation}
        onClose={() => setShowConversation(false)}
        recipientId={userId}
        onViewUserProfile={onBack}
      />
    </div>
  );
};

export default UserProfile;