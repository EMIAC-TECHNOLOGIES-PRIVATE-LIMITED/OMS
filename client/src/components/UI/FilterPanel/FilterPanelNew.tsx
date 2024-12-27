import React, { useState } from 'react';
import { FilterConfig, LogicalOperator } from '../../../../../shared/src/types';
import Button from '../Button/Button';
import PanelNew from '../Panel/Panel';
import { FunnelIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import IconButton from '../IconButton/IconButton';
import { availableColumnsTypes } from '../../../types';

/**
 * FilterPanelNew Component
 * ------------------------
 * This component allows dynamic addition, modification, and deletion of filters based on various columns and conditions.
 * 
 * Key Features:
 * - Filters are grouped under logical connectors (AND/OR).
 * - Users can select columns, conditions (e.g., equals, contains), and input values dynamically.
 * - Handles multiple data types (string, number, boolean, date) with tailored operators for each.
 * 
 * Main Functionalities:
 * - `addFilter`: Adds a new filter with default column and condition.
 * - `updateFilter`: Updates a filter's column, condition, or value.
 * - `removeFilter`: Removes a filter from the current connector group.
 * - `getOperatorsByType`: Provides appropriate operators based on the column's data type.
 * 
 * Props:
 * - `filterConfig`: Manages the applied filters and sorting configurations.
 * - `availableColumnsTypes`: Defines column names and their respective data types.
 * - `onFilterChange`: Callback to update the parent state with the modified filter configuration.
 * 
 * State Management:
 * - `isFilterPanelOpen`: Toggles the visibility of the filter panel.
 * - `filterConfig.appliedFilters`: Dynamically updates based on user interactions.
 * 
 * Interaction Flow:
 * 1. Add Filter: Adds a default filter with an empty condition.
 * 2. Update Filter: Allows users to change columns, conditions, or values.
 * 3. Remove Filter: Deletes the selected filter.
 * 
 * Rendering:
 * - Dynamically renders filters with dropdowns for columns and conditions and input boxes for values.
 * - Displays the count of applied filters.
 */

interface FilterPanelNewProps {
  resource: string;
  filterConfig: FilterConfig;
  availableColumnsTypes: availableColumnsTypes;
  onFilterChange: (newFilterConfig: FilterConfig) => void;
}

const FilterPanelNew: React.FC<FilterPanelNewProps> = ({
  filterConfig,
  availableColumnsTypes,
  onFilterChange,
}) => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);

  const currentConnector: LogicalOperator = LogicalOperator.AND; // Default connector

  // Utility: Create a default filter for a column
  const getDefaultFilter = (column: string) => ({
    [column]: { equals: '' },
  });

  // Add a new filter
  const addFilter = () => {
    const defaultColumn = Object.keys(availableColumnsTypes)[0] || ''; // Use first available column
    const newFilter = getDefaultFilter(defaultColumn);

    onFilterChange({
      ...filterConfig,
      appliedFilters: {
        ...filterConfig.appliedFilters,
        [currentConnector]: [
          ...(filterConfig.appliedFilters[currentConnector] || []),
          newFilter,
        ],
      },
    });
  };

  // Update an existing filter
  const updateFilter = (index: number, field: 'column' | 'condition', value: any) => {
    const existingFilters = filterConfig.appliedFilters[currentConnector] || [];
    const updatedFilters = [...existingFilters];

    if (field === 'column') {
      const newFilter = getDefaultFilter(value); 
      updatedFilters[index] = newFilter;
    } else {
      const currentColumn = Object.keys(existingFilters[index])[0];
      updatedFilters[index] = { [currentColumn]: value };
    }

    onFilterChange({
      ...filterConfig,
      appliedFilters: {
        ...filterConfig.appliedFilters,
        [currentConnector]: updatedFilters,
      },
    });
  };

  // Remove a filter
  const removeFilter = (index: number) => {
    const existingFilters = filterConfig.appliedFilters[currentConnector] || [];
    const updatedFilters = existingFilters.filter((_, i) => i !== index);

    onFilterChange({
      ...filterConfig,
      appliedFilters: {
        ...filterConfig.appliedFilters,
        [currentConnector]: updatedFilters,
      },
    });
  };

  // Get operators by data type
  const getOperatorsByType = (type: string) => {
    switch (type) {
      case 'string':
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'startsWith', label: 'Starts With' },
          { value: 'endsWith', label: 'Ends With' },
        ];
      case 'number':
        return [
          { value: 'gte', label: 'Greater Than or Equal To' },
          { value: 'lte', label: 'Less Than or Equal To' },
          { value: 'equals', label: 'Equals' },
        ];
      case 'boolean':
        return [
          { value: 'equals', label: 'Equals' },
        ];
      case 'date':
        return [
          { value: 'before', label: 'Before' },
          { value: 'after', label: 'After' },
          { value: 'equals', label: 'Equals' },
        ];
      default:
        return [];
    }
  };

  const showColumns = Object.keys(availableColumnsTypes);

  return (
    <div className="relative">
      <Button
        onClick={() => setIsFilterPanelOpen((prev) => !prev)}
        icon={<FunnelIcon className="w-5 h-5 mr-1" />}
        label={`Filters (${filterConfig.appliedFilters[currentConnector]?.length || 0})`}
      />

      <PanelNew
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        title="Filters"
      >
        <div className="mb-3">
          <h4 className="font-medium text-sm text-neutral-800 mb-2">Filters</h4>
          <div>
            {(filterConfig.appliedFilters[currentConnector] || []).map((filter, index) => {
              const [column, condition] = Object.entries(filter)[0];

              return (
                <div
                  key={index}
                  className="flex flex-col gap-2 mb-2 p-2 bg-white rounded-md shadow-sm"
                >
                  {/* Column Selection */}
                  <select
                    value={column || ''}
                    onChange={(e) => updateFilter(index, 'column', e.target.value)}
                    className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                  >
                    <option value="">Select Column</option>
                    {showColumns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>

                  {/* Condition Selection */}
                  <select
                    value={Object.keys(condition)[0] || ''}
                    onChange={(e) =>
                      updateFilter(index, 'condition', {
                        [e.target.value]: Object.values(condition)[0] || '',
                      })
                    }
                    className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                  >
                    <option value="">Select Condition</option>
                    {getOperatorsByType(availableColumnsTypes[column]).map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>

                  {/* Value Input */}
                  <input
                    type="text"
                    value={Object.values(condition)[0] || ''}
                    onChange={(e) =>
                      updateFilter(index, 'condition', {
                        [Object.keys(condition)[0]]: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                    placeholder="Enter value"
                  />

                  {/* Remove Filter Button */}
                  <IconButton
                    icon={<TrashIcon className="w-4 h-4 text-red-500" />}
                    ariaLabel="Remove Filter"
                    onClick={() => removeFilter(index)}
                    className="ml-auto"
                  />
                </div>
              );
            })}
          </div>

          {/* Add Filter Button */}
          <button
            type="button"
            onClick={addFilter}
            className="flex items-center px-3 py-1 bg-brand text-white rounded-md hover:bg-brand-light transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-dark text-sm"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Add Filter
          </button>
        </div>
      </PanelNew>
    </div>
  );
};

export default FilterPanelNew;
