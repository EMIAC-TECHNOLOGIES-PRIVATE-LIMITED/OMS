import React, { useState } from 'react';
import { ExtendedFilterCondition, FrontendAvailableColumns } from '../../../types';
import { mapBackendToFrontendType, getOperators } from '../../../utils';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import IconButton from '../IconButton/IconButton'; // Reusable IconButton component
import { useTypeAhead } from '../../../hooks'; // New hook

interface FilterListProps {
  filters: ExtendedFilterCondition[];
  setFilters: React.Dispatch<React.SetStateAction<ExtendedFilterCondition[]>>;
  availableColumns: FrontendAvailableColumns;
  showColumns: string[];
}

const FilterList: React.FC<FilterListProps> = ({
  filters,
  setFilters,
  availableColumns,
  showColumns,
}) => {
  // Function to generate a unique ID for each filter
  const generateUniqueId = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  const addFilter = () => {
    setFilters([
      ...filters,
      {
        id: generateUniqueId(),
        column: '',
        operator: '',
        value: '',
        connector: 'AND',
      },
    ]);
  };

  const updateFilter = (
    index: number,
    field: keyof ExtendedFilterCondition,
    value: any
  ) => {
    setFilters((prevFilters) => {
      const updatedFilters = [...prevFilters];
      const filter = { ...updatedFilters[index], [field]: value };

      // Reset operator and value when column changes
      if (field === 'column') {
        filter.operator = '';
        filter.value = '';
      }

      // Clear value when operator is isNull or isNotNull
      if (field === 'operator' && ['isNull', 'isNotNull'].includes(value)) {
        filter.value = '';
      }

      updatedFilters[index] = filter;
      return updatedFilters;
    });
  };

  const removeFilter = (index: number) => {
    setFilters((prevFilters) => prevFilters.filter((_, i) => i !== index));
  };

  const renderFilterValueInput = (
    filter: ExtendedFilterCondition,
    index: number,
    columnType: string
  ) => {
    const { suggestions, fetchSuggestions, resetSuggestions } = useTypeAhead();
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'ArrowDown') {
        setActiveSuggestionIndex((prevIndex) =>
          prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
        );
      } else if (event.key === 'ArrowUp') {
        setActiveSuggestionIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : prevIndex
        );
      } else if (event.key === 'Enter') {
        if (activeSuggestionIndex >= 0) {
          updateFilter(index, 'value', suggestions[activeSuggestionIndex]);
          resetSuggestions();
        }
      } else if (event.key === 'Escape') {
        resetSuggestions();
      }
    };

    if (['isNull', 'isNotNull'].includes(filter.operator)) {
      return null;
    }

    if (columnType === 'boolean') {
      return (
        <div className="flex items-center space-x-1 mr-2">
          <input
            type="checkbox"
            checked={Boolean(filter.value) === true}
            onChange={(e) => updateFilter(index, 'value', e.target.checked)}
            className="form-checkbox h-4 w-4 text-brand focus:ring-brand-dark"
          />
          <span className="text-sm text-neutral-700">True</span>
        </div>
      );
    }

    return (
      <div className="relative">
        <input
          type={
            columnType === 'number'
              ? 'number'
              : columnType === 'date'
              ? 'date'
              : 'text'
          }
          value={filter.value as string}
          onChange={(e) => {
            const newValue =
              columnType === 'number'
                ? e.target.valueAsNumber
                : e.target.value;

            updateFilter(index, 'value', newValue);

            if (columnType === 'string') {
              fetchSuggestions(filter.column, newValue as string);
            }
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => resetSuggestions()}
          className="border border-brand rounded-md p-1 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-brand-dark"
          placeholder="Enter value"
        />
        {columnType === 'string' && suggestions.length > 0 && (
          <ul className="absolute bg-white border border-neutral-200 rounded-md shadow-lg mt-1 z-50 max-h-40 overflow-y-auto w-full">
            {suggestions.map((suggestion, i) => (
              <li
                key={i}
                className={`p-2 text-sm text-neutral-800 cursor-pointer hover:bg-brand-light ${i === activeSuggestionIndex ? 'bg-brand-light' : ''
                  }`}
                onMouseDown={() => {
                  updateFilter(index, 'value', suggestion);
                  resetSuggestions();
                }}
                onMouseEnter={() => setActiveSuggestionIndex(i)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="mb-3">
      <h4 className="font-medium text-sm text-neutral-800 mb-2">Filters</h4>
      <div>
        {filters.map((filter, index) => {
          const columnType = mapBackendToFrontendType(
            availableColumns[filter.column]?.type || 'String'
          );
          const operators = getOperators(columnType);

          return (
            <div key={filter.id} className="flex flex-wrap items-center mb-2 bg-white p-2 rounded-md shadow-sm">
              <select
                value={filter.column}
                onChange={(e) => updateFilter(index, 'column', e.target.value)}
                className="mr-2 border border-brand rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
              >
                <option value="">Select Column</option>
                {showColumns.map((col) => (
                  <option key={col} value={col}>
                    {availableColumns[col].label}
                  </option>
                ))}
              </select>

              <select
                value={filter.operator}
                onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                className="mr-2 border border-brand rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                disabled={!filter.column}
              >
                <option value="">Select Operator</option>
                {operators.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>

              {renderFilterValueInput(filter, index, columnType)}

              <IconButton
                icon={<TrashIcon className="w-4 h-4 text-red-500" />}
                ariaLabel="Remove Filter"
                onClick={() => removeFilter(index)}
                className="ml-2"
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addFilter}
        className="flex items-center px-3 py-1 bg-brand text-white rounded-md hover:bg-brand-light transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-dark text-sm"
      >
        <PlusIcon className="w-4 h-4 mr-1" />
        Add Filter
      </button>
    </div>
  );
};

export default FilterList;
