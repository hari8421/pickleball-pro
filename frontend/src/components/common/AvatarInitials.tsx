import React from 'react';

interface AvatarInitialsProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AvatarInitials: React.FC<AvatarInitialsProps> = ({ name, size = 'md', className = '' }) => {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  // Deterministic color based on name length
  const colors = ['bg-brand-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500', 'bg-orange-500'];
  const colorIndex = name.length % colors.length;

  return (
    <div
      className={`${sizeClasses[size]} ${colors[colorIndex]} rounded-full flex items-center justify-center font-semibold text-white ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
};

export default AvatarInitials;

