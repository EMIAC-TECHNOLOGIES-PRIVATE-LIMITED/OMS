// src/components/ViewSidebar/ViewSidebar.tsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { View } from '../../types/index';

import {
  TrashIcon,        // For Remove Buttons
  XMarkIcon,        // For Close Buttons
} from '@heroicons/react/24/outline';

interface ViewSidebarProps {
  views: View[];
  currentViewId: number | null;
  onSelectView: (viewId: number) => void;
  resource: string; // Specifies the resource name (e.g., 'sites')
  onDeleteView: (viewId: number) => void; // Callback to update views after deletion
}

const ViewSidebar: React.FC<ViewSidebarProps> = ({
  views,
  currentViewId,
  onSelectView,
  resource,
  onDeleteView,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [viewToDelete, setViewToDelete] = useState<View | null>(null);
  const token: string = import.meta.env.VITE_API_TOKEN || 'your-default-token-here';
  const api: string = import.meta.env.VITE_API_URL;

  const handleDeleteClick = (view: View) => {
    setViewToDelete(view);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!viewToDelete) return;

    try {
      await axios.delete(`${api}/data/${resource}/${viewToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      onDeleteView(viewToDelete.id);
      setIsModalOpen(false);
      setViewToDelete(null);
    } catch (error) {
      console.error('Error deleting view:', error);
      alert('Failed to delete the view. Please try again.');
    }
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
    setViewToDelete(null);
  };

  // Refs for clicking outside the modal to close it (optional)
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsModalOpen(false);
        setViewToDelete(null);
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  return (
    <div className="w-64 bg-neutral-100 p-4 border-r border-neutral-200 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-800">Views</h3>
        {/* Removed the plus button as it's not needed */}
      </div>

      {/* Views List */}
      <ul>
        {views.map((view) => (
          <li key={view.id} className="group flex items-center justify-between mb-2">
            <button
              onClick={() => onSelectView(view.id)}
              className={`flex items-center w-full p-2 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-dark ${
                view.id === currentViewId
                  ? 'bg-brand text-white'
                  : 'text-neutral-700 hover:bg-brand-light hover:text-white'
              }`}
            >
              {view.viewName}
            </button>
            {view.viewName !== 'grid' && (
              <button
                onClick={() => handleDeleteClick(view)}
                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-red-500 hover:text-red-700 focus:outline-none"
                aria-label={`Delete view ${view.viewName}`}
                title="Delete View"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Delete Confirmation Modal */}
      {isModalOpen && viewToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg p-6 w-80 shadow-lg transform transition-all duration-300 animate-scaleIn animate-fadeIn"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-neutral-800">Confirm Deletion</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-500 hover:text-neutral-700 focus:outline-none"
                aria-label="Close Modal"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            {/* Content */}
            <p className="text-neutral-700 mb-4">
              Are you sure you want to delete the view "<span className="font-medium">{viewToDelete.viewName}</span>"?
              This action cannot be undone.
            </p>
            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelDelete}
                className="flex items-center px-3 py-1 bg-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-neutral-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex items-center px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSidebar;
