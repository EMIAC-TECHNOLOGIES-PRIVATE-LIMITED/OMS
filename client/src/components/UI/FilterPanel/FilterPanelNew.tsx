import React, { useState, useEffect } from 'react';
import { FilterConfig, LogicalOperator } from '../../../../../shared/src/types';
import Button from '../Button/Button';
import PanelNew from '../Panel/Panel';
import { FunnelIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import IconButton from '../IconButton/IconButton';
import { availableColumnsTypes } from '../../../types';

interface FilterPanelNewProps {
  resource: string; // now used in the onFilterChange calls
  filterConfig: FilterConfig;
  availableColumnsTypes: availableColumnsTypes;
  onFilterChange: (newFilterConfig: FilterConfig) => void;
}

/**
 * Utility to get the data type of a column from availableColumnsTypes
 */
const getColumnType = (
  column: string,
  availableColumnsTypes: availableColumnsTypes
): string => {
  return availableColumnsTypes[column] || '';
};

const FilterPanelNew: React.FC<FilterPanelNewProps> = ({
  resource,
  filterConfig,
  availableColumnsTypes,
  onFilterChange,
}) => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);

  /**
   * We will internally store the connector and filters as a simple array
   * of objects: { column, condition, value }.
   * When we modify them, we will reflect those changes back to the parent.
   */
  const [localConnector, setLocalConnector] = useState<LogicalOperator>(
    // Default connector can be from filterConfig if it exists; otherwise AND
    Object.keys(filterConfig.appliedFilters).includes(LogicalOperator.OR)
      ? LogicalOperator.OR
      : LogicalOperator.AND
  );

  const [localFilters, setLocalFilters] = useState<
    Array<{ column: string; condition: string; value: string }>
  >([]);

  /**
   * On mount or when filterConfig changes externally,
   * parse the relevant connector’s array from the parent and mirror it in local state.
   */
  useEffect(() => {
    const activeFilters = filterConfig.appliedFilters[localConnector] || [];
    const parsed = activeFilters.map((flt) => {
      const [column, conditionObj] = Object.entries(flt)[0];
      const condition = Object.keys(conditionObj)[0];
      const value = String(Object.values(conditionObj)[0] ?? '');
      return { column, condition, value };
    });
    setLocalFilters(parsed);
  }, [filterConfig, localConnector]);

  /**
   * Helper to push the current local state back up to the parent
   * under the currently selected connector.
   */
  const syncWithParent = (
    connector: LogicalOperator,
    updatedLocalFilters: Array<{ column: string; condition: string; value: string }>
  ) => {
    onFilterChange({
      ...filterConfig,

      appliedFilters: {
        // Keep any existing connectors that might be in filterConfig,
        // but overwrite the one we’re currently using
        ...filterConfig.appliedFilters,
        [connector]: updatedLocalFilters.map((item) => {
          // Transform { column, condition, value } back into the original shape
          return {
            [item.column]: {
              [item.condition]: item.value,
            },
          };
        }),
      },
    });
  };

  /**
   * Handle connector change: we do NOT reset local filters;
   * we simply change the connector used in the parent config.
   */
  const handleConnectorChange = (newConnector: LogicalOperator) => {
    setLocalConnector(newConnector);

    // Also sync the local filters to the parent under the new connector
    syncWithParent(newConnector, localFilters);
  };

  /**
   * Add a new filter:
   * If no columns are available, we disable the addition to avoid invalid states.
   */
  const addFilter = () => {
    if (!filterConfig.columns || filterConfig.columns.length === 0) {
      console.warn('No columns available; cannot add a new filter.');
      return;
    }

    const defaultColumn = filterConfig.columns[0] || '';
    // Create a default filter object
    const newFilterItem = {
      column: defaultColumn,
      condition: 'equals', // pick a default condition, can be changed later
      value: '',
    };

    setLocalFilters((prev) => {
      const updated = [...prev, newFilterItem];
      // Sync it to the parent
      syncWithParent(localConnector, updated);
      return updated;
    });
  };

  /**
   * Update a particular filter. We sync to parent immediately.
   */
  const updateFilter = (
    index: number,
    field: 'column' | 'condition' | 'value',
    value: string
  ) => {
    setLocalFilters((prev) => {
      const updated = [...prev];
      const oldItem = updated[index];

      if (field === 'column') {
        const oldType = getColumnType(oldItem.column, availableColumnsTypes);
        const newType = getColumnType(value, availableColumnsTypes);

        // If the user picks a column of a different data type, reset condition and value
        // to avoid logical mismatch (optional: you could get more fine-grained).
        if (oldType !== newType) {
          updated[index] = { column: value, condition: '', value: '' };
        } else {
          updated[index] = { ...oldItem, column: value };
        }
      } else if (field === 'condition') {
        updated[index] = { ...oldItem, condition: value };
      } else if (field === 'value') {
        // Basic numeric validation for numeric columns
        const colType = getColumnType(oldItem.column, availableColumnsTypes);
        let newVal = value;
        if (
          /(Int|BigInt|Number|number)/.test(colType) &&
          value.trim() !== '' &&
          isNaN(Number(value))
        ) {
          console.warn(`Invalid numeric input for column "${oldItem.column}": ${value}`);
          newVal = ''; // Reset to empty if invalid
        }
        updated[index] = { ...oldItem, value: newVal };
      }

      // Sync changes up to parent
      syncWithParent(localConnector, updated);
      return updated;
    });
  };

  /**
   * Remove a filter from the local array; also sync to parent.
   */
  const removeFilter = (index: number) => {
    setLocalFilters((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      syncWithParent(localConnector, updated);
      return updated;
    });
  };

  /**
   * Utility: get operators by type to populate condition <select>.
   */
  const getOperatorsByType = (type: string) => {
    switch (type) {
      case 'String':
      case 'string':
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'startsWith', label: 'Starts With' },
          { value: 'endsWith', label: 'Ends With' },
          { value: 'equals', label: 'Equals' },
        ];
      case 'Int':
      case 'BigInt':
      case 'Number':
      case 'number':
        return [
          { value: 'gte', label: 'Greater Than or Equal To' },
          { value: 'lte', label: 'Less Than or Equal To' },
          { value: 'equals', label: 'Equals' },
        ];
      case 'Boolean':
      case 'boolean':
        return [{ value: 'equals', label: 'Equals' }];
      case 'DateTime':
      case 'date':
        return [
          { value: 'before', label: 'Before' },
          { value: 'after', label: 'After' },
          { value: 'equals', label: 'Equals' },
        ];
      default:
        return [{ value: 'equals', label: 'Equals' }];
    }
  };

  /**
   * We only display columns that exist in both `filterConfig.columns`
   * and `availableColumnsTypes`.
   */
  const orderedColumns = Object.keys(availableColumnsTypes).filter((col) =>
    filterConfig.columns.includes(col)
  );

  return (
    <div className="relative">
      <Button
        onClick={() => setIsFilterPanelOpen((prev) => !prev)}
        icon={<FunnelIcon className="w-5 h-5 mr-1" />}
        label={`Filters (${localFilters.length})`}
      />

      <PanelNew
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        title="Filters"
      >
        <div className="mb-3">
          <h4 className="font-medium text-sm text-neutral-800 mb-2">Filters</h4>

          {/* Connector Selector */}
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

          <div>
            {localFilters.map((filterItem, index) => {
              const { column, condition, value } = filterItem;
              const colType = getColumnType(column, availableColumnsTypes);
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
                    {orderedColumns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>

                  {/* Condition Selection */}
                  <select
                    value={condition || ''}
                    onChange={(e) => updateFilter(index, 'condition', e.target.value)}
                    className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                    disabled={!column} // Disable until column is selected
                  >
                    <option value="">Select Condition</option>
                    {column &&
                      getOperatorsByType(colType).map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                  </select>

                  {/* Value Input */}
                  <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => updateFilter(index, 'value', e.target.value)}
                    className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                    placeholder="Enter value"
                    disabled={!condition} // Disable until condition is selected
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
