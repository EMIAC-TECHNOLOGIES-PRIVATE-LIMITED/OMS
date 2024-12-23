import React from 'react';
import { useRecoilState } from 'recoil';
import { currentViewNameState } from '../../store/atoms/atoms';
import { PaginationControlsRecoil } from '../UI';

import FilterPanelRecoil2 from '../UI/FilterPanel/FilterPanel2';
import ColumnPanelRecoil from '../UI/ColumnPanel/ColumnPanel';
import SortingPanelRecoil from '../UI/SortingPanel/SortingPanel';

const FilterComponent: React.FC<{ resource: string; pageTitle: string }> = ({ resource, pageTitle }) => {
  const [currentViewName, setCurrentViewName] = useRecoilState(
    currentViewNameState(resource)
  );

  // Handle view name change
  const handleViewNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newViewName = e.target.value;
    setCurrentViewName(newViewName);
  };

  return (
    <div className="bg-white shadow-md rounded-lg px-6 py-4 border border-gray-200 flex items-center justify-between">
      {/* Left Section: Title and View Input */}
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-gray-900">{pageTitle}</h2>
        <input
          type="text"
          value={currentViewName}
          onChange={handleViewNameChange}
          className="border border-gray-300 rounded-md px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="View Name"
        />
      </div>

      {/* Center Section: Action Buttons */}
      <div className="flex items-center space-x-3">
        <FilterPanelRecoil2 resource={resource} />
        <ColumnPanelRecoil resource={resource} />
        <SortingPanelRecoil resource={resource} />
      </div>

      {/* Right Section: Pagination Controls */}
      <div className="flex items-center">
        <PaginationControlsRecoil resource={resource} />
      </div>
    </div>
  );
};

export default FilterComponent;
