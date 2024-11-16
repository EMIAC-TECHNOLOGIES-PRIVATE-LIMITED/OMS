// src/components/ViewSidebar/ViewSidebar.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { View } from '../../types/index';

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

  return (
    <div className="w-64 bg-gray-100 p-4 border-r border-gray-300 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Views</h3>
      
      </div>
      <ul>
        {views.map((view) => (
          <li key={view.id} className="flex items-center justify-between mb-2">
            <span
              onClick={() => onSelectView(view.id)}
              className={`cursor-pointer p-2 rounded flex-1 ${
                view.id === currentViewId
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-blue-200'
              }`}
            >
              {view.viewName}
            </span>
            {view.viewName !== 'grid' && (
              <button
                onClick={() => handleDeleteClick(view)}
                className="ml-2 text-red-500 hover:text-red-700"
                title="Delete View"
              >
              delete
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Delete Confirmation Modal */}
      {isModalOpen && viewToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-6">
              Are you sure you want to delete the view "{viewToDelete.viewName}"?
              This action cannot be undone.
            </p>
            <div className="flex justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded mr-2 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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
