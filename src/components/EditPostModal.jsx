import { useState, useEffect } from 'react';
import { X, Save, Loader2, Calendar, MapPin } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import MapComponent from './Map/MapComponent';

const EditPostModal = ({ isOpen, onClose, post }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isActivity, setIsActivity] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [mapLocation, setMapLocation] = useState(null);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setContent(post.content || '');
      setIsActivity(post.isActivity || false);
      setMapLocation(post.mapLocation || null);

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
    }
  }, [post]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('Please add some content to your post');
      return;
    }

    setSaving(true);

    try {
      const postRef = doc(db, 'posts', post.id);
      const updateData = {
        title: title.trim() || null,
        content: content.trim(),
        mapLocation: mapLocation,
        isActivity,
      };

      // Update scheduled date if activity
      if (isActivity && scheduledDate && scheduledTime) {
        const datetime = new Date(`${scheduledDate}T${scheduledTime}`);
        updateData.scheduledAt = datetime;
      } else if (!isActivity) {
        updateData.scheduledAt = null;
      }

      await updateDoc(postRef, updateData);
      onClose();
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Error updating post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-800">Edit Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={saving}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={saving}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening at the festival?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
              disabled={saving}
            />
          </div>

          {/* Activity Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActivity"
              checked={isActivity}
              onChange={(e) => setIsActivity(e.target.checked)}
              className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              disabled={saving}
            />
            <label htmlFor="isActivity" className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Calendar size={16} />
              Schedule as Activity
            </label>
          </div>

          {/* Date/Time for Activities */}
          {isActivity && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={saving}
                />
              </div>
            </div>
          )}

          {/* Map Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tag Location on Map
            </label>
            {mapLocation ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-purple-600" />
                  <span className="text-sm text-gray-700">
                    Location tagged at X: {Math.round(mapLocation.x)}, Y: {Math.round(mapLocation.y)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSelectingLocation(!isSelectingLocation)}
                    disabled={saving}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    {isSelectingLocation ? 'Close Map' : 'Change'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapLocation(null)}
                    disabled={saving}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSelectingLocation(true)}
                disabled={saving}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <MapPin size={20} />
                Click to tag location on map
              </button>
            )}
          </div>

          {isSelectingLocation && (
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <MapComponent
                mapImage="/map.jpg"
                imageWidth={1348}
                imageHeight={1102}
                markers={mapLocation ? [{
                  id: 'selected',
                  x: mapLocation.x,
                  y: mapLocation.y,
                  popup: <div>Tagged location</div>
                }] : []}
                onMapClick={(coords) => setMapLocation(coords)}
                isSelectionMode={true}
                className="h-96"
              />
            </div>
          )}

          {/* Note about media */}
          {post.media && post.media.length > 0 && (
            <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-lg">
              Note: Photos cannot be changed after posting. To change the photo, please delete and recreate the post.
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !content.trim()}
              className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
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
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;