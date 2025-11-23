import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUsers } from '../hooks/useUsers';
import MapComponent from '../components/Map/MapComponent';
import ProfilePicture from '../components/ProfilePicture';
import createCustomIcon from '../components/Map/CustomMarker';

const MapView = ({ onViewUserProfile }) => {
  const { users } = useUsers();
  const [markers, setMarkers] = useState([]);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allPosts, setAllPosts] = useState([]);

  // Festival map configuration
  const mapImage = '/map.jpg';
  const imageWidth = 1348;
  const imageHeight = 1102;

  // Listen to users for camp locations
  useEffect(() => {
    const usersQuery = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersArray = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllUsers(usersArray);
    });
    return unsubscribe;
  }, []);

  // Listen to posts
  useEffect(() => {
    const postsQuery = query(collection(db, 'posts'));
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const postsArray = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllPosts(postsArray);
    });
    return unsubscribe;
  }, []);

  // Rebuild markers when users or posts change
  useEffect(() => {
    const newMarkers = [];

    // User camp markers
    allUsers.forEach(userData => {
      if (userData.campLocation) {
        const userInfo = users[userData.uid];
        const truncatedBio = userInfo?.bio && userInfo.bio.length > 120 
          ? userInfo.bio.substring(0, 120) + '...' 
          : userInfo?.bio;
        
        newMarkers.push({
          id: `user-${userData.id}-${userInfo?.photoURL}`,
          type: 'user',
          x: userData.campLocation.x,
          y: userData.campLocation.y,
          icon: createCustomIcon('user'),
          popup: (
            <div className="min-w-[200px]">
              <button
                onClick={() => onViewUserProfile?.(userData.uid)}
                className="w-full hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-3 mb-2">
                  <ProfilePicture 
                    src={userInfo?.photoURL} 
                    alt={userInfo?.displayName || 'User'}
                    size="md"
                  />
                  <p className="font-semibold hover:text-purple-600 transition-colors text-left">
                    {userInfo?.displayName || 'Anonymous'}
                  </p>
                </div>
                {truncatedBio && (
                  <p className="text-sm text-gray-600 text-left mt-2">
                    {truncatedBio}
                  </p>
                )}
              </button>
            </div>
          )
        });
      }
    });

    // Post location markers
    allPosts.forEach(post => {
      if (post.mapLocation) {
        const authorInfo = users[post.authorId];
        const markerType = post.isActivity ? 'activity' : 'post';
        newMarkers.push({
          id: `post-${post.id}-${authorInfo?.photoURL}`,
          type: markerType,
          x: post.mapLocation.x,
          y: post.mapLocation.y,
          icon: createCustomIcon(markerType),
          popup: (
            <div className="min-w-[250px] max-w-xs">
              {/* Header with timestamp */}
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b">
                {post.isActivity ? (
                  <span className="text-xs text-purple-600 font-medium flex-shrink-0">Activity</span>
                ) : (
                  <div></div>
                )}
                <p className="text-xs text-gray-400 flex-shrink-0">
                  {post.createdAt?.toDate().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {post.isActivity && post.scheduledAt && (
                <p className="text-xs text-gray-600 mb-2">
                  {post.scheduledAt.toDate().toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
              )}

              {post.title && (
                <h4 className="font-bold text-sm text-gray-800 mb-1">{post.title}</h4>
              )}

              <p className="text-sm text-gray-700 mb-2">{post.content}</p>

              {/* Author at bottom */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <ProfilePicture 
                  src={authorInfo?.photoURL} 
                  alt={authorInfo?.displayName || 'User'}
                  size="sm"
                />
                <p className="text-xs text-gray-600">
                  {authorInfo?.displayName || 'Anonymous'}
                </p>
              </div>
            </div>
          )
        });
      }
    });

    setMarkers(newMarkers);
  }, [allUsers, allPosts, users]);

  const handleMapClick = (coords) => {
    setSelectedCoords(coords);
    console.log('Clicked coordinates:', coords);
  };

  return (
    <div className="h-full w-full relative">
      <MapComponent
        mapImage={mapImage}
        imageWidth={imageWidth}
        imageHeight={imageHeight}
        markers={markers}
        onMapClick={handleMapClick}
        isSelectionMode={false}
        className="h-[calc(100dvh-8rem)]"
      />
      
      {selectedCoords && (
        <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg">
          <p className="text-sm font-semibold mb-1">Selected Location:</p>
          <p className="text-xs text-gray-600">
            X: {Math.round(selectedCoords.x)}, Y: {Math.round(selectedCoords.y)}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapView;