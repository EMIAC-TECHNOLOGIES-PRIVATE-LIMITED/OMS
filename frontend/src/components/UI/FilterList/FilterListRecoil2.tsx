// src/components/UI/FilterList/FilterListRecoil.tsx

import React, { useState } from 'react';
import {
  ExtendedFilterCondition,
  FrontendAvailableColumns,
  FilterConfig,
} from '../../../types';
import { mapBackendToFrontendType, getOperators } from '../../../utils';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import IconButton from '../IconButton/IconButton';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useTypeAhead } from '../../../hooks';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  currentFilterConfigState,
  availableColumnsState,
} from '../../../store/atoms/atoms';
import Button from '../Button/Button';

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

  if (!currentFilterConfig) {
    return null;
  }

  const filters = currentFilterConfig.filters || [];
  const showColumns = currentFilterConfig.columns || [];

  const setFilters = (
    newFilters:
      | ExtendedFilterCondition[]
      | ((
          prevFilters: ExtendedFilterCondition[]
        ) => ExtendedFilterCondition[])
  ) => {
    setCurrentFilterConfig((prevConfig) => {
      if (prevConfig) {
        const updatedFilters =
          typeof newFilters === 'function'
            ? newFilters(prevConfig.filters || [])
            : newFilters;
        return {
          ...prevConfig,
          filters: updatedFilters,
        };
      }
      return prevConfig;
    });
  };

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
    setFilters((prevFilters: ExtendedFilterCondition[]) => {
      const updatedFilters = [...prevFilters];
      const filter = { ...updatedFilters[index], [field]: value };

      if (field === 'column') {
        filter.operator = '';
        filter.value = '';
      }

      if (field === 'operator' && ['isNull', 'isNotNull'].includes(value)) {
        filter.value = '';
      }

      updatedFilters[index] = filter;
      return updatedFilters;
    });
  };

  const removeFilter = (index: number) => {
    setFilters((prevFilters: ExtendedFilterCondition[]) =>
      prevFilters.filter((_, i) => i !== index)
    );
  };

  const renderFilterValueInput = (
    filter: ExtendedFilterCondition,
    index: number,
    columnType: string
  ) => {
    const { suggestions, fetchSuggestions, resetSuggestions } = useTypeAhead();
    const [activeSuggestionIndex, setActiveSuggestionIndex] =
      useState<number>(-1);

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

    const columnTypeLower = columnType.toLowerCase();

    if (columnTypeLower === 'boolean') {
      return (
        <div className="flex items-center space-x-1 mr-2">
          <input
            type="checkbox"
            checked={Boolean(filter.value)}
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
            columnTypeLower === 'number'
              ? 'number'
              : columnTypeLower === 'date'
              ? 'date'
              : 'text'
          }
          value={filter.value as string}
          onChange={(e) => {
            const newValue =
              columnTypeLower === 'number'
                ? e.target.valueAsNumber
                : e.target.value;

            updateFilter(index, 'value', newValue);

            if (columnTypeLower === 'string') {
              fetchSuggestions(filter.column, newValue as string);
            }
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => resetSuggestions()}
          className="border border-brand rounded-md p-1 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-brand-dark"
          placeholder="Enter value"
        />
        {columnTypeLower === 'string' && suggestions.length > 0 && (
          <ul className="absolute bg-white border border-neutral-200 rounded-md shadow-lg mt-1 z-50 max-h-40 overflow-y-auto w-full">
            {suggestions.map((suggestion, i) => (
              <li
                key={i}
                className={`p-2 text-sm text-neutral-800 cursor-pointer hover:bg-brand-light ${
                  i === activeSuggestionIndex ? 'bg-brand-light' : ''
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
      <TransitionGroup>
        {filters.map((filter, index) => {
          const columnType = mapBackendToFrontendType(
            availableColumns[filter.column]?.type || 'String'
          );
          const operators = getOperators(columnType);

          return (
            <CSSTransition key={filter.id} timeout={300} classNames="filter">
              <div className="flex flex-wrap items-center mb-2 bg-white p-2 rounded-md shadow-sm">
                {/* Column Selection */}
                <select
                  value={filter.column}
                  onChange={(e) =>
                    updateFilter(index, 'column', e.target.value)
                  }
                  className="mr-2 border border-brand rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                >
                  <option value="">Select Column</option>
                  {showColumns.map((col) => (
                    <option key={col} value={col}>
                      {availableColumns[col]?.label || col}
                    </option>
                  ))}
                </select>

                {/* Operator Selection */}
                <select
                  value={filter.operator}
                  onChange={(e) =>
                    updateFilter(index, 'operator', e.target.value)
                  }
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

                {/* Value Input */}
                {renderFilterValueInput(filter, index, columnType)}

                {/* Remove Filter Button */}
                <IconButton
                  icon={<TrashIcon className="w-4 h-4 text-red-500" />}
                  ariaLabel="Remove Filter"
                  onClick={() => removeFilter(index)}
                  className="ml-2"
                />
              </div>
            </CSSTransition>
          );
        })}
      </TransitionGroup>

      {/* Add Filter Button */}
      <Button
        onClick={addFilter}
        icon={<PlusIcon className="w-4 h-4 mr-1" />}
        label="Add Filter"
        className="text-sm"
      />
    </div>
  );
};

export default FilterListRecoil;
