import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../hooks/useAuth";
import { useUsers } from "../hooks/useUsers";
import GoogleMapComponent from "../components/Map/GoogleMapComponent";
import ProfilePicture from "../components/ProfilePicture";

const MapView = ({ onViewUserProfile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { users } = useUsers();
  const [markers, setMarkers] = useState(undefined); // Start as undefined to distinguish from empty
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allPosts, setAllPosts] = useState([]);

  // Validate if coordinates are real GPS coordinates (not legacy imaginary map coords)
  const isValidGPSCoordinate = (mapLocation) => {
    if (!mapLocation?.lat || !mapLocation?.lng) return false;
    // Check if coordinates are within reasonable range for Texas
    // Festival is around lat: 30.14, lng: -97.01
    const lat = mapLocation.lat;
    const lng = mapLocation.lng;
    return lat >= 29 && lat <= 31 && lng >= -98 && lng <= -96;
  };

  // Listen to users for camp locations
  useEffect(() => {
    const usersQuery = query(collection(db, "users"));
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllUsers(usersArray);
    });
    return unsubscribe;
  }, []);

  // Listen to posts
  useEffect(() => {
    const postsQuery = query(collection(db, "posts"));
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const postsArray = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((post) => {
          // Only show published posts
          return post.published !== false; // Default to true if not set
        });
      setAllPosts(postsArray);
    });
    return unsubscribe;
  }, []);

  // Rebuild markers when users or posts change
  useEffect(() => {
    const newMarkers = [];

    // User camp markers (only valid GPS coordinates)
    allUsers.forEach((userData) => {
      // Skip invalid/legacy coordinates
      if (
        userData.campLocation &&
        !isValidGPSCoordinate(userData.campLocation)
      ) {
        return;
      }

      if (userData.campLocation?.lat && userData.campLocation?.lng) {
        const userInfo = users[userData.uid];
        const truncatedBio =
          userInfo?.bio && userInfo.bio.length > 120
            ? userInfo.bio.substring(0, 120) + "..."
            : userInfo?.bio;

        newMarkers.push({
          id: `user-${userData.id}`,
          type: "user",
          userId: userData.uid,
          x: userData.campLocation.lng,
          y: userData.campLocation.lat,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#4CAF50" stroke="white" stroke-width="2"/>
                <path d="M12 12c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z M12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="white"/>
              </svg>
            `),
            scaledSize: { width: 32, height: 32 },
            anchor: { x: 16, y: 16 },
          },
          popup: (
            <div className="min-w-[200px]">
              <div className="flex items-center gap-3 mb-2">
                <ProfilePicture
                  src={userInfo?.photoURL}
                  alt={userInfo?.displayName || "User"}
                  size="md"
                />
                <p className="font-semibold text-left">
                  {userInfo?.displayName || "Anonymous"}
                </p>
              </div>
              {truncatedBio && (
                <p className="text-sm text-gray-600 text-left mt-2">
                  {truncatedBio}
                </p>
              )}
            </div>
          ),
        });
      }
    });

    // Post location markers (only valid GPS coordinates)
    allPosts.forEach((post) => {
      if (post.mapLocation && !isValidGPSCoordinate(post.mapLocation)) {
        return;
      }

      if (post.mapLocation?.lat && post.mapLocation?.lng) {
        const authorInfo = users[post.authorId];
        const isActivity = post.isActivity;

        newMarkers.push({
          id: `post-${post.id}`,
          type: isActivity ? "activity" : "post",
          postId: post.id,
          postData: post,
          x: post.mapLocation.lng,
          y: post.mapLocation.lat,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="${isActivity ? "#d97746" : "#a0522d"}" stroke="white" stroke-width="2"/>
                <path d="M12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21L12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" fill="white"/>
              </svg>
            `),
            scaledSize: { width: 32, height: 32 },
            anchor: { x: 16, y: 16 },
          },
          popup: (
            <div className="min-w-[250px] max-w-xs">
              {/* Header with Activity badge */}
              {post.isActivity && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                  <span className="text-xs text-[var(--color-clay)] font-medium flex-shrink-0">
                    Activity
                  </span>
                  {post.scheduledAt && (
                    <p className="text-xs text-gray-600 flex-shrink-0">
                      {post.scheduledAt.toDate().toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              )}

              {post.title && (
                <h4 className="font-bold text-sm text-gray-800 mb-1">
                  {post.title}
                </h4>
              )}

              <p className="text-sm text-gray-700 mb-2">{post.content}</p>

              {/* Author at bottom */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <ProfilePicture
                  src={authorInfo?.photoURL}
                  alt={authorInfo?.displayName || "User"}
                  size="sm"
                />
                <p className="text-xs text-gray-600">
                  {authorInfo?.displayName || "Anonymous"}
                </p>
              </div>
            </div>
          ),
        });
      }
    });

    setMarkers(newMarkers);
  }, [allUsers, allPosts, users, onViewUserProfile]);

  const handleMapClick = (coords) => {
    setSelectedCoords(coords);
    console.log("Clicked coordinates:", coords);
  };

  const handleMarkerClick = (marker) => {
    if (marker.type === "user" && marker.userId) {
      navigate(`/user/${marker.userId}`);
    } else if ((marker.type === "post" || marker.type === "activity") && marker.postId) {
      navigate(`/post/${marker.postId}`);
    }
  };

  // Get center location and highlight marker ID from navigation state
  const centerLocation = location.state?.centerLocation;
  const highlightMarkerId = location.state?.highlightMarkerId;

  return (
    <div className="h-full w-full relative">
      <GoogleMapComponent
        markers={markers}
        onMapClick={handleMapClick}
        onMarkerClick={handleMarkerClick}
        isSelectionMode={false}
        centerLocation={centerLocation}
        highlightMarkerId={highlightMarkerId}
        className="h-[calc(100dvh-8rem)]"
      />

      {selectedCoords && (
        <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg">
          <p className="text-sm font-semibold mb-1">Selected Location:</p>
          <p className="text-xs text-gray-600">
            Lat: {selectedCoords.lat.toFixed(6)}, Lng:{" "}
            {selectedCoords.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapView;