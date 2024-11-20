// src/components/UI/IconButton.tsx

import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  ariaLabel: string;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, ariaLabel, ...props }) => {
  return (
    <button
      {...props}
      className="flex items-center justify-center w-6 h-6 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-dark rounded-full transition-colors duration-200"
      aria-label={ariaLabel}
    >
      {icon}
    </button>
  );
};

export default IconButton;
