
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const BackButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if the current path is a sub-route that requires a back button
  const pathSegments = location.pathname.split('/');
  const isSubRoute = pathSegments.length > 3; // e.g., '/dashboard/manageroles/:id'

  if (!isSubRoute) return null;

  // Extract the parent path
  const parentPath = pathSegments.slice(0, -1).join('/');

  const handleBack = () => {
    navigate(parentPath);
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center text-neutral-700 hover:text-brand focus:outline-none mb-4"
      aria-label="Go back to previous menu"
    >
      <ArrowLeftIcon className="w-5 h-5 mr-1" />
      Back
    </button>
  );
};

export default BackButton;
