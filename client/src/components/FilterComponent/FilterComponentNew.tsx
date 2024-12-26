import React, { ChangeEvent } from 'react';
import {
  FilterPanelNew,
  ColumnPanelNew,
  SortingPanelNew,
  PaginationControlsNew,
} from '../UI';

import { FilterConfig } from '../../../../shared/src/types';
import { availableColumnsTypes } from '../../types';

interface FilterComponentNewProps {
  resource: string;
  pageTitle: string;
  currentViewName: string;
  setCurrentViewName: (name: string) => void;
  filterConfig: FilterConfig;
  onFilterChange: (newFilterConfig: FilterConfig) => void;
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: (page: number, pageSize: number) => void;
  availableColumnsTypes: availableColumnsTypes;
}

const FilterComponentNew: React.FC<FilterComponentNewProps> = ({
  resource,
  pageTitle,
  currentViewName,
  setCurrentViewName,
  filterConfig,
  onFilterChange,
  page,
  pageSize,
  totalPages,
  setPage,
  availableColumnsTypes
}) => {
  // Handle view name change
  const handleViewNameChange = (e: ChangeEvent<HTMLInputElement>) => {
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
        <FilterPanelNew
          resource={resource}
          filterConfig={filterConfig}
          onFilterChange={onFilterChange}
          availableColumnsTypes={availableColumnsTypes}
        />
        <ColumnPanelNew
          resource={resource}
          filterConfig={filterConfig}
          onFilterChange={onFilterChange}
        />
        <SortingPanelNew
          resource={resource}
          filterConfig={filterConfig}
          onFilterChange={onFilterChange}
        />
      </div>

      {/* Right Section: Pagination Controls */}
      <div className="flex items-center">
        <  resource={resource} />
      </div>
    </div>
  );
};

export default FilterComponentNew;
