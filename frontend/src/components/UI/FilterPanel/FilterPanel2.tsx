import React, { useState, useEffect, useRef } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { currentFilterConfigState, availableColumnsState } from '../../../store/atoms/atoms';
import { FilterConfig, ExtendedFilterCondition, FrontendAvailableColumns } from '../../../types';
import Button from '../Button/Button';
import Panel from '../Panel/Panel';
import { FunnelIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { mapBackendToFrontendType, getOperators } from '../../../utils';
import { useTypeAhead } from '../../../hooks';
import IconButton from '../IconButton/IconButton';

interface FilterPanel2Props {
  resource: string;
}

const FilterPanel2: React.FC<FilterPanel2Props> = ({ resource }) => {
  const [currentFilterConfig, setCurrentFilterConfig] = useRecoilState<FilterConfig | null>(currentFilterConfigState(resource));
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const availableColumns = useRecoilValue<FrontendAvailableColumns>(availableColumnsState(resource));

  console.log(currentFilterConfig?.filters)
  console.log(currentFilterConfig?.filters[0]?.connector)

  // Assign unique IDs to filters if they don't have one
  useEffect(() => {
    if (currentFilterConfig && currentFilterConfig.filters) {
      const updatedFilters = currentFilterConfig.filters.map(filter => ({
        ...filter,
        id: filter.id || generateUniqueId(),
      }));
      setCurrentFilterConfig({
        ...currentFilterConfig,
        filters: updatedFilters,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const showColumns = currentFilterConfig?.columns || [];

  const handleConnectorChange = (connector: 'AND' | 'OR') => {
    const updatedFilters = currentFilterConfig?.filters.map(filter => ({
      ...filter,
      connector
    }));

    setCurrentFilterConfig((prev : any) => {

      if (prev) {
        return {
          ...prev , 
          filters : updatedFilters
        }
      }
      return null
    }
    )

  };

  const addFilter = () => {
    const newFilter = {
      id: generateUniqueId(),
      column: '',
      operator: '',
      value: '',
      connector: 'AND',
    };
    setCurrentFilterConfig((prevConfig: any) => {
      if (prevConfig) {
        return {
          ...prevConfig,
          filters: [...prevConfig.filters, newFilter], // Use prevConfig.filters
        };
      }
      return prevConfig;
    });
  };

  const updateFilter = (
    index: number,
    field: keyof ExtendedFilterCondition,
    value: any
  ) => {
    setCurrentFilterConfig(prevConfig => {
      if (prevConfig) {
        const updatedFilters = [...prevConfig.filters];
        const filter = { ...updatedFilters[index], [field]: value };

        if (field === 'column') {
          filter.operator = '';
          filter.value = '';
        }

        if (field === 'operator' && ['isNull', 'isNotNull'].includes(value)) {
          filter.value = '';
        }

        updatedFilters[index] = filter;
        return { ...prevConfig, filters: updatedFilters };
      }
      return prevConfig;
    });
  };

  const removeFilter = (index: number) => {
    setCurrentFilterConfig(prevConfig => {
      if (prevConfig) {
        const updatedFilters = prevConfig.filters.filter((_, i) => i !== index);
        return { ...prevConfig, filters: updatedFilters };
      }
      return prevConfig;
    });
  };

  const { suggestions, fetchSuggestions, resetSuggestions } = useTypeAhead();
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);

  if (!currentFilterConfig) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setIsFilterPanelOpen(prev => !prev)}
        icon={<FunnelIcon className="w-5 h-5 mr-1" />}
        label={`Filters (${currentFilterConfig.filters.length})`}
      />
      <Panel isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} title="Filters" panelRef={panelRef}>
        {/* Filter List */}
        <div className="mb-3">
          <h4 className="font-medium text-sm text-neutral-800 mb-2">Filters</h4>
          <div>
            {currentFilterConfig.filters.map((filter, index) => (
              <div className=''>
                <div className="flex flex-col gap-1 mb-2 bg-white p-2 rounded-md shadow-sm">
                  {/* Column Selection */}
                  <select
                    value={filter.column}
                    onChange={e => updateFilter(index, 'column', e.target.value)}
                    className="mr-2 border border-brand rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                  >
                    <option value="">Select Column</option>
                    {showColumns.map(col => (
                      <option key={col} value={col}>
                        {availableColumns[col]?.label || col}
                      </option>
                    ))}
                  </select>

                  {/* Operator Selection */}
                  <select
                    value={filter.operator}
                    onChange={e => updateFilter(index, 'operator', e.target.value)}
                    className="mr-2 border border-brand rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                    disabled={!filter.column}
                  >
                    <option value="">Select Operator</option>
                    {getOperators(mapBackendToFrontendType(availableColumns[filter.column]?.type || 'String')).map(op => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>

                  {/* Value Input */}
                  <div className='flex justify-between'>

                    <div className="relative flex-1">
                      {filter.operator === 'isNull' || filter.operator === 'isNotNull' ? null : (
                        <input
                          type="text"
                          value={filter.value as string}
                          onChange={e => updateFilter(index, 'value', e.target.value)}
                          onKeyDown={event => {
                            if (event.key === 'ArrowDown') {
                              setActiveSuggestionIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
                            } else if (event.key === 'ArrowUp') {
                              setActiveSuggestionIndex(prev => (prev > 0 ? prev - 1 : prev));
                            } else if (event.key === 'Enter') {
                              if (activeSuggestionIndex >= 0) {
                                updateFilter(index, 'value', suggestions[activeSuggestionIndex]);
                                resetSuggestions();
                              }
                            } else if (event.key === 'Escape') {
                              resetSuggestions();
                            }
                          }}
                          onBlur={() => resetSuggestions()}
                          className="border border-brand rounded-md p-1 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-brand-dark"
                          placeholder="Enter value"
                        />
                      )}
                    </div>

                    {/* Remove Filter Button */}
                    <IconButton
                      icon={<TrashIcon className="w-4 h-4 text-red-500" />}
                      ariaLabel="Remove Filter"
                      onClick={() => removeFilter(index)}
                      className="ml-2"
                    />
                  </div>
                </div>
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

        {/* Global Connector Selection */}
        <div className="mt-2">
          <h4 className="font-medium text-sm mb-1">Connector for All Filters</h4>
          <div className="flex items-center space-x-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="globalConnector"
                value='AND'
                checked={currentFilterConfig?.filters[0]?.connector === 'AND'}
                onChange={() => handleConnectorChange('AND')}
                className="form-radio h-4 w-4 text-brand"
              />
              <span className="ml-1 text-xs text-neutral-700">AND</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="globalConnector"
                value="OR"
                checked={currentFilterConfig?.filters[0]?.connector === 'OR'}
                onChange={() => handleConnectorChange('OR')}
                className="form-radio h-4 w-4 text-brand"
              />
              <span className="ml-1 text-xs text-neutral-700">OR</span>
            </label>
          </div>
        </div>
      </Panel>
    </div>
  );
};

const generateUniqueId = () => {
  return Math.random().toString(36).substring(2, 9);
};

export default FilterPanel2;
