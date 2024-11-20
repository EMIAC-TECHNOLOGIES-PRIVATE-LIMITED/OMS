import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FilterConfig,
  FilterComponentProps,
  ExtendedFilterCondition,
} from '../../types';

import { useFilters, useSorting, useColumns } from '../../hooks';
import { ColumnSelector, FilterList, PaginationControls } from '../UI';
import { mapBackendToFrontendType } from '../../utils';

const FilterComponent2: React.FC<FilterComponentProps & {
  page: number;
  pageSize: number;
  onPageChange: (newPage?: number, newPageSize?: number) => void;
}> = ({
  availableColumns,
  onFilterChange,
  initialFilterConfig,
  totalRecords,
  onPageChange,
  page,
  pageSize,
}) => {
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
          columns: columns
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
        ? Object.keys(initialFilterConfig.filters)[0] as 'AND' | 'OR'
        : 'AND'
    );

    // Sorting
    const { sorting,
      setSorting,
      updateSorting,
      addSorting,
      removeSorting } = useSorting(
        
        initialFilterConfig?.sorting || []
      );

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
        .filter(sort => sort.column && sort.direction)
        .map(sort => ({
          [sort.column]: sort.direction
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

    return (
      <div className="bg-white p-4 rounded shadow mb-4">
        <h3 className="text-xl font-semibold mb-4">Filter Options</h3>

        {/* View Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            View Name
          </label>
          <input
            type="text"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Enter view name"
          />
        </div>

        {/* Column Selector */}
        <ColumnSelector
          availableColumns={availableColumns}
          showColumns={showColumns}
          onChange={handleColumnChange}
        />

        {/* Global Connector Selection */}
        <div className="mb-4">
          <h4 className="font-medium">Connector for All Filters</h4>
          <div className="flex items-center mt-2">
            <label className="mr-4 flex items-center">
              <input
                type="radio"
                name="globalConnector"
                value="AND"
                checked={globalConnector === 'AND'}
                onChange={() => setGlobalConnector('AND')}
                className="mr-2"
              />
              AND
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="globalConnector"
                value="OR"
                checked={globalConnector === 'OR'}
                onChange={() => setGlobalConnector('OR')}
                className="mr-2"
              />
              OR
            </label>
          </div>
        </div>

        {/* Filter List */}
        { <FilterList
          filters={filters}
          setFilters={setFilters}
          availableColumns={availableColumns}
          showColumns={showColumns}
        /> }

<div className="mb-4">
        <h4 className="font-medium">Sorting</h4>
        {sorting.map((sort, index) => (
          <div key={index} className="flex items-center mb-2">
            <select
              value={sort.column}
              onChange={(e) => updateSorting(index, 'column', e.target.value)}
              className="mr-2 border border-gray-300 rounded p-2"
            >
              <option value="">Select Column</option>
              {showColumns.map((column) => (
                <option key={column} value={column}>
                  {availableColumns[column].label}
                </option>
              ))}
            </select>

            <select
              value={sort.direction}
              onChange={(e) => updateSorting(index, 'direction', e.target.value as 'asc' | 'desc')}
              className="mr-2 border border-gray-300 rounded p-2"
              disabled={!sort.column}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>

            <button
              type="button"
              onClick={() => removeSorting(index)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addSorting}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Sorting
        </button>
      </div>

        {/* Sorting List */}
        {/* <SortingList
          sorting={sorting}
          setSorting={setSorting}
          availableColumns={availableColumns}
          showColumns={showColumns}
        /> */}

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
