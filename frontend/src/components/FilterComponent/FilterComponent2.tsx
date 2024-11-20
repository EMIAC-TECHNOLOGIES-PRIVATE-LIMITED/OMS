// src/components/FilterComponent2/FilterComponent2.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FilterConfig,
  FilterComponentProps,
  ExtendedFilterCondition,
} from '../../types';

import { useFilters, useSorting, useColumns } from '../../hooks';
import { ColumnSelector, FilterList, PaginationControls } from '../UI';
import { mapBackendToFrontendType } from '../../utils';

// Import Heroicons
import {
  FunnelIcon,       // For Filters Button
  EyeSlashIcon,     // For Hide Fields Button
  ArrowsUpDownIcon, // For Sort Button
  TrashIcon,        // For Remove Buttons
  XMarkIcon,        // For Close Buttons
  ChevronDownIcon,
  PlusIcon,  // For Dropdown Indicators
} from '@heroicons/react/24/outline';

const FilterComponent2: React.FC<
  FilterComponentProps & {
    page: number;
    pageSize: number;
    onPageChange: (newPage?: number, newPageSize?: number) => void;
  }
> = ({
  availableColumns,
  onFilterChange,
  initialFilterConfig,
  totalRecords,
  onPageChange,
  page,
  pageSize,
}) => {
  // State for function bar panels
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);
  const [isHideFieldsPanelOpen, setIsHideFieldsPanelOpen] = useState<boolean>(false);
  const [isSortPanelOpen, setIsSortPanelOpen] = useState<boolean>(false);

  // View Name
  const [viewName, setViewName] = useState<string>(
    initialFilterConfig?.viewName || 'Untitled View'
  );

  useEffect(() => {
    setViewName(initialFilterConfig?.viewName || 'Untitled View');
  }, [initialFilterConfig]);

  // Columns
  const { showColumns, setShowColumns } = useColumns(
    availableColumns,
    initialFilterConfig?.columns || Object.keys(availableColumns)
  );

  const handleColumnChange = (columns: string[]) => {
    setShowColumns(columns);

    // This will trigger the debounced filter change which will send the updated columns to the backend
    const updatedFilterConfig = {
      ...constructFilterConfig(),
      columns: columns,
    };
    onFilterChange(updatedFilterConfig);
  };

  // Filters
  const {
    filters,
    setFilters,
    globalConnector,
    setGlobalConnector,
  } = useFilters(
    availableColumns,
    initialFilterConfig?.filters || {},
    initialFilterConfig?.filters
      ? (Object.keys(initialFilterConfig.filters)[0] as 'AND' | 'OR')
      : 'AND'
  );

  // Sorting
  const {
    sorting,
    setSorting,
    updateSorting,
    addSorting,
    removeSorting,
  } = useSorting(initialFilterConfig?.sorting || []);

  // Grouping
  const [grouping, setGrouping] = useState<string[]>(
    initialFilterConfig?.grouping || []
  );

  // Construct filterConfig
  const constructFilterConfig = useCallback((): FilterConfig => {
    // Build filters object
    const buildWhereClause = (
      filters: ExtendedFilterCondition[],
      connector: 'AND' | 'OR'
    ): any => {
      if (filters.length === 0) return {};

      const conditions = filters
        .filter(
          (filter) =>
            filter.column &&
            filter.operator &&
            (filter.value !== '' ||
              ['isNull', 'isNotNull'].includes(filter.operator))
        )
        .map((filter) => {
          if (filter.operator === 'isNull') {
            return { [filter.column]: { equals: null } };
          }
          if (filter.operator === 'isNotNull') {
            return { [filter.column]: { not: null } };
          }

          const columnType = mapBackendToFrontendType(
            availableColumns[filter.column]?.type
          );

          let value = filter.value;
          if (columnType === 'date') {
            value = new Date(filter.value).toISOString();
          }

          return { [filter.column]: { [filter.operator]: value } };
        });

      if (conditions.length === 0) return {};

      return { [connector]: conditions };
    };

    const filtersObject = buildWhereClause(filters, globalConnector);

    // Construct sorting array
    const sortingArray = sorting
      .filter((sort) => sort.column && sort.direction)
      .map((sort) => ({
        [sort.column]: sort.direction,
      }));

    return {
      viewName,
      columns: showColumns,
      filters: filtersObject,
      sorting: sortingArray,
      grouping,
    };
  }, [filters, globalConnector, sorting, showColumns, viewName, grouping, availableColumns]);

  // Debounced onFilterChange
  const debouncedOnFilterChange = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debouncedOnFilterChange.current) {
      clearTimeout(debouncedOnFilterChange.current);
    }

    debouncedOnFilterChange.current = setTimeout(() => {
      const filterConfig = constructFilterConfig();
      onFilterChange(filterConfig);
    }, 500);

    return () => {
      if (debouncedOnFilterChange.current) {
        clearTimeout(debouncedOnFilterChange.current);
      }
    };
  }, [constructFilterConfig, onFilterChange]);

  // Refs for clicking outside panels
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const hideFieldsPanelRef = useRef<HTMLDivElement>(null);
  const sortPanelRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside to close panels
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(event.target as Node)
      ) {
        setIsFilterPanelOpen(false);
      }
      if (
        hideFieldsPanelRef.current &&
        !hideFieldsPanelRef.current.contains(event.target as Node)
      ) {
        setIsHideFieldsPanelOpen(false);
      }
      if (
        sortPanelRef.current &&
        !sortPanelRef.current.contains(event.target as Node)
      ) {
        setIsSortPanelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center bg-white p-2 rounded shadow-premium mb-4 justify-between">
      <div className="flex space-x-4 items-center">
        {/* View Name Input */}
        <input
          type="text"
          value={viewName}
          onChange={(e) => setViewName(e.target.value)}
          className="border border-brand rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
          placeholder="View Name"
        />

        {/* Filters Button */}
        <div className="relative" ref={filterPanelRef}>
          <button
            onClick={() => setIsFilterPanelOpen((prev) => !prev)}
            className="flex items-center px-3 py-1 bg-brand text-white rounded-md shadow-sm hover:bg-brand-light transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-dark"
          >
            {/* Heroicon: FunnelIcon */}
            <FunnelIcon className="w-5 h-5 mr-1" />
            Filters
          </button>

          {/* Filters Panel */}
          {isFilterPanelOpen && (
            <div
              className="absolute left-0 mt-1 w-80 bg-white border border-neutral-200 rounded-lg shadow-premium-lg p-3 z-50
                transition ease-out duration-300 transform opacity-100 scale-100 animate-fadeIn animate-scaleIn"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-semibold text-neutral-800">Filters</h3>
                <button
                  onClick={() => setIsFilterPanelOpen(false)}
                  className="text-neutral-500 hover:text-neutral-700 focus:outline-none"
                  aria-label="Close Filters Panel"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              {/* Filter List */}
              <FilterList
                filters={filters}
                setFilters={setFilters}
                availableColumns={availableColumns}
                showColumns={showColumns}
              />
              {/* Global Connector Selection */}
              <div className="mt-2">
                <h4 className="font-medium text-sm mb-1">Connector for All Filters</h4>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="globalConnector"
                      value="AND"
                      checked={globalConnector === 'AND'}
                      onChange={() => setGlobalConnector('AND')}
                      className="form-radio h-4 w-4 text-brand"
                    />
                    <span className="ml-1 text-xs text-neutral-700">AND</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="globalConnector"
                      value="OR"
                      checked={globalConnector === 'OR'}
                      onChange={() => setGlobalConnector('OR')}
                      className="form-radio h-4 w-4 text-brand"
                    />
                    <span className="ml-1 text-xs text-neutral-700">OR</span>
                  </label>
                </div>
              </div>
              {/* Footer */}
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => setIsFilterPanelOpen(false)}
                  className="flex items-center px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <XMarkIcon className="w-4 h-4 mr-1" />
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hide Fields Button */}
        <div className="relative" ref={hideFieldsPanelRef}>
          <button
            onClick={() => setIsHideFieldsPanelOpen((prev) => !prev)}
            className="flex items-center px-3 py-1 bg-brand text-white rounded-md shadow-sm hover:bg-brand-light transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-dark"
          >
            {/* Heroicon: EyeSlashIcon */}
            <EyeSlashIcon className="w-5 h-5 mr-1" />
            Hide Fields
          </button>

          {/* Hide Fields Panel */}
          {isHideFieldsPanelOpen && (
            <div
              className="absolute left-0 mt-1 w-80 bg-white border border-neutral-200 rounded-lg shadow-premium-lg p-3 z-50
                transition ease-out duration-300 transform opacity-100 scale-100 animate-fadeIn animate-scaleIn"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-semibold text-neutral-800">Select Columns to Display</h3>
                <button
                  onClick={() => setIsHideFieldsPanelOpen(false)}
                  className="text-neutral-500 hover:text-neutral-700 focus:outline-none"
                  aria-label="Close Hide Fields Panel"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              {/* Column Selector */}
              <ColumnSelector
                availableColumns={availableColumns}
                showColumns={showColumns}
                onChange={handleColumnChange}
              />
              {/* Footer */}
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => setIsHideFieldsPanelOpen(false)}
                  className="flex items-center px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <XMarkIcon className="w-4 h-4 mr-1" />
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sort Button */}
        <div className="relative" ref={sortPanelRef}>
          <button
            onClick={() => setIsSortPanelOpen((prev) => !prev)}
            className="flex items-center px-3 py-1 bg-brand text-white rounded-md shadow-sm hover:bg-brand-light transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-dark"
          >
            {/* Heroicon: ArrowsUpDownIcon */}
            <ArrowsUpDownIcon className="w-5 h-5 mr-1" />
            Sort
          </button>

          {/* Sort Panel */}
          {isSortPanelOpen && (
            <div
              className="absolute left-0 mt-1 w-80 bg-white border border-neutral-200 rounded-lg shadow-premium-lg p-3 z-50
                transition ease-out duration-300 transform opacity-100 scale-100 animate-fadeIn animate-scaleIn"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-semibold text-neutral-800">Sorting Options</h3>
                <button
                  onClick={() => setIsSortPanelOpen(false)}
                  className="text-neutral-500 hover:text-neutral-700 focus:outline-none"
                  aria-label="Close Sort Panel"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              {/* Sorting Controls */}
              <div>
                {sorting.map((sort, index) => (
                  <div key={index} className="flex items-center mb-1">
                    {/* Column Selection */}
                    <div className="relative mr-2">
                      <select
                        value={sort.column}
                        onChange={(e) => updateSorting(index, 'column', e.target.value)}
                        className="appearance-none w-32 border border-brand rounded-md p-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand"
                      >
                        <option value="">Select Column</option>
                        {showColumns.map((column) => (
                          <option key={column} value={column}>
                            {availableColumns[column].label}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="absolute right-1 top-1.5 h-4 w-4 text-gray-500 pointer-events-none" />
                    </div>

                    {/* Direction Selection */}
                    <div className="relative mr-2">
                      <select
                        value={sort.direction}
                        onChange={(e) =>
                          updateSorting(index, 'direction', e.target.value as 'asc' | 'desc')
                        }
                        className="appearance-none w-24 border border-brand rounded-md p-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand"
                        disabled={!sort.column}
                      >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                      </select>
                      <ChevronDownIcon className="absolute right-1 top-1.5 h-4 w-4 text-gray-500 pointer-events-none" />
                    </div>

                    {/* Remove Sorting Button with TrashIcon */}
                    <button
                      type="button"
                      onClick={() => removeSorting(index)}
                      className="text-red-500 hover:text-red-700 focus:outline-none"
                      aria-label="Remove Sorting"
                      title="Remove Sorting"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                {/* Add Sorting Button */}
                <button
                  type="button"
                  onClick={addSorting}
                  className="flex items-center px-3 py-1 bg-brand text-white rounded-md hover:bg-brand-light transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-dark mt-2 text-xs"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Sorting
                </button>
              </div>
              {/* Footer */}
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => setIsSortPanelOpen(false)}
                  className="flex items-center px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <XMarkIcon className="w-4 h-4 mr-1" />
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      <PaginationControls
        page={page}
        pageSize={pageSize}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default FilterComponent2;
