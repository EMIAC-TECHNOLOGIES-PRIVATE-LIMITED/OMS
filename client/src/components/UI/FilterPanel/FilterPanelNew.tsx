import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FilterConfig, LogicalOperator } from '../../../../../shared/src/types';
import Button from '../Button/Button';
import { FunnelIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import IconButton from '../IconButton/IconButton';
import { availableColumnsTypes } from '../../../types';

// Custom hook for debouncing
const useDebounce = <T extends (...args: any[]) => void>(callback: T, delay: number): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedFunction = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedFunction as T;
};

interface FilterPanelNewProps {
  resource: string;
  filterConfig: FilterConfig;
  availableColumnsTypes: availableColumnsTypes;
  onFilterChange: (newFilterConfig: FilterConfig) => void;
}

type AllowedConditions =
  | 'equals'
  | 'not'
  | 'in'
  | 'notIn'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'mode';

type LocalFilterValue =
  | string
  | number
  | boolean
  | Date
  | Array<string | number | boolean | Date>
  | undefined;

interface LocalFilter {
  column: string | null;
  condition: AllowedConditions | null;
  value: LocalFilterValue;
  isComplete: boolean;
}

const FilterPanelNew: React.FC<FilterPanelNewProps> = ({
  filterConfig,
  availableColumnsTypes,
  onFilterChange,
}) => {
  // Local state to track input values before debouncing
  const [localInputValues, setLocalInputValues] = useState<{ [key: string]: string }>({});

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);
  const [localConnector, setLocalConnector] = useState<LogicalOperator>(
    Object.keys(filterConfig.appliedFilters).includes(LogicalOperator.OR)
      ? LogicalOperator.OR
      : LogicalOperator.AND
  );

  // Separate state for draft filters and applied filters
  const [draftFilters, setDraftFilters] = useState<LocalFilter[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<LocalFilter[]>([]);

  // Ref for the panel and debounce timer
  const panelRef = useRef<HTMLDivElement>(null);
  const syncTimerRef = useRef<NodeJS.Timeout>();

  // Initialize applied filters from props
  useEffect(() => {
    const activeFilters = filterConfig.appliedFilters[localConnector] || [];
    const parsed: LocalFilter[] = activeFilters.map((flt) => {
      const [column, conditionObj] = Object.entries(flt)[0];
      const condition = Object.keys(conditionObj)[0] as AllowedConditions;
      const value = conditionObj[condition] as LocalFilterValue;
      return { column, condition, value, isComplete: true };
    });
    setAppliedFilters(parsed);
  }, [filterConfig, localConnector]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsFilterPanelOpen(false);
      }
    };

    if (isFilterPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterPanelOpen]);

  // Cleanup sync timer
  useEffect(() => {
    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, []);

  // Debounced sync function
  const syncWithParent = useCallback((filters: LocalFilter[]) => {
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }

    syncTimerRef.current = setTimeout(() => {
      const completeFilters = filters.filter(f => f.isComplete);
      onFilterChange({
        ...filterConfig,
        appliedFilters: {
          [localConnector]: completeFilters.map((item) => ({
            [item.column!]: {
              [item.condition!]: item.value,
            },
          })),
        },
      });
    }, 300);
  }, [filterConfig, localConnector, onFilterChange]);

  // Add the debounced update function
  const debouncedUpdateFilter = useDebounce(
    (index: number, value: any, isDraft: boolean) => {
      updateFilter(index, 'value', value, isDraft);
    },
    500 // 500ms delay
  );

  // Handle connector change
  const handleConnectorChange = (newConnector: LogicalOperator) => {
    setLocalConnector(newConnector);
    const allFilters = [...appliedFilters, ...draftFilters.filter(f => f.isComplete)];
    syncWithParent(allFilters);
  };

  // Add new empty filter
  const addFilter = () => {
    const newFilter: LocalFilter = {
      column: null,
      condition: null,
      value: undefined,
      isComplete: false
    };
    setDraftFilters(prev => [...prev, newFilter]);
  };

  // Update filter fields
  const updateFilter = (
    index: number,
    field: keyof LocalFilter,
    value: any,
    isDraft: boolean = true
  ) => {
    const updateFiltersState = (prevFilters: LocalFilter[]) => {
      const updated = [...prevFilters];
      const filter = { ...updated[index] };

      switch (field) {
        case 'column':
          filter.column = value;
          filter.condition = null;
          filter.value = undefined;
          break;
        case 'condition':
          filter.condition = value;
          filter.value = undefined;
          break;
        case 'value':
          const colType = filter.column ? availableColumnsTypes[filter.column] : '';
          filter.value = formatValue(value, colType, filter.condition!);
          break;
      }

      // Check if filter is complete
      filter.isComplete = isFilterComplete(filter);
      updated[index] = filter;

      // If filter becomes complete, move it to applied filters
      if (filter.isComplete && isDraft) {
        setAppliedFilters(prev => [...prev, filter]);
        return updated.filter((_, i) => i !== index);
      }

      return updated;
    };

    if (isDraft) {
      setDraftFilters(prev => updateFiltersState(prev));
    } else {
      setAppliedFilters(prev => {
        const updated = updateFiltersState(prev);
        syncWithParent(updated);
        return updated;
      });
    }
  };

  // Helper function to check if a filter is complete
  const isFilterComplete = (filter: LocalFilter): boolean => {
    return !!(
      filter.column &&
      filter.condition &&
      filter.value !== undefined &&
      filter.value !== ''
    );
  };

  // Helper function to format values based on type
  const formatValue = (
    value: any,
    columnType: string,
    condition: AllowedConditions
  ): LocalFilterValue => {
    if (condition === 'in' || condition === 'notIn') {
      return typeof value === 'string' ? value.split(',').map(v => v.trim()) : value;
    }

    if (/(Int|BigInt|Number|number)/.test(columnType)) {
      return value === '' ? '' : Number(value);
    }

    if (/(Boolean|boolean)/.test(columnType)) {
      return value === 'true';
    }

    if (/(DateTime|date)/.test(columnType)) {
      return value ? new Date(value) : undefined;
    }

    return value;
  };

  // Remove filter
  const removeFilter = (index: number, isDraft: boolean = true) => {
    if (isDraft) {
      setDraftFilters(prev => prev.filter((_, i) => i !== index));
    } else {
      setAppliedFilters(prev => {
        const updated = prev.filter((_, i) => i !== index);
        syncWithParent(updated);
        return updated;
      });
    }
  };

  // Memoized operators by type
  const getOperatorsByType = useMemo(() => (type: string) => {
    switch (type) {
      case 'String':
      case 'String?':
      case 'string':
      case 'string?':
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'startsWith', label: 'Starts With' },
          { value: 'endsWith', label: 'Ends With' },
          { value: 'equals', label: 'Equals' },
          { value: 'in', label: 'In (comma-separated)' },
        ];
      case 'Int':
      case 'BigInt':
      case 'Number':
      case 'number':
      case 'Int?':
      case 'BigInt?':
      case 'Number?':
      case 'number?':
        return [
          { value: 'gte', label: 'Greater Than or Equal To' },
          { value: 'lte', label: 'Less Than or Equal To' },
          { value: 'gt', label: 'Greater Than' },
          { value: 'lt', label: 'Less Than' },
          { value: 'equals', label: 'Equals' },
          { value: 'in', label: 'In (comma-separated)' },
        ];
      case 'Boolean':
      case 'boolean':
      case 'Boolean?':
      case 'boolean?':
        return [{ value: 'equals', label: 'Equals' }];
      case 'DateTime':
      case 'date':
      case 'DateTime?':
      case 'date?':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'gt', label: 'After' },
          { value: 'lt', label: 'Before' },
        ];
      default:
        return [{ value: 'equals', label: 'Equals' }];
    }
  }, []);

  // Memoized input type getter
  const getInputTypeForColumn = useMemo(() => (columnType: string) => {
    switch (columnType) {
      case 'Int':
      case 'BigInt':
      case 'Number':
      case 'number':
      case 'Int?':
      case 'BigInt?':
      case 'Number?':
      case 'number?':
        return 'number';
      case 'DateTime':
      case 'date':
      case 'DateTime?':
      case 'date?':
        return 'datetime-local';
      case 'Boolean':
      case 'boolean':
      case 'Boolean?':
      case 'boolean?':
        return 'select';
      default:
        return 'text';
    }
  }, []);


  const orderedColumns = useMemo(
    () => Object.keys(availableColumnsTypes).filter((col) => filterConfig.columns.includes(col)),
    [availableColumnsTypes, filterConfig.columns]
  );

  // Render filter item
  const renderFilterItem = (filter: LocalFilter, index: number, isDraft: boolean) => {
    const colType = filter.column ? availableColumnsTypes[filter.column] : '';
    const inputType = filter.column ? getInputTypeForColumn(colType) : 'text';
    const inputId = `${isDraft ? 'draft' : 'applied'}-${index}`;

    return (
      <div
        key={`${isDraft ? 'draft' : 'applied'}-${index}-${filter.column}-${filter.condition}`}
        className="flex flex-col gap-2 mb-2 p-2 bg-white rounded-md shadow-sm"
      >
        <select
          value={filter.column || ''}
          onChange={(e) => updateFilter(index, 'column', e.target.value, isDraft)}
          className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
        >
          <option value="">Select Column</option>
          {orderedColumns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>

        <select
          value={filter.condition || ''}
          onChange={(e) => updateFilter(index, 'condition', e.target.value, isDraft)}
          className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
          disabled={!filter.column}
        >
          <option value="">Select Condition</option>
          {filter.column &&
            getOperatorsByType(colType).map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
        </select>

        {inputType === 'select' ? (
          <select
            value={filter.value === undefined ? '' : String(filter.value)}
            onChange={(e) => updateFilter(index, 'value', e.target.value, isDraft)}
            className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
            disabled={!filter.condition}
          >
            <option value="">Select Value</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        ) : (
          <input
            type={filter.condition === 'in' || filter.condition === 'notIn' ? 'text' : inputType}
            value={
              localInputValues[inputId] !== undefined
                ? localInputValues[inputId]
                : Array.isArray(filter.value)
                  ? filter.value.join(', ')
                  : filter.value instanceof Date
                    ? filter.value.toISOString().slice(0, 16)
                    : filter.value !== undefined
                      ? String(filter.value)
                      : ''
            }
            onChange={(e) => {
              const newValue = e.target.value;

              // Update local input value immediately for responsive typing
              setLocalInputValues(prev => ({
                ...prev,
                [inputId]: newValue
              }));

              // Debounce the actual filter update
              debouncedUpdateFilter(index, newValue, isDraft);
            }}
            className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
            placeholder={
              filter.condition === 'in' || filter.condition === 'notIn'
                ? 'Enter values, comma-separated'
                : 'Enter value'
            }
            disabled={!filter.condition}
          />
        )}

        <IconButton
          icon={<TrashIcon className="w-4 h-4 text-red-500" />}
          ariaLabel="Remove Filter"
          onClick={() => removeFilter(index, isDraft)}
          className="ml-auto"
        />
      </div>
    );
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsFilterPanelOpen((prev) => !prev)}
        icon={<FunnelIcon className="w-5 h-5 mr-1" />}
        label={`Filters (${appliedFilters.length})`}
      />

      {isFilterPanelOpen && (
        <div
          className="absolute left-0 mt-1 w-80 bg-white border border-neutral-200 rounded-lg shadow-premium-lg p-3 z-50"
          ref={panelRef}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-md font-semibold text-neutral-800">Filters</h3>
            <button
              onClick={() => setIsFilterPanelOpen(false)}
              className="text-neutral-500 hover:text-neutral-700 focus:outline-none"
              aria-label="Close Panel"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="mb-3">
              <h4 className="font-medium text-sm text-neutral-800 mb-2">Filters</h4>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Connector
                </label>
                <select
                  value={localConnector}
                  onChange={(e) => handleConnectorChange(e.target.value as LogicalOperator)}
                  className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                >
                  <option value={LogicalOperator.AND}>AND</option>
                  <option value={LogicalOperator.OR}>OR</option>
                </select>
              </div>

              {/* Applied Filters */}
              {appliedFilters.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-600 mb-2">Applied Filters</h5>
                  {appliedFilters.map((filter, index) =>
                    renderFilterItem(filter, index, false)
                  )}
                </div>
              )}

              {/* Draft Filters */}
              {draftFilters.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-600 mb-2">New Filters</h5>
                  {draftFilters.map((filter, index) =>
                    renderFilterItem(filter, index, true)
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={addFilter}
                className="flex items-center px-3 py-1 bg-brand text-white rounded-md hover:bg-brand-light transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-dark text-sm"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanelNew;
