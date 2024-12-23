// src/components/UI/Panel/Panel.tsx

import React, { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface PanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  panelRef?: React.RefObject<HTMLDivElement>;
  className?: string;
}

const Panel: React.FC<PanelProps> = ({
  isOpen,
  onClose,
  title,
  children,
  panelRef,
  className = '',
}) => {
  const ref = panelRef || useRef<HTMLDivElement>(null);

  // Handle clicks outside the panel to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      if (isOpen) {
        document.removeEventListener('mousedown', handleClickOutside);
      }
    };
  }, [isOpen, onClose, ref]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`absolute left-0 mt-1 w-80 bg-white border border-neutral-200 rounded-lg shadow-premium-lg p-3 z-50 ${className}`}
      ref={ref}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-semibold text-neutral-800">{title}</h3>
        <button
          onClick={onClose}
          className="text-neutral-500 hover:text-neutral-700 focus:outline-none"
          aria-label="Close Panel"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
      {/* Content */}
      <div className='flex flex-col gap-2'>
        {children}
      </div>
    </div>
  );
};

export default Panel;
