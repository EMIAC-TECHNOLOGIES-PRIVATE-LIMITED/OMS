import React, { useState } from 'react';
import { FilterConfig, LogicalOperator } from '../../../../../shared/src/types';
import Button from '../Button/Button';
import PanelNew from '../Panel/Panel';
import { FunnelIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import IconButton from '../IconButton/IconButton';
import { availableColumnsTypes } from '../../../types';

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

  const currentConnector: LogicalOperator = LogicalOperator.AND;

  const addFilter = () => {
    const newFilter = { column: '', condition: {}, operator: currentConnector };

    onFilterChange({
      ...filterConfig,
      appliedFilters: {
        [currentConnector]: [...(filterConfig.appliedFilters[currentConnector] || []), newFilter],
      },
    });
  };

  const updateFilter = (index: number, field: 'column' | 'condition', value: any) => {
    const updatedFilters = [...(filterConfig.appliedFilters[currentConnector] || [])];
    const filter = { ...updatedFilters[index] };

    if (field === 'column') {
      filter.column = value;
      filter.condition = {}; // Reset condition on column change
    } else {
      filter.condition = value;
    }

    updatedFilters[index] = filter;
    onFilterChange({
      ...filterConfig,
      appliedFilters: {
        [currentConnector]: updatedFilters,
      },
    });
  };

  const removeFilter = (index: number) => {
    const updatedFilters = [...(filterConfig.appliedFilters[currentConnector] || [])];
    updatedFilters.splice(index, 1);
    onFilterChange({
      ...filterConfig,
      appliedFilters: {
        [currentConnector]: updatedFilters,
      },
    });
  };

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
            {(filterConfig.appliedFilters[currentConnector] || []).map((filter, index) => (
              <div key={index} className="flex flex-col gap-2 mb-2 p-2 bg-white rounded-md shadow-sm">
                {/* Column Selection */}
                <select
                  value={filter.column || ''}
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

                {/* Condition */}
                {filter.column && (
                  <select
                    value={Object.keys(filter.condition)[0] || ''}
                    onChange={(e) =>
                      updateFilter(index, 'condition', {
                        [e.target.value]: '',
                      })
                    }
                    className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                  >
                    <option value="">Select Condition</option>
                    {getOperatorsByType(availableColumnsTypes[filter.column]).map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                )}

                {/* Value Input */}
                {filter.column && filter.condition && (
                  <input
                    type="text"
                    value={Object.values(filter.condition)[0] || ''}
                    onChange={(e) =>
                      updateFilter(index, 'condition', {
                        [Object.keys(filter.condition)[0]]: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                    placeholder="Enter value"
                  />
                )}

                {/* Remove Filter Button */}
                <IconButton
                  icon={<TrashIcon className="w-4 h-4 text-red-500" />}
                  ariaLabel="Remove Filter"
                  onClick={() => removeFilter(index)}
                  className="ml-auto"
                />
              </div>
            ))}
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
