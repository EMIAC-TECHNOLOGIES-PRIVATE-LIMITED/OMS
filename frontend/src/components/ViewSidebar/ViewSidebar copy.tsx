import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRecoilState } from 'recoil';
import {
  viewsState,
  currentViewIdState,
} from '../../store/atoms/atoms';
import { View } from '../../types/index';
import { fetchDataPage } from '../../utils';

interface ViewSidebarProps {
  resource: string;
}

const ViewSidebar: React.FC<ViewSidebarProps> = ({ resource }) => {

  console.log("side bar reloaded")

  const [views, setViews] = useRecoilState<View[]>(viewsState(resource));
  const [currentViewId, setCurrentViewId] = useRecoilState<number | null>(currentViewIdState(resource));


  // Local States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [viewToDelete, setViewToDelete] = useState<View | null>(null);

  // Refs for clicking outside the modal to close it
  const modalRef = useRef<HTMLDivElement>(null);

  // Handler to open delete confirmation modal
  const handleDeleteClick = (view: View) => {
    // console.log(`Delete button clicked for the viewID : `, view)
    setViewToDelete(view);
    setIsModalOpen(true);
  };

  // console.log(`The current value of all the views are  ${viewsState}`)
  // console.log(`The current value of viewState Variable is ${currentViewId}`)

  // Handler to confirm deletion
  const handleConfirmDelete = async () => {
    if (!viewToDelete) return;

    const endpoint = `/data/${resource}/${viewToDelete.id}`;

    try {
      await fetchDataPage(endpoint, 'delete');
      // Update Recoil state by removing the deleted view
      setViews((prevViews) => prevViews.filter((view) => view.id !== viewToDelete.id));

      // If the deleted view was the current view, select the default view
      if (currentViewId === viewToDelete.id) {
        const defaultView = views.find((v) => v.viewName === 'grid');
        if (defaultView) {
          setCurrentViewId(defaultView.id);

        } else {
          setCurrentViewId(null);
        }
      }

      setIsModalOpen(false);
      setViewToDelete(null);
    } catch (err: any) {
      console.error('Error deleting view:', err);
    }
  };

  // Handler to cancel deletion
  const handleCancelDelete = () => {
    setIsModalOpen(false);
    setViewToDelete(null);
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setIsModalOpen(false);
      setViewToDelete(null);
    }
  }, []);

  // Function to sort the views names
  const sortedViews = useMemo(() => {
    const defaultView = views.filter(v => v.viewName == 'grid'
    )

    const otherViews = views.filter(v => v.viewName !== 'grid').sort((a, b) => a.viewName.localeCompare(b.viewName));

    return [...defaultView, ...otherViews];
  }, [views])

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  // Handler to select a view
  const handleSelectView = (viewId: number) => {
    // console.log("Handle select view called from ViewSideBarComponent")
    setCurrentViewId(viewId);
    window.localStorage.setItem(`${resource}-view-id`, viewId.toString());
    // Optionally, trigger any side effects or data fetching here
  };

  return (
    <div className="w-64 bg-neutral-100 p-4 border-r border-neutral-200 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-800">Views</h3>

      </div>

      {/* Views List */}
      <ul>
        {sortedViews.map((view) => (
          <li key={view.id} className="group flex items-center justify-between mb-2">
            <button
              onClick={() => handleSelectView(view.id)}
              className={`flex items-center w-full p-2 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-dark ${view.id === currentViewId
                ? 'bg-brand text-white'
                : 'text-neutral-700 hover:bg-brand-light hover:text-white'
                }`}
            >
              {view.viewName === 'grid' ? 'Default Grid' : view.viewName}
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
            className="bg-white rounded-lg p-6 w-80 shadow-lg transform transition-all duration-300 animate-scaleIn "
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
              Are you sure you want to delete the view "<span className="font-bold">{viewToDelete.viewName}</span>"?
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
                className="flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-800"
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

export default memo(ViewSidebar);
