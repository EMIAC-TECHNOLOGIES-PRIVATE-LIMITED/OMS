// src/components/FilterList.tsx

import React from 'react';
import { ExtendedFilterCondition, FrontendAvailableColumns } from '../../../types';
import { mapBackendToFrontendType, getOperators } from '../../../utils'


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
  const addFilter = () => {
    setFilters([...filters, { column: '', operator: '', value: '' }]);
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
      value={filter.value} // Ensure this is the current input value, not columnType
      onChange={(e) => {
        const newValue =
          columnType === 'number'
            ? e.target.valueAsNumber || 0  // Use null or another default if parsing fails
            : e.target.value;
        updateFilter(index, 'value', newValue);
      }}
      className="mr-2 border border-gray-300 rounded p-2 flex-1"
      placeholder="Enter value"
    />
    
    );
  };

  return (
    <div className="mb-4">
      <h4 className="font-medium">Filters</h4>
      {filters.map((filter, index) => {
        const columnType = mapBackendToFrontendType(
          availableColumns[filter.column]?.type || 'String'
        );
        const operators = getOperators(columnType);

        return (
          <div key={index} className="flex flex-wrap items-center mb-2">
            <select
              value={filter.column}
              onChange={(e) => updateFilter(index, 'column', e.target.value)}
              className="mr-2 border border-gray-300 rounded p-2"
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

            {renderFilterValueInput(filter, index, columnType)}

            <button
              type="button"
              onClick={() => removeFilter(index)}
              className="text-red-500 hover:text-red-700 ml-2"
            >
              Remove
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addFilter}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Filter
      </button>
    </div>
  );
};

export default FilterList;
