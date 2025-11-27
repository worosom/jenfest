import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, collection, query, where, orderBy, onSnapshot, deleteDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { useRSVP } from '../hooks/useRSVP';
import { MapPin, Save, Camera, Loader2, FileText, AlertTriangle, Trash2, Calendar } from 'lucide-react';
import GoogleMapComponent from '../components/Map/GoogleMapComponent';
import ProfilePicture from '../components/ProfilePicture';
import Post from '../components/Post';

const Profile = ({ onNavigateToMap }) => {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();
  const { toggleRSVP } = useRSVP();
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoURL, setPhotoURL] = useState('');
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rsvpActivities, setRsvpActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const fileInputRef = useRef(null);

  // Update state when userProfile loads
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setBio(userProfile.bio || '');
      
      // Validate campLocation - skip if it's legacy x/y coordinates
      const campLoc = userProfile.campLocation;
      if (campLoc?.lat && campLoc?.lng) {
        // Check if it's a valid GPS coordinate (not legacy x/y)
        const isValid = campLoc.lat >= 29 && campLoc.lat <= 31 && 
                       campLoc.lng >= -98 && campLoc.lng <= -96;
        setSelectedLocation(isValid ? campLoc : null);
      } else {
        setSelectedLocation(null);
      }
      
      setPhotoURL(userProfile.photoURL || '');
    }
  }, [userProfile]);

  // Load user's posts
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'posts'),
      where('authorId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      // Don't filter - show all posts (published and unpublished) on own profile
      setUserPosts(postsData);
      setLoadingPosts(false);
    });

    return unsubscribe;
  }, [user]);

  // Load activities user has RSVP'd to
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'posts'),
      where('isActivity', '==', true),
      where('attendees', 'array-contains', user.uid),
      orderBy('scheduledAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activitiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRsvpActivities(activitiesData);
      setLoadingActivities(false);
    });

    return unsubscribe;
  }, [user]);

  const resizeImage = (file, maxWidth = 400, maxHeight = 400) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 0.85);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingPhoto(true);
    try {
      const resizedBlob = await resizeImage(file);
      const filename = `profile-photos/${user.uid}/${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, resizedBlob);
      const url = await getDownloadURL(storageRef);
      setPhotoURL(url);
      
      // Auto-save the photo URL to Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        photoURL: url,
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error uploading photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName,
        photoURL,
        bio,
        campLocation: selectedLocation,
      });
      alert('Profile updated!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleMapClick = (coords) => {
    setSelectedLocation(coords);
  };

  const deletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post. Please try again.');
    }
  };

  const handleDeleteProfile = async () => {
    if (!user) return;

    setDeleting(true);
    try {
      // 1. Delete all user's posts
      const postsQuery = query(collection(db, 'posts'), where('authorId', '==', user.uid));
      const postsSnapshot = await getDocs(postsQuery);
      const deletePostPromises = postsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePostPromises);

      // 2. Delete profile photos from storage
      try {
        const profilePhotosRef = ref(storage, `profile-photos/${user.uid}`);
        const photosList = await listAll(profilePhotosRef);
        const deletePhotoPromises = photosList.items.map(item => deleteObject(item));
        await Promise.all(deletePhotoPromises);
      } catch (storageError) {
        console.warn('Error deleting profile photos:', storageError);
      }

      // 3. Delete post media from storage
      try {
        const postMediaRef = ref(storage, `posts/${user.uid}`);
        const mediaList = await listAll(postMediaRef);
        const deleteMediaPromises = mediaList.items.map(item => deleteObject(item));
        await Promise.all(deleteMediaPromises);
      } catch (storageError) {
        console.warn('Error deleting post media:', storageError);
      }

      // 4. Delete user document from Firestore
      await deleteDoc(doc(db, 'users', user.uid));

      // 5. Delete the Firebase Auth account
      await user.delete();

      // 6. Sign out (will happen automatically after account deletion)
      alert('Your profile has been permanently deleted.');
    } catch (error) {
      console.error('Error deleting profile:', error);
      if (error.code === 'auth/requires-recent-login') {
        alert('For security reasons, please sign out and sign in again before deleting your profile.');
      } else {
        alert('Error deleting profile. Please try again.');
      }
      setDeleting(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-[var(--color-text-light)]">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="bg-[var(--color-sand-light)] border border-[var(--color-warm-gray-300)] rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <ProfilePicture
              src={photoURL}
              alt={displayName}
              size="lg"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute bottom-0 right-0 p-2 bg-[var(--color-clay)] text-white rounded-full hover:bg-[var(--color-clay-dark)] transition-colors disabled:opacity-50"
              title="Change photo"
            >
              {uploadingPhoto ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Camera size={16} />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm text-[var(--color-text-light)] mb-1">Display Name</p>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="text-2xl font-bold text-[var(--color-text-primary)] border-b-2 border-transparent hover:border-[var(--color-warm-gray-300)] focus:border-[var(--color-clay)] focus:outline-none w-full bg-transparent"
              placeholder="Your name"
            />
            <p className="text-[var(--color-text-secondary)] text-sm mt-1">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-warm-gray-300)] bg-white rounded-lg focus:ring-2 focus:ring-[var(--color-clay)] focus:border-transparent"
              rows={3}
              placeholder="Tell people about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Camp Location
            </label>
            {selectedLocation ? (
              <div className="flex items-center justify-between p-3 bg-[var(--color-warm-gray-100)] border border-[var(--color-warm-gray-300)] rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-[var(--color-clay)]" />
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    Location set
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditingLocation(!isEditingLocation)}
                    className="text-sm text-[var(--color-clay)] hover:text-[var(--color-clay-dark)] font-medium"
                  >
                    {isEditingLocation ? 'Close Map' : 'Change'}
                  </button>
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="text-sm text-[var(--color-sunset-red)] hover:text-[var(--color-clay-dark)] font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingLocation(true)}
                className="w-full p-3 border-2 border-dashed border-[var(--color-warm-gray-300)] rounded-lg text-[var(--color-text-secondary)] hover:border-[var(--color-clay-light)] hover:text-[var(--color-clay)] transition-colors"
              >
                Click to set camp location
              </button>
            )}
          </div>

          {isEditingLocation && (
            <div className="border-2 border-[var(--color-leather)] rounded-lg overflow-hidden">
              <GoogleMapComponent
                markers={selectedLocation?.lat && selectedLocation?.lng ? [{
                  id: 'selected',
                  x: selectedLocation.lng,
                  y: selectedLocation.lat,
                  label: '★',
                  color: '#4CAF50',
                  popup: <div className="font-semibold">Your camp location</div>
                }] : []}
                onMapClick={handleMapClick}
                isSelectionMode={true}
                centerLocation={selectedLocation?.lat && selectedLocation?.lng ? selectedLocation : null}
                className="h-96"
              />
            </div>
          )}

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full bg-[var(--color-clay)] text-white py-3 px-6 rounded-lg hover:bg-[var(--color-clay-dark)] transition-colors flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>

          {/* Delete Profile Section */}
          <div className="pt-6 border-t border-[var(--color-warm-gray-300)]">
            <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">Danger Zone</h3>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full bg-red-50 border border-red-200 text-red-600 py-2 px-4 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
              >
                <Trash2 size={16} />
                Delete My Profile
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex gap-2 mb-2">
                    <AlertTriangle size={20} className="text-red-600 flex-shrink-0" />
                    <div className="text-sm text-red-800">
                      <p className="font-semibold mb-1">This action cannot be undone!</p>
                      <p>This will permanently delete:</p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        <li>Your profile and account</li>
                        <li>All your posts and photos</li>
                        <li>Your camp location</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="flex-1 bg-[var(--color-warm-gray-200)] text-[var(--color-text-secondary)] py-2 px-4 rounded-lg hover:bg-[var(--color-warm-gray-300)] transition-colors font-medium text-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteProfile}
                    disabled={deleting}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Yes, Delete Everything
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RSVP'd Activities Section */}
      <div className="bg-[var(--color-sand-light)] border border-[var(--color-warm-gray-300)] rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <Calendar size={20} />
          My Activities
        </h2>

        {loadingActivities ? (
          <div className="text-center py-8 text-[var(--color-text-light)]">Loading activities...</div>
        ) : rsvpActivities.length === 0 ? (
          <div className="text-center py-8">
            <Calendar size={48} className="mx-auto text-[var(--color-warm-gray-300)] mb-3" />
            <p className="text-[var(--color-text-light)]">You haven't RSVP'd to any activities yet</p>
            <p className="text-sm text-[var(--color-text-light)] mt-1">Browse the map to find activities!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rsvpActivities.map(activity => (
              <Post
                key={activity.id}
                post={activity}
                currentUserId={user?.uid}
                author={activity.authorId === user?.uid ? userProfile : null}
                onNavigateToMap={onNavigateToMap}
                onToggleRSVP={toggleRSVP}
                showEditDelete={false}
                compact={true}
                onClick={() => navigate(`/post/${activity.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* User's Posts Section */}
      <div className="bg-[var(--color-sand-light)] border border-[var(--color-warm-gray-300)] rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <FileText size={20} />
          My Posts
        </h2>

        {loadingPosts ? (
          <div className="text-center py-8 text-[var(--color-text-light)]">Loading posts...</div>
        ) : userPosts.length === 0 ? (
          <div className="text-center py-8">
            <FileText size={48} className="mx-auto text-[var(--color-warm-gray-300)] mb-3" />
            <p className="text-[var(--color-text-light)]">You haven't posted anything yet</p>
            <p className="text-sm text-[var(--color-text-light)] mt-1">Share your festival moments!</p>
          </div>
        ) : (
          <>
            {/* Published Posts */}
            {userPosts.filter(post => post.published !== false).length > 0 && (
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Published</h3>
                {userPosts.filter(post => post.published !== false).map(post => (
                  <Post
                    key={post.id}
                    post={post}
                    currentUserId={user?.uid}
                    author={userProfile}
                    onNavigateToMap={onNavigateToMap}
                    onDelete={deletePost}
                    onToggleRSVP={toggleRSVP}
                    showEditDelete={true}
                    compact={false}
                  />
                ))}
              </div>
            )}

            {/* Unpublished Posts (Drafts) */}
            {userPosts.filter(post => post.published === false).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[var(--color-text-secondary)] flex items-center gap-2">
                  Unpublished Drafts
                  <span className="text-xs font-normal text-[var(--color-text-light)]">
                    (Only visible to you)
                  </span>
                </h3>
                <div className="space-y-4">
                  {userPosts.filter(post => post.published === false).map(post => (
                    <div key={post.id} className="relative">
                      <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded z-10">
                        Draft
                      </div>
                      <Post
                        post={post}
                        currentUserId={user?.uid}
                        author={userProfile}
                        onNavigateToMap={onNavigateToMap}
                        onDelete={deletePost}
                        onToggleRSVP={toggleRSVP}
                        showEditDelete={true}
                        compact={false}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
};

export default Profile;