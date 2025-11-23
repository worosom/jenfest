import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Calendar as CalendarIcon, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';
import AttendeesModal from '../components/AttendeesModal';

const Schedule = ({ onViewUserProfile }) => {
  const { user } = useAuth();
  const { users } = useUsers();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      where('isActivity', '==', true),
      orderBy('scheduledAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activitiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
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

  const toggleRSVP = async (activity) => {
    if (!user) return;
    
    try {
      const activityRef = doc(db, 'posts', activity.id);
      if (activity.attendees.includes(user.uid)) {
        await updateDoc(activityRef, { attendees: arrayRemove(user.uid) });
      } else {
        await updateDoc(activityRef, { attendees: arrayUnion(user.uid) });
      }
    } catch (error) {
      console.error('Error toggling RSVP:', error);
    }
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
    <>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {Object.entries(groupedActivities).map(([day, dayActivities]) => (
        <div key={day} className="mb-8">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4 sticky top-0 bg-[var(--color-bg-primary)] py-2">
            {day}
          </h2>
          <div className="space-y-3">
            {dayActivities.map(activity => (
              <div key={activity.id} className="bg-[var(--color-sand-light)] border border-[var(--color-warm-gray-300)] rounded-lg shadow-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    {activity.title ? (
                      <>
                        <h3 className="font-bold text-[var(--color-text-primary)] text-lg">{activity.title}</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">{activity.content}</p>
                      </>
                    ) : (
                      <h3 className="font-semibold text-[var(--color-text-primary)]">{activity.content}</h3>
                    )}
                  </div>
                  <span className="text-sm text-[var(--color-sunset-orange)] font-medium ml-2 flex-shrink-0">
                    {activity.scheduledAt?.toDate().toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-light)] mb-3">
                  by {users[activity.authorId]?.displayName || 'Anonymous'}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--color-warm-gray-300)]">
                  <button
                    onClick={() => setSelectedActivity(activity)}
                    className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-clay)] transition-colors font-medium"
                  >
                    <Users size={16} />
                    <span>{activity.attendees?.length || 0} attending</span>
                  </button>
                  <button
                    onClick={() => toggleRSVP(activity)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      activity.attendees?.includes(user?.uid)
                        ? 'bg-[var(--color-clay-light)] text-[var(--color-leather-dark)] hover:bg-[var(--color-clay)]'
                        : 'bg-[var(--color-warm-gray-200)] text-[var(--color-text-secondary)] hover:bg-[var(--color-warm-gray-300)]'
                    }`}
                  >
                    {activity.attendees?.includes(user?.uid) ? 'Attending' : 'Join'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        ))}
      </div>

      {/* Attendees Modal */}
      <AttendeesModal
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        attendees={selectedActivity?.attendees || []}
        activityTitle={selectedActivity?.content}
        onViewUserProfile={onViewUserProfile}
      />
    </>
  );
};

export default Schedule;