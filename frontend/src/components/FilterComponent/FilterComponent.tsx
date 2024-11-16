  import React, { useState, useEffect, useRef, useCallback } from 'react';
  import {
    FilterCondition,
    SortingOption,
    FilterConfig,
    FilterComponentProps,
    FrontendColumnType,
    BackendColumnType,
  } from '../../types/index';

  // Utility function to map backend types to frontend types (unchanged)
  const mapBackendToFrontendType = (backendType: BackendColumnType): FrontendColumnType => {
    switch (backendType) {
      case 'Int':
      case 'BigInt':
        return 'number';
      case 'String':
        return 'string';
      case 'Boolean':
        return 'boolean';
      case 'DateTime':
        return 'date';
      default:
        console.warn(`Unknown backend type "${backendType}". Defaulting to "string".`);
        return 'string';
    }
  };

  // Updated getOperators function with empty/not empty operators
  const getOperators = (type: FrontendColumnType): { value: string; label: string }[] => {
    const baseOperators = (() => {
      switch (type) {
        case 'number':
          return [
            { value: 'lt', label: 'Less Than' },
            { value: 'lte', label: 'Less Than or Equal' },
            { value: 'gt', label: 'Greater Than' },
            { value: 'gte', label: 'Greater Than or Equal' },
            { value: 'equals', label: 'Equals' },
          ];
        case 'string':
          return [
            { value: 'contains', label: 'Contains' },
            { value: 'startsWith', label: 'Starts With' },
            { value: 'endsWith', label: 'Ends With' },
            { value: 'equals', label: 'Equals' },
          ];
        case 'boolean':
          return [{ value: 'equals', label: 'Equals' }];
        case 'date':
          return [
            { value: 'lt', label: 'Before' },
            { value: 'gt', label: 'After' },
            { value: 'gte', label: 'On' },
          ];
        default:
          return [];
      }
    })();

    // Add empty/not empty operators for all types
    return [
      ...baseOperators,
      { value: 'isNull', label: 'Is Empty' },
      { value: 'isNotNull', label: 'Is Not Empty' },
    ];
  };

  // Extended filter condition without individual connectors
  interface ExtendedFilterCondition extends FilterCondition { }

  const FilterComponent: React.FC<FilterComponentProps> = ({
    availableColumns,
    onFilterChange,
    initialFilterConfig,
    page,
    pageSize,
    totalRecords,
    onPageChange,
  }) => {
    const [showColumns, setShowColumns] = useState<string[]>([]);
    const [filters, setFilters] = useState<ExtendedFilterCondition[]>([]);
    const [sorting, setSorting] = useState<SortingOption[]>([]);
    const [grouping, setGrouping] = useState<string[]>([]);
    const [viewName, setViewName] = useState<string>('Untitled View');
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const [globalConnector, setGlobalConnector] = useState<'AND' | 'OR'>('AND');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debouncedOnFilterChange = useRef<NodeJS.Timeout | null>(null);

    // Initialize shown columns 
    useEffect(() => {
      setShowColumns(Object.keys(availableColumns));
    }, [availableColumns]);

    // Initialize filters 
    useEffect(() => {
      if (initialFilterConfig) {
        setViewName(initialFilterConfig.viewName);
        setShowColumns(initialFilterConfig.columns);
        setGrouping(initialFilterConfig.grouping);

        // Parse the nested filters into a flat list
        const parsedFilters = parseFilters(initialFilterConfig.filters);
        setFilters(parsedFilters.filters);
        setGlobalConnector(parsedFilters.connector || 'AND'); // as the global connector

        // Parse the initial sorting configuration from backend format to frontend format
        if (initialFilterConfig.sorting) {
          const parsedSorting = initialFilterConfig.sorting.map((sortObj) => {
            const column = Object.keys(sortObj)[0];
            const direction = sortObj[column];
            return { column, direction };
          });
          setSorting(parsedSorting);
        } else {
          setSorting([]);
        }
      }
    }, [initialFilterConfig]);

    // Toggle columns dropdown
    const toggleDropdown = () => {
      setDropdownOpen(!dropdownOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setDropdownOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    // Handle show/hide column selection
    const handleCheckboxChange = (column: string) => {
      setShowColumns((prev) =>
        prev.includes(column)
          ? prev.filter((col) => col !== column)
          : [...prev, column]
      );
    };

    // Add a new empty filter
    const addFilter = () => {
      setFilters([...filters, { column: '', operator: '', value: '' }]);
    };

    // Update a specific filter field
    const updateFilter = (
      index: number,
      field: keyof ExtendedFilterCondition,
      value: any
    ) => {
      const updatedFilters = [...filters];
      updatedFilters[index][field] = value;
      setFilters(updatedFilters);
    };

    // Remove a specific filter
    const removeFilter = (index: number) => {
      const updatedFilters = [...filters];
      updatedFilters.splice(index, 1);
      setFilters(updatedFilters);
    };

    // Add a new sorting option
    const addSortingOption = () => {
      setSorting([...sorting, { column: '', direction: 'asc' }]);
    };

    // Update a specific sorting field
    const updateSorting = (
      index: number,
      field: keyof SortingOption,
      value: any
    ) => {
      const updatedSorting = [...sorting];
      updatedSorting[index][field] = value;
      setSorting(updatedSorting);
    };

    // Remove a specific sorting option
    const removeSorting = (index: number) => {
      const updatedSorting = [...sorting];
      updatedSorting.splice(index, 1);
      setSorting(updatedSorting);
    };

    // Helper function to parse nested filters into a flat list with a global connector
    const parseFilters = useCallback(
      (
        filtersObj: any
      ): { filters: ExtendedFilterCondition[]; connector: 'AND' | 'OR' } => {
        const result: ExtendedFilterCondition[] = [];
        let connector: 'AND' | 'OR' = 'AND';
        let isConnectorSet = false;

        const traverse = (obj: any, isRoot = false) => {
          for (const key in obj) {
            if (['AND', 'OR', 'NOT'].includes(key)) {
              if (isRoot && !isConnectorSet) {
                connector = key as 'AND' | 'OR';
                isConnectorSet = true;
              }
              const subFilters = obj[key];
              if (Array.isArray(subFilters)) {
                subFilters.forEach((subFilter: any) => {
                  traverse(subFilter);
                });
              }
            } else {
              const condition = obj[key];
              for (const operator in condition) {
                const value = condition[operator];
                result.push({
                  column: key,
                  operator,
                  value,
                });
              }
            }
          }
        };
        traverse(filtersObj, true);
        return { filters: result, connector };
      },
      []
    );

    // Construct filterConfig based on current state
    const constructFilterConfig = useCallback((): FilterConfig => {
      // Construct filters object based on globalConnector
      const buildWhereClause = (
        filters: ExtendedFilterCondition[],
        connector: 'AND' | 'OR'
      ): any => {
        if (filters.length === 0) return {};

        const conditions = filters
          .filter(
            (filter) => filter.column && filter.operator && (filter.value !== '' || ['isNull', 'isNotNull'].includes(filter.operator))
          )
          .map((filter) => {
            // Handle special cases for isNull and isNotNull
            if (filter.operator === 'isNull') {
              return {
                [filter.column]: {
                  equals: null,
                },
              };
            }
            if (filter.operator === 'isNotNull') {
              return {
                [filter.column]: {
                  not: null,
                },
              };
            }

            // Special handling for date values
            const columnType = mapBackendToFrontendType(
              availableColumns[filter.column]?.type || 'String'
            );
            
            let value = filter.value;
            if (columnType === 'date') {
              value = new Date(filter.value).toISOString();
            }

            return { [filter.column]: { [filter.operator]: value } };
          });

        if (conditions.length === 0) return {};

        return {
          [connector]: conditions,
        };
      };

      const filtersObject = buildWhereClause(filters, globalConnector);

      // Construct sortingArray in the backend-expected format
      const sortingArray = sorting
        .filter((s) => s.column && s.direction)
        .map((s) => ({ [s.column]: s.direction }));

      const columnsToShow = showColumns;

      const filterConfig: FilterConfig = {
        viewName,
        columns: columnsToShow,
        filters: filtersObject,
        sorting: sortingArray,
        grouping: grouping,
      };

      return filterConfig;
    }, [filters, globalConnector, sorting, showColumns, viewName, grouping, availableColumns]);

    // Debounced effect to call onFilterChange when filters change
    useEffect(() => {
      if (debouncedOnFilterChange.current) {
        clearTimeout(debouncedOnFilterChange.current);
      }

      debouncedOnFilterChange.current = setTimeout(() => {
        const filterConfig = constructFilterConfig();
        onFilterChange(filterConfig);
      }, 500); // Adjust debounce time as needed

      return () => {
        if (debouncedOnFilterChange.current) {
          clearTimeout(debouncedOnFilterChange.current);
        }
      };
    }, [constructFilterConfig, onFilterChange]);

    // Updated render logic for the filter value input
    const renderFilterValueInput = (filter: ExtendedFilterCondition, index: number, columnType: FrontendColumnType) => {
      // Don't show value input for isNull/isNotNull operators
      if (['isNull', 'isNotNull'].includes(filter.operator)) {
        return null;
      }

      if (columnType === 'boolean') {
        return (
          <div className="flex items-center mr-2">
            <input
              type="checkbox"
              checked={filter.value === true}
              onChange={(e) => updateFilter(index, 'value', e.target.checked)}
              className="mr-2"
            />
            <span>True</span>
          </div>
        );
      }

      return (
        <input
          type={
            columnType === 'number'
              ? 'number'
              : columnType === 'date'
                ? 'date'
                : 'text'
          }
          value={filter.value}
          onChange={(e) =>
            updateFilter(
              index,
              'value',
              columnType === 'number'
                ? e.target.value === ''
                  ? ''
                  : Number(e.target.value)
                : e.target.value
            )
          }
          className="mr-2 border border-gray-300 rounded p-2 flex-1"
          placeholder="Enter value"
        />
      );
    };

    return (
      <div className="bg-white p-4 rounded shadow mb-4">
        <h3 className="text-xl font-semibold mb-4">Filter Options</h3>

        {/* View Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">View Name</label>
          <input
            type="text"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Enter view name"
          />
        </div>

        {/* Show/Hide Columns as Custom Multi-Select Dropdown */}
        <div className="mb-4" ref={dropdownRef}>
          <h4 className="font-medium">Show/Hide Columns</h4>
          <div className="relative mt-2">
            <button
              type="button"
              onClick={toggleDropdown}
              className="w-full border border-gray-300 rounded-md p-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center"
            >
              <span>
                {showColumns.length > 0
                  ? `${showColumns.length} Column${showColumns.length > 1 ? 's' : ''} Selected`
                  : 'Select Columns'}
              </span>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${dropdownOpen ? 'transform rotate-180' : ''
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {Object.keys(availableColumns).map((column) => (
                  <label key={column} className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showColumns.includes(column)}
                      onChange={() => handleCheckboxChange(column)}
                      className="mr-2"
                    />
                    <span className="text-sm">{availableColumns[column].label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

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

        {/* Updated Filters section */}
        <div className="mb-4">
          <h4 className="font-medium">Filters</h4>
          {filters.map((filter, index) => {
            const columnType = mapBackendToFrontendType(
              availableColumns[filter.column]?.type || 'String'
            );
            const operators = getOperators(columnType);

            return (
              <div key={index} className="flex flex-wrap items-center mb-2">
                {/* Column Selection */}
                <select
                  value={filter.column}
                  onChange={(e) => updateFilter(index, 'column', e.target.value)}
                  className="mr-2 border border-gray-300 rounded p-2"
                >
                  <option value="">Select Column</option>
                  {showColumns.map((column) => (
                    <option key={column} value={column}>
                      {availableColumns[column].label}
                    </option>
                  ))}
                </select>

                {/* Operator Selection */}
                <select
                  value={filter.operator}
                  onChange={(e) => {
                    updateFilter(index, 'operator', e.target.value);
                    // Clear value when switching to isNull/isNotNull
                    if (['isNull', 'isNotNull'].includes(e.target.value)) {
                      updateFilter(index, 'value', '');
                    }
                  }}
                  className="mr-2 border border-gray-300 rounded p-2"
                  disabled={!filter.column}
                >
                  <option value="">Select Operator</option>
                  {operators.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>

                {/* Render Filter Value Input */}
                {renderFilterValueInput(filter, index, columnType)}

                {/* Remove Filter Button */}
                <button
                  type="button"
                  onClick={() => removeFilter(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            );
          })}

          {/* Add Filter Button */}
          <div className="mt-2">
            <button
              type="button"
              onClick={addFilter}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Filter
            </button>
          </div>
        </div>

        {/* Sorting */}
        <div className="mb-4">
          <h4 className="font-medium">Sorting</h4>
          {sorting.map((sort, index) => (
            <div key={index} className="flex items-center mb-2">
              {/* Column Selection */}
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

              {/* Direction Selection */}
              <select
                value={sort.direction}
                onChange={(e) =>
                  updateSorting(index, 'direction', e.target.value as 'asc' | 'desc')
                }
                className="mr-2 border border-gray-300 rounded p-2"
                disabled={!sort.column}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>

              {/* Remove Sorting Button */}
              <button
                type="button"
                onClick={() => removeSorting(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}

          {/* Add Sorting Button */}
          <button
            type="button"
            onClick={addSortingOption}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Sorting
          </button>
        </div>

        {/* Pagination Controls */}
        <div className="pagination-control mt-4 flex items-center space-x-4">
          <label>
            Page Size:
            <select
              value={pageSize}
              onChange={(e) => onPageChange(page, parseInt(e.target.value))}
              className="ml-2 border rounded p-1"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </label>

          <label>
            Page Number
            <input
              className="mx-3 border rounded p-1"
              type="number"
              value={page}
              min={1}
              max={Math.ceil(totalRecords / pageSize)}
              onChange={(e) => {
                onPageChange(parseInt(e.target.value), pageSize);
              }}
            />
            / of {Math.ceil(totalRecords / pageSize)} pages.
          </label>
          <button
            onClick={() => onPageChange(page - 1, pageSize)}
            disabled={page === 1}
            className="border rounded px-2 py-1"
          >
            &lt;
          </button>

          <button
            onClick={() => onPageChange(page + 1, pageSize)}
            disabled={page === Math.ceil(totalRecords / pageSize)}
            className="border rounded px-2 py-1"
          >
            &gt;
          </button>
        </div>
      </div>
    );
  };

  export default FilterComponent;
