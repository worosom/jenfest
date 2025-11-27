import { useState } from 'react';
import { User } from 'lucide-react';

const ProfilePicture = ({ 
  src, 
  alt = 'User', 
  size = 'md',
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-5 h-5',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 40,
  };

  // Block Google profile URLs - only allow Firebase Storage
  const isValidPhoto = src && src.includes('firebasestorage.googleapis.com');

  // Show icon fallback if no valid src or image failed to load
  if (!isValidPhoto || imageError) {
    return (
      <div 
        className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center ${className}`}
      >
        <User size={iconSizes[size]} className="text-gray-500" />
      </div>
    );
  }

  // Try to load the image
  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      referrerPolicy="no-referrer"
      onError={() => setImageError(true)}
    />
  );
};

export default ProfilePicture;