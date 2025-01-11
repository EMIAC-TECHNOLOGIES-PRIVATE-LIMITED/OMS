import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FilterConfig, LogicalOperator } from '../../../../../shared/src/types';
import { ListFilter, PlusIcon, TrashIcon, ChevronsUpDown, Check } from 'lucide-react';
import IconButton from '../IconButton/IconButton';
import { availableColumnsTypes } from '../../../types';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

// Custom hook for debouncing (remains same)
const useDebounce = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 300,
  options: { leading?: boolean } = {}
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedFunction = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (options.leading) {
      callbackRef.current(...args);
    }

    timeoutRef.current = setTimeout(() => {
      if (!options.leading) {
        callbackRef.current(...args);
      }
    }, delay);
  }, [delay, options.leading]);

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

interface Operator {
  value: AllowedConditions;
  label: string;
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
  const [localInputValues, setLocalInputValues] = useState<{ [key: string]: string }>({});
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [localFilters, setLocalFilters] = useState<LocalFilter[]>([]);
  const [pendingFilter, setPendingFilter] = useState<LocalFilter | null>(null);
  const [localConnector, setLocalConnector] = useState<LogicalOperator>(LogicalOperator.AND);

  // Initialize local state from filter config
  useEffect(() => {
    const activeConnector = Object.keys(filterConfig.appliedFilters).includes(LogicalOperator.OR)
      ? LogicalOperator.OR
      : LogicalOperator.AND;

    const activeFilters = filterConfig.appliedFilters[activeConnector] || [];
    const parsed: LocalFilter[] = activeFilters.map((flt) => {
      const [column, conditionObj] = Object.entries(flt)[0];
      const condition = Object.keys(conditionObj)[0] as AllowedConditions;
      const value = conditionObj[condition] as LocalFilterValue;
      return { column, condition, value, isComplete: true };
    });

    setLocalFilters(parsed);
    setLocalConnector(activeConnector);
    setPendingFilter(null);
    setLocalInputValues({});
  }, [filterConfig]);

  // Sync with parent - now only called explicitly when needed
  const syncWithParent = useCallback((filters: LocalFilter[], connector: LogicalOperator) => {
    const completeFilters = filters.filter(f => f.isComplete);
    onFilterChange({
      ...filterConfig,
      appliedFilters: {
        [connector]: completeFilters.map((item) => ({
          [item.column!]: {
            [item.condition!]: item.value,
          },
        })),
      },
    });
  }, [filterConfig, onFilterChange]);

  const handlePanelOpenChange = (open: boolean) => {
    setIsPanelOpen(open);
    if (!open) {
      setPendingFilter(null);
      setLocalInputValues({});
    }
  };

  const handleConnectorChange = (newConnector: LogicalOperator) => {
    setLocalConnector(newConnector);
    syncWithParent(localFilters, newConnector);
  };

  const addNewFilter = () => {
    setLocalInputValues({}); // Clear input values when adding new filter
    setPendingFilter({
      column: null,
      condition: null,
      value: undefined,
      isComplete: false
    });
  };

  // Debounced value update handler
  const debouncedValueUpdate = useDebounce((filterId: string, value: string) => {
    if (pendingFilter) {
      updatePendingFilter('value', value);
    } else {
      const filterIndex = parseInt(filterId.split('-')[1]);
      if (!isNaN(filterIndex)) {
        const updatedFilters = [...localFilters];
        const filter = updatedFilters[filterIndex];
        const colType = filter.column ? availableColumnsTypes[filter.column] : '';
        filter.value = formatValue(value, colType, filter.condition!);
        setLocalFilters(updatedFilters);
        syncWithParent(updatedFilters, localConnector);
      }
    }
  }, 300);

  // Updated to handle both pending and existing filters
  const updateFilter = (
    index: number | null,
    field: keyof LocalFilter,
    value: any
  ) => {
    if (index === null) {
      // Handle pending filter
      updatePendingFilter(field, value);
    } else {
      // Handle existing filter
      const updatedFilters = [...localFilters];
      const filter = updatedFilters[index];

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

      filter.isComplete = isFilterComplete(filter);
      setLocalFilters(updatedFilters);
      syncWithParent(updatedFilters, localConnector);
      setLocalInputValues(prev => ({ ...prev, [`applied-${index}`]: String(value) }));
    }
  };

  const updatePendingFilter = (
    field: keyof LocalFilter,
    value: any
  ) => {
    if (!pendingFilter) return;

    const updatedFilter = { ...pendingFilter };

    switch (field) {
      case 'column':
        updatedFilter.column = value;
        updatedFilter.condition = null;
        updatedFilter.value = undefined;
        break;
      case 'condition':
        updatedFilter.condition = value;
        updatedFilter.value = undefined;
        break;
      case 'value':
        const colType = updatedFilter.column ? availableColumnsTypes[updatedFilter.column] : '';
        updatedFilter.value = formatValue(value, colType, updatedFilter.condition!);
        break;
    }

    updatedFilter.isComplete = isFilterComplete(updatedFilter);

    if (updatedFilter.isComplete) {
      const newFilters = [...localFilters, updatedFilter];
      setLocalFilters(newFilters);
      setPendingFilter(null);
      setLocalInputValues({});
      syncWithParent(newFilters, localConnector);
    } else {
      setPendingFilter(updatedFilter);
    }
  };

  const removeFilter = (index: number) => {
    const updatedFilters = localFilters.filter((_, i) => i !== index);
    setLocalFilters(updatedFilters);
    syncWithParent(updatedFilters, localConnector);
  };

  // Helper functions remain the same
  const isFilterComplete = (filter: LocalFilter): boolean => {
    return !!(
      filter.column &&
      filter.condition &&
      filter.value !== undefined &&
      filter.value !== ''
    );
  };

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

  // Rest of the helper functions and memoized operators remain exactly the same
  const getOperatorsByType = useMemo(() => (type: string): Operator[] => {
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

  const getInputTypeForColumn = useMemo(() => (columnType: string): React.HTMLInputTypeAttribute => {
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

  // Updated render functions
  const renderFilterItem = (filter: LocalFilter, index?: number, isPending: boolean = false) => {
    const colType = filter.column ? availableColumnsTypes[filter.column] : '';
    const inputType = filter.column ? getInputTypeForColumn(colType) : 'text';
    const inputId = isPending ? 'pending' : `applied-${index}`;
    const operators = filter.column ? getOperatorsByType(colType) : [];

    const handleSelect = (field: keyof LocalFilter, value: any) => {
      if (isPending) {
        updatePendingFilter(field, value);
      } else if (index !== undefined) {
        updateFilter(index, field, value);
      }
    };

    return (
      <div className="flex flex-col gap-2 mb-2 p-2 bg-white rounded-md shadow-sm">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="secondaryFlat"
              role="combobox"
              className="w-full justify-between"
            >
              {filter.column || "Select Column"}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search columns..." />
              <CommandList>
                <CommandEmpty>No column found.</CommandEmpty>
                <CommandGroup>
                  {orderedColumns.map((col) => (
                    <CommandItem
                      key={col}
                      value={col}
                      onSelect={() => handleSelect('column', col)}
                    >
                      {col}
                      <Check
                        className={cn(
                          "ml-auto",
                          filter.column === col ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="secondaryFlat"
              role="combobox"
              className="w-full justify-between"
              disabled={!filter.column}
            >
              {filter.condition ?
                operators.find(op => op.value === filter.condition)?.label
                : "Select Operator"}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search operators..." />
              <CommandList>
                <CommandEmpty>No operator found.</CommandEmpty>
                <CommandGroup>
                  {operators.map((op) => (
                    <CommandItem
                      key={op.value}
                      value={op.value}
                      onSelect={() => handleSelect('condition', op.value)}
                    >
                      {op.label}
                      <Check
                        className={cn(
                          "ml-auto",
                          filter.condition === op.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {inputType === 'select' ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="secondaryFlat"
                role="combobox"
                className="w-full justify-between"
                disabled={!filter.condition}
              >
                {filter.value !== undefined ? String(filter.value) : "Select Value"}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      value="true"
                      onSelect={() => handleSelect('value', 'true')}
                    >
                      True
                      <Check className={cn("ml-auto", filter.value === true ? "opacity-100" : "opacity-0")} />
                    </CommandItem>
                    <CommandItem
                      value="false"
                      onSelect={() => handleSelect('value', 'false')}
                    >
                      False
                      <Check className={cn("ml-auto", filter.value === false ? "opacity-100" : "opacity-0")} />
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        ) : (
          <Input
            type={filter.condition === 'in' || filter.condition === 'notIn' ? 'text' : inputType}
            value={localInputValues[inputId] || ''}
            onChange={(e) => {
              const newValue = e.target.value;
              setLocalInputValues(prev => ({
                ...prev,
                [inputId]: newValue
              }));
              debouncedValueUpdate(inputId, newValue);
            }}
            className="w-full"
            placeholder={
              filter.condition === 'in' || filter.condition === 'notIn'
                ? 'Enter values, comma-separated'
                : 'Enter value'
            }
            disabled={!filter.condition}
          />
        )}

        {!isPending && (
          <IconButton
            icon={<TrashIcon className="w-4 h-4 text-red-500" />}
            ariaLabel="Remove Filter"
            onClick={() => index !== undefined && removeFilter(index)}
            className="ml-auto"
          />
        )}
      </div>
    );
  };

  const numberOfFilters = localFilters.length;

  return (
    <div className="relative">
      <Popover onOpenChange={handlePanelOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="secondaryFlat"
            className={`
              flex items-center gap-2
              transition-colors duration-300 ease-in-out
              ${numberOfFilters > 0
                ? "bg-blue-100 hover:bg-blue-200 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                : ""}
            `}
          >
            <ListFilter className="w-5 h-5 mr-1" />
            {`Filters (${numberOfFilters})`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Filters</h3>
            </div>

            <div className="space-y-4">
              {localFilters.length >= 1 && (
                <div className="space-y-2">
                  <Label>Connector</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="secondaryFlat"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {localConnector}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandList>
                          <CommandGroup>
                            <CommandItem
                              value={LogicalOperator.AND}
                              onSelect={() => handleConnectorChange(LogicalOperator.AND)}
                            >
                              AND
                              <Check className={cn("ml-auto", localConnector === LogicalOperator.AND ? "opacity-100" : "opacity-0")} />
                            </CommandItem>
                            <CommandItem
                              value={LogicalOperator.OR}
                              onSelect={() => handleConnectorChange(LogicalOperator.OR)}
                            >
                              OR
                              <Check className={cn("ml-auto", localConnector === LogicalOperator.OR ? "opacity-100" : "opacity-0")} />
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {localFilters.length > 0 && (
                <div className="space-y-2">
                  <Label>Applied Filters</Label>
                  {localFilters.map((filter, index) =>
                    renderFilterItem(filter, index, false)
                  )}
                </div>
              )}

              {pendingFilter && (
                <div className="space-y-2">
                  <Label>New Filter</Label>
                  {renderFilterItem(pendingFilter, undefined, true)}
                </div>
              )}

              <Button
                onClick={addNewFilter}
                className="w-full"
                variant="secondaryFlat"
                disabled={!!(pendingFilter && !pendingFilter.isComplete)}
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Filter
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FilterPanelNew;