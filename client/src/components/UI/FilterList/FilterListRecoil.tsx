import React from 'react';
import {
  ExtendedFilterCondition,
  FrontendAvailableColumns,
  FilterConfig,
} from '../../../types';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  currentFilterConfigState,
  availableColumnsState,
} from '../../../store/atoms/atoms';
import FilterRow from './FilterRow'; // Import the new FilterRow component

interface FilterListRecoilProps {
  resource: string;
}

const FilterListRecoil: React.FC<FilterListRecoilProps> = ({ resource }) => {
  const [currentFilterConfig, setCurrentFilterConfig] = useRecoilState<
    FilterConfig | null
  >(currentFilterConfigState(resource));

  const availableColumns = useRecoilValue<FrontendAvailableColumns>(
    availableColumnsState(resource)
  );

  const filters = currentFilterConfig?.filters || [];
  const showColumns = currentFilterConfig?.columns || [];

  // Function to add a new filter
  const addFilter = () => {
    setCurrentFilterConfig((prevConfig: any) => {
      if (prevConfig) {
        const updatedFilters = [
          ...filters,
          {
            id: generateUniqueId(),
            column: '',
            operator: '',
            value: '',
            connector: 'AND',
          },
        ];
        return {
          ...prevConfig,
          filters: updatedFilters,
        };
      }
      return prevConfig;
    });
  };

  // Function to update a filter
  const updateFilter = (
    index: number,
    field: keyof ExtendedFilterCondition,
    value: any
  ) => {
    setCurrentFilterConfig((prevConfig) => {
      if (prevConfig) {
        const updatedFilters = [...filters];
        const filter = { ...updatedFilters[index], [field]: value };

        if (field === 'column') {
          filter.operator = '';
          filter.value = '';
        }

        if (field === 'operator' && ['isNull', 'isNotNull'].includes(value)) {
          filter.value = '';
        }

        updatedFilters[index] = filter;

        return {
          ...prevConfig,
          filters: updatedFilters,
        };
      }
      return prevConfig;
    });
  };

  // Function to remove a filter
  const removeFilter = (index: number) => {
    setCurrentFilterConfig((prevConfig) => {
      if (prevConfig) {
        const updatedFilters = prevConfig.filters.filter((_, i) => i !== index);
        return {
          ...prevConfig,
          filters: updatedFilters,
        };
      }
      return prevConfig;
    });
  };

  console.log("filters : ", filters);

  return (
    <div className="mb-3">
      <h4 className="font-medium text-sm text-neutral-800 mb-2">Filters</h4>
      <div>
        {filters.map((filter, index) => (
          <div key={filter.id} className="filter">
            <FilterRow
              filter={filter}
              index={index}
              availableColumns={availableColumns}
              showColumns={showColumns}
              updateFilter={updateFilter}
              removeFilter={removeFilter}
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
  );
};

const generateUniqueId = () => {
  return Math.random().toString(36).substring(2, 9);
};

export default FilterListRecoil;
