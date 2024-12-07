import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { TrashIcon, XMarkIcon, TableCellsIcon, ChartBarSquareIcon } from '@heroicons/react/24/outline';
import { useRecoilState } from 'recoil';
import { viewsState, currentViewIdState } from '../../store/atoms/atoms';
import { View } from '../../types/index';
import { fetchDataPage } from '../../utils';
import { motion } from 'framer-motion';

interface ViewSidebarProps {
  resource: string;
}

const ViewSidebar: React.FC<ViewSidebarProps> = ({ resource }) => {
  const [views, setViews] = useRecoilState<View[]>(viewsState(resource));
  const [currentViewId, setCurrentViewId] = useRecoilState<number | null>(currentViewIdState(resource));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewToDelete, setViewToDelete] = useState<View | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  const handleDeleteClick = (view: View) => {
    setViewToDelete(view);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!viewToDelete) return;

    const endpoint = `/data/${resource}/${viewToDelete.id}`;

    try {
      await fetchDataPage(endpoint, 'delete');
      setViews((prevViews) => prevViews.filter((view) => view.id !== viewToDelete.id));

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

  const sortedViews = useMemo(() => {
    const defaultView = views.filter((v) => v.viewName === 'grid');
    const otherViews = views.filter((v) => v.viewName !== 'grid').sort((a, b) => a.viewName.localeCompare(b.viewName));

    return [...defaultView, ...otherViews];
  }, [views]);

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

  const handleSelectView = (viewId: number) => {
    setCurrentViewId(viewId);
    window.localStorage.setItem(`${resource}-view-id`, viewId.toString());
  };

  return (
    <motion.div
      className="bg-neutral-100 p-4 border-r border-neutral-200 h-full overflow-y-auto"
      initial={{ width: '4rem', opacity: 0 }}
      animate={{
        width: isHovered ? '16rem' : '4rem',
        opacity: 1,
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-800">Views</h3>
      </div>

      <ul>
        {sortedViews.map((view) => (
          <li key={view.id} className="group flex items-center justify-between mb-2">
            <button
              onClick={() => handleSelectView(view.id)}
              className={`flex items-center w-full p-2 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-dark ${
                view.id === currentViewId
                  ? 'bg-brand text-white'
                  : 'text-neutral-700 hover:bg-brand-light hover:text-white'
              }`}
            >
              {/* Fixed container for the icon */}
              <span className="flex items-center justify-center w-8 h-8">
                {view.viewName === 'grid' ? (
                  <TableCellsIcon className="w-6 h-6 text-neutral-700" />
                ) : (
                  <ChartBarSquareIcon className="w-6 h-6 text-neutral-700" />
                )}
              </span>
              {/* Name (visible only when expanded) */}
              {isHovered && <span className="ml-2">{view.viewName === 'grid' ? 'Default Grid' : view.viewName}</span>}
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

      {isModalOpen && viewToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <motion.div
            ref={modalRef}
            className="bg-white rounded-lg p-6 w-80 shadow-lg"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
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
            <p className="text-neutral-700 mb-4">
              Are you sure you want to delete the view "<span className="font-bold">{viewToDelete.viewName}</span>"? This
              action cannot be undone.
            </p>
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
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default memo(ViewSidebar);
