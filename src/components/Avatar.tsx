import React from 'react';
import { getInitials } from '../utils/string';

interface AvatarProps {
  url?: string | null;
  displayName?: string | null;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const EMOJI_LIST = ['👨‍🍳', '👩‍🍳', '🧑‍🍳', '👨🏻‍🍳', '👩🏻‍🍳', '🧑🏻‍🍳'];

export function Avatar({ url, displayName, size = 'md', onClick }: AvatarProps) {
  const [randomEmoji] = React.useState(() => {
    const randomIndex = Math.floor(Math.random() * EMOJI_LIST.length);
    return EMOJI_LIST[randomIndex];
  });

  const [imageError, setImageError] = React.useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-20 h-20 text-2xl'
  };

  const Component = onClick ? 'button' : 'div';

  // If we have a URL and no image error, show the image
  if (url && !imageError) {
    return (
      <Component
        onClick={onClick}
        className={`relative rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 ${sizeClasses[size]} ${onClick ? 'cursor-pointer hover:opacity-90' : ''}`}
      >
        <img
          src={url}
          alt={displayName || 'User avatar'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </Component>
    );
  }

  // Show fallback (initials or emoji)
  return (
    <Component
      onClick={onClick}
      className={`relative rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center font-medium text-indigo-600 dark:text-indigo-300 ${sizeClasses[size]} ${onClick ? 'cursor-pointer hover:opacity-90' : ''}`}
    >
      {displayName ? getInitials(displayName) : randomEmoji}
    </Component>
  );
}