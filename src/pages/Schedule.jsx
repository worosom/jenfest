import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';
import Post from '../components/Post';

const Schedule = ({ onViewUserProfile }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { users } = useUsers();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      where('isActivity', '==', true),
      orderBy('scheduledAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activitiesData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((post) => {
          // Only show published posts
          return post.published !== false; // Default to true if not set
        });
      setActivities(activitiesData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-[var(--color-text-light)]">Loading schedule...</div>
      </div>
    );
  }

  const handleToggleRSVP = async (activity) => {
    if (!user) return;
    
    try {
      const activityRef = doc(db, 'posts', activity.id);
      const isAttending = activity.attendees?.includes(user.uid);
      
      await updateDoc(activityRef, {
        attendees: isAttending ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (error) {
      console.error('Error toggling RSVP:', error);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await deleteDoc(doc(db, 'posts', postId));
      } catch (error) {
        console.error('Error deleting activity:', error);
        alert('Failed to delete activity');
      }
    }
  };

  const handleNavigateToMap = (location, postId) => {
    navigate('/map', { state: { centerLocation: location, highlightMarkerId: postId ? `post-${postId}` : null } });
  };

  const handleActivityClick = (activityId) => {
    navigate(`/post/${activityId}`);
  };

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 px-4">
        <CalendarIcon size={48} className="text-[var(--color-warm-gray-300)] mb-4" />
        <p className="text-[var(--color-text-light)] text-center">No activities scheduled yet</p>
      </div>
    );
  }

  // Group activities by day
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = activity.scheduledAt?.toDate();
    const dayKey = date?.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    }) || 'Unscheduled';
    
    if (!groups[dayKey]) {
      groups[dayKey] = [];
    }
    groups[dayKey].push(activity);
    return groups;
  }, {});

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {Object.entries(groupedActivities).map(([day, dayActivities]) => (
        <div key={day} className="mb-8">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4 sticky top-0 bg-[var(--color-bg-primary)] py-2">
            {day}
          </h2>
          <div className="space-y-3">
            {dayActivities.map(activity => {
              const author = users[activity.authorId];
              return (
                <Post
                  key={activity.id}
                  post={activity}
                  currentUserId={user?.uid}
                  author={author}
                  onViewUserProfile={onViewUserProfile}
                  onNavigateToMap={handleNavigateToMap}
                  onDelete={handleDelete}
                  onToggleRSVP={handleToggleRSVP}
                  showEditDelete={true}
                  compact={true}
                  onClick={() => handleActivityClick(activity.id)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Schedule;