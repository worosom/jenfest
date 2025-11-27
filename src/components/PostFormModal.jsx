import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Image as ImageIcon, Calendar, MapPin, Loader2, Save } from 'lucide-react';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import GoogleMapComponent from './Map/GoogleMapComponent';

const PostFormModal = ({ isOpen, onClose, post = null }) => {
  const { user } = useAuth();
  const isEditMode = !!post;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isActivity, setIsActivity] = useState(false);
  const [published, setPublished] = useState(true);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [mapLocation, setMapLocation] = useState(null);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);

  // Reset form when modal opens/closes or post changes
  useEffect(() => {
    if (isOpen) {
      if (post) {
        // Edit mode - populate with existing post data
        setTitle(post.title || '');
        setContent(post.content || '');
        setIsActivity(post.isActivity || false);
        setPublished(post.published !== false); // Default to true if not set
        
        // Validate mapLocation - skip if it's legacy x/y coordinates
        const mapLoc = post.mapLocation;
        if (mapLoc?.lat && mapLoc?.lng) {
          // Check if it's a valid GPS coordinate (not legacy x/y)
          const isValid = mapLoc.lat >= 29 && mapLoc.lat <= 31 && 
                         mapLoc.lng >= -98 && mapLoc.lng <= -96;
          setMapLocation(isValid ? mapLoc : null);
        } else {
          setMapLocation(null);
        }

        // Set scheduled date/time if exists
        if (post.scheduledAt) {
          const date = post.scheduledAt.toDate();
          const dateStr = date.toISOString().split('T')[0];
          const timeStr = date.toTimeString().slice(0, 5);
          setScheduledDate(dateStr);
          setScheduledTime(timeStr);
        } else {
          setScheduledDate('');
          setScheduledTime('');
        }
      } else {
        // Create mode - reset form
        setTitle('');
        setContent('');
        setIsActivity(false);
        setPublished(true);
        setScheduledDate('');
        setScheduledTime('');
        setSelectedImages([]);
        setMapLocation(null);
        setIsSelectingLocation(false);
      }
    }
  }, [isOpen, post]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const preview = URL.createObjectURL(file);
        setSelectedImages([{ file, preview }]);
      }
    }
  });

  const resizeImage = (file, maxWidth = 1200, maxHeight = 1200) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('Please add some content to your post');
      return;
    }

    setUploading(true);

    try {
      if (isEditMode) {
        // Update existing post
        const postRef = doc(db, 'posts', post.id);
        const updateData = {
          title: title.trim() || null,
          content: content.trim(),
          mapLocation: mapLocation,
          isActivity,
          published: published,
        };

        // Update scheduled date if activity
        if (isActivity && scheduledDate && scheduledTime) {
          const datetime = new Date(`${scheduledDate}T${scheduledTime}`);
          updateData.scheduledAt = datetime;
        } else if (!isActivity) {
          updateData.scheduledAt = null;
        }

        await updateDoc(postRef, updateData);
      } else {
        // Create new post
        let mediaUrls = [];

        // Upload images if any
        if (selectedImages.length > 0) {
          for (const { file } of selectedImages) {
            const resizedBlob = await resizeImage(file);
            const filename = `posts/${user.uid}/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, filename);
            await uploadBytes(storageRef, resizedBlob);
            const url = await getDownloadURL(storageRef);
            mediaUrls.push({ type: 'image', url });
          }
        }

        // Prepare post data
        const postData = {
          authorId: user.uid,
          title: title.trim() || null,
          content: content.trim(),
          media: mediaUrls,
          mapLocation: mapLocation,
          isActivity,
          scheduledAt: null,
          attendees: [],
          createdAt: serverTimestamp(),
          published: published,
        };

        // Add scheduled date if activity
        if (isActivity && scheduledDate && scheduledTime) {
          const datetime = new Date(`${scheduledDate}T${scheduledTime}`);
          postData.scheduledAt = datetime;
        }

        // Create post
        await addDoc(collection(db, 'posts'), postData);
      }

      // Reset form and close
      setTitle('');
      setContent('');
      setIsActivity(false);
      setPublished(true);
      setScheduledDate('');
      setScheduledTime('');
      setSelectedImages([]);
      setMapLocation(null);
      setIsSelectingLocation(false);
      onClose();
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} post:`, error);
      alert(`Error ${isEditMode ? 'updating' : 'creating'} post. Please try again.`);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    if (selectedImages[0]?.preview) {
      URL.revokeObjectURL(selectedImages[0].preview);
    }
    setSelectedImages([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-sand-light)] border-2 border-[var(--color-leather)] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-warm-gray-300)] sticky top-0 bg-[var(--color-sand-light)]">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            {isEditMode ? 'Edit Post' : 'Create Post'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-warm-gray-200)] rounded-full transition-colors"
            disabled={uploading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a title..."
              className="w-full px-3 py-2 border border-[var(--color-warm-gray-300)] bg-white rounded-lg focus:ring-2 focus:ring-[var(--color-clay)] focus:border-transparent"
              disabled={uploading}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening at the festival?"
              className="w-full px-3 py-2 border border-[var(--color-warm-gray-300)] bg-white rounded-lg focus:ring-2 focus:ring-[var(--color-clay)] focus:border-transparent resize-none"
              rows={4}
              disabled={uploading}
            />
          </div>

          {/* Activity Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActivity"
              checked={isActivity}
              onChange={(e) => setIsActivity(e.target.checked)}
              className="w-4 h-4 text-[var(--color-clay)] focus:ring-[var(--color-clay)] border-[var(--color-warm-gray-300)] rounded"
              disabled={uploading}
            />
            <label htmlFor="isActivity" className="text-sm font-medium text-[var(--color-text-primary)] flex items-center gap-1">
              <Calendar size={16} />
              Schedule as Activity
            </label>
          </div>

          {/* Published Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 text-[var(--color-clay)] focus:ring-[var(--color-clay)] border-[var(--color-warm-gray-300)] rounded"
              disabled={uploading}
            />
            <label htmlFor="published" className="text-sm font-medium text-[var(--color-text-primary)]">
              Publish this post
            </label>
            <span className="text-xs text-[var(--color-text-light)]">
              (Uncheck to hide from feed)
            </span>
          </div>

          {/* Date/Time for Activities */}
          {isActivity && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-warm-gray-300)] bg-white rounded-lg focus:ring-2 focus:ring-[var(--color-clay)] focus:border-transparent"
                  disabled={uploading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-warm-gray-300)] bg-white rounded-lg focus:ring-2 focus:ring-[var(--color-clay)] focus:border-transparent"
                  disabled={uploading}
                />
              </div>
            </div>
          )}

          {/* Image Upload - Only show for new posts */}
          {!isEditMode && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Add Photo
              </label>
              {selectedImages.length === 0 ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-[var(--color-clay)] bg-[var(--color-warm-gray-100)]'
                      : 'border-[var(--color-warm-gray-300)] hover:border-[var(--color-clay-light)]'
                  } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input {...getInputProps()} disabled={uploading} />
                  <ImageIcon size={48} className="mx-auto mb-3 text-[var(--color-warm-gray-600)]" />
                  {isDragActive ? (
                    <p className="text-[var(--color-clay)]">Drop the image here</p>
                  ) : (
                    <div>
                      <p className="text-[var(--color-text-secondary)] mb-1">
                        Drag and drop an image, or click to select
                      </p>
                      <p className="text-xs text-[var(--color-text-light)]">
                        JPEG, PNG, GIF, WebP (max 10MB)
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={selectedImages[0].preview}
                    alt="Preview"
                    className="w-full rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={uploading}
                    className="absolute top-2 right-2 p-2 bg-[var(--color-sunset-red)] text-white rounded-full hover:bg-[var(--color-clay-dark)] transition-colors disabled:opacity-50"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Note about media in edit mode */}
          {isEditMode && post.media && post.media.length > 0 && (
            <div className="p-3 bg-[var(--color-lake-light)] bg-opacity-20 border border-[var(--color-lake-light)] text-[var(--color-lake-dark)] text-sm rounded-lg">
              Note: Photos cannot be changed after posting. To change the photo, please delete and recreate the post.
            </div>
          )}

          {/* Map Location */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Tag Location on Map
            </label>
            {mapLocation ? (
              <div className="flex items-center justify-between p-3 bg-[var(--color-warm-gray-100)] rounded-lg border border-[var(--color-warm-gray-300)]">
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-[var(--color-clay)]" />
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    Location tagged at Lat: {mapLocation.lat?.toFixed(6)}, Lng: {mapLocation.lng?.toFixed(6)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSelectingLocation(!isSelectingLocation)}
                    disabled={uploading}
                    className="text-sm text-[var(--color-clay)] hover:text-[var(--color-clay-dark)] font-medium"
                  >
                    {isSelectingLocation ? 'Close Map' : 'Change'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapLocation(null)}
                    disabled={uploading}
                    className="text-sm text-[var(--color-sunset-red)] hover:text-[var(--color-clay-dark)] font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSelectingLocation(true)}
                disabled={uploading}
                className="w-full p-3 border-2 border-dashed border-[var(--color-warm-gray-300)] rounded-lg text-[var(--color-text-secondary)] hover:border-[var(--color-clay-light)] hover:text-[var(--color-clay)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <MapPin size={20} />
                Click to tag location on map
              </button>
            )}
          </div>

          {isSelectingLocation && (
            <div className="border-2 border-[var(--color-leather)] rounded-lg overflow-hidden">
              <GoogleMapComponent
                markers={mapLocation?.lat && mapLocation?.lng ? [{
                  id: 'selected',
                  x: mapLocation.lng,
                  y: mapLocation.lat,
                  label: '★',
                  color: '#d97746',
                  popup: <div className="font-semibold">Tagged location</div>
                }] : []}
                onMapClick={(coords) => setMapLocation(coords)}
                isSelectionMode={true}
                centerLocation={mapLocation?.lat && mapLocation?.lng ? mapLocation : null}
                className="h-96"
              />
            </div>
          )}

          {/* Submit Button */}
          {isEditMode ? (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                className="flex-1 bg-[var(--color-warm-gray-200)] text-[var(--color-text-secondary)] py-3 px-6 rounded-lg hover:bg-[var(--color-warm-gray-300)] transition-colors font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !content.trim()}
                className="flex-1 bg-[var(--color-clay)] text-white py-3 px-6 rounded-lg hover:bg-[var(--color-clay-dark)] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {uploading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              type="submit"
              disabled={uploading || !content.trim()}
              className="w-full bg-[var(--color-clay)] text-white py-3 px-6 rounded-lg hover:bg-[var(--color-clay-dark)] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {uploading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Posting...
                </>
              ) : (
                'Post'
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default PostFormModal;