// src/components/UI/IconButton/IconButton.tsx

import React from 'react';

interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  title?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  className = '',
  ariaLabel,
  title,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus:outline-none ${className}`}
      aria-label={ariaLabel}
      title={title}
    >
      {icon}
    </button>
  );
};

export default IconButton;
