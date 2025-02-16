import React, { useState, useEffect, useMemo } from 'react';
import { FilterConfig } from '../../../../../shared/src/types';
import {
  ArrowUpDownIcon,
  PlusIcon,
  Check,
  ChevronsUpDown,
  TrashIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { availableColumnsTypes } from '@/types';

interface SortingPanelNewProps {
  resource: string;
  filterConfig: FilterConfig;
  availableColumnsTypes: { [key: string]: string };
  onFilterChange: (newFilterConfig: FilterConfig) => void;
}

interface SortingEntry {
  column: string;
  hasDirection: boolean;
}

const formatHeader = (name: string, resource: string): string => {
  const [parentField, childField] = name.split('.');
  if (parentField === resource) {
    return childField.charAt(0).toUpperCase() + childField.slice(1);
  }
  return `${parentField.charAt(0).toUpperCase() + parentField.slice(1)} ${childField.charAt(0).toUpperCase() + childField.slice(1)}`;
};

function ColumnSelectionPopover({
  index,
  column,
  orderedColumns,
  handleSortingChange,
  resource,
}: {
  index: number;
  column: string;
  orderedColumns: { value: string; label: string }[];
  handleSortingChange: (index: number, field: 'column' | 'direction', value: string) => void;
  resource: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondaryFlat"
          size="sm"
          className="w-[200px] justify-between"
          onClick={() => setOpen(true)}
          role="combobox"
        >
          {column ? formatHeader(column, resource) : "Select Column"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <Command>
          <CommandInput placeholder="Search column..." />
          <CommandList>
            <CommandEmpty>No column found.</CommandEmpty>
            <CommandGroup>
              {orderedColumns.map((col) => (
                <CommandItem
                  key={col.value}
                  value={col.value}
                  onSelect={(currentValue) => {
                    handleSortingChange(index, 'column', currentValue);
                    setOpen(false);
                  }}
                >
                  {col.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      column === col.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function DirectionSelectionPopover({
  index,
  entry,
  direction,
  directionOptions,
  handleSortingChange,
  disabled,
}: {
  index: number;
  entry: SortingEntry;
  direction: 'asc' | 'desc';
  directionOptions: { value: string; label: string }[];
  handleSortingChange: (index: number, field: 'column' | 'direction', value: string) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondaryFlat"
          size="sm"
          role="combobox"
          className="w-[100px] justify-between"
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          {entry.column && entry.hasDirection
            ? directionOptions.find(opt => opt.value === direction)?.label
            : "Select Order"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[140px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {directionOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    handleSortingChange(index, 'direction', currentValue);
                    setOpen(false);
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      direction === option.value && entry.hasDirection ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const SortingPanelNew: React.FC<SortingPanelNewProps> = ({
  filterConfig,
  availableColumnsTypes,
  onFilterChange,
  resource,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const initialLocalSorting = filterConfig.sort || [];
  const [localSorting, setLocalSorting] = useState<{ [key: string]: 'asc' | 'desc' }[]>(initialLocalSorting);

  const [pendingEntries, setPendingEntries] = useState<SortingEntry[]>(
    initialLocalSorting.length > 0
      ? initialLocalSorting.map(sort => {
        const column = Object.keys(sort)[0];
        return { column, hasDirection: true };
      })
      : [{ column: '', hasDirection: false }]
  );

   const filteredColumns = useMemo(() => {
      return Object.entries(availableColumnsTypes).reduce((acc, [key, value]) => {
        const [, childField] = key.split('.');
        if (childField !== 'id' &&
          childField !== 'siteId' &&
          childField !== 'salesPersonId' &&
          childField !== 'clientId' &&
          childField !== 'pocId' &&
          childField !== 'vendorId') {
          acc[key] = value;
        }
        return acc;
      }, {} as availableColumnsTypes);
    }, [availableColumnsTypes]);

  useEffect(() => {
    const validSortingArray = filterConfig.sort || [];
    setLocalSorting(validSortingArray);
    setPendingEntries(
      validSortingArray.length > 0
        ? validSortingArray.map(sort => {
          const column = Object.keys(sort)[0];
          return { column, hasDirection: true };
        })
        : [{ column: '', hasDirection: false }]
    );
  }, [filterConfig.sort]);

  const handleSortingChange = (index: number, field: 'column' | 'direction', value: string) => {
    if (field === 'column') {
      const newPendingEntries = [...pendingEntries];
      newPendingEntries[index] = { column: value, hasDirection: false };
      setPendingEntries(newPendingEntries);

      const newSorting = [...localSorting];
      newSorting[index] = { [value]: 'asc' };
      setLocalSorting(newSorting);
    } else if (field === 'direction') {
      const newPendingEntries = [...pendingEntries];
      newPendingEntries[index].hasDirection = true;
      setPendingEntries(newPendingEntries);

      const column = pendingEntries[index].column;
      if (column) {
        const newSorting = [...localSorting];
        newSorting[index] = { [column]: value as 'asc' | 'desc' };
        setLocalSorting(newSorting);

        if (newPendingEntries[index].hasDirection) {
          const validSorting = newSorting.filter((sort, i) => {
            const sortKey = Object.keys(sort)[0];
            return sortKey !== '' && newPendingEntries[i]?.hasDirection;
          });
          onFilterChange({
            ...filterConfig,
            sort: validSorting,
          });
        }

      }
    }
  };

  const getDirectionOptions = (column: string): { value: string; label: string }[] => {
    const type = availableColumnsTypes[column] || '';
    if (type === 'String') {
      return [
        { value: 'asc', label: 'A-Z' },
        { value: 'desc', label: 'Z-A' },
      ];
    } else if (type === 'Int' || type === 'BigInt' || type === 'DateTime') {
      return [
        { value: 'asc', label: '1-9' },
        { value: 'desc', label: '9-1' },
      ];
    } else {
      return [
        { value: 'asc', label: 'Ascending' },
        { value: 'desc', label: 'Descending' },
      ];
    }
  };

  const addSorting = () => {
    setPendingEntries([...pendingEntries, { column: '', hasDirection: false }]);
    setLocalSorting([...localSorting, { '': 'asc' }]);
  };

  const removeSorting = (index: number) => {
    const newPendingEntries = pendingEntries.filter((_, i) => i !== index);
    const newSorting = localSorting.filter((_, i) => i !== index);

    setPendingEntries(newPendingEntries.length > 0 ? newPendingEntries : [{ column: '', hasDirection: false }]);
    setLocalSorting(newSorting);

    const validSorting = newSorting.filter((_, i) => {
      const sortKey = Object.keys(newSorting[i])[0];
      return sortKey !== '' && newPendingEntries[i]?.hasDirection;
    });
    onFilterChange({
      ...filterConfig,
      sort: validSorting,
    });

  };

  const isLastSortComplete = () => {
    const lastEntry = pendingEntries[pendingEntries.length - 1];
    return lastEntry && lastEntry.column !== '';
  };

  const orderedColumns = React.useMemo(() => {
    const filteredColumns2 = Object.keys(filteredColumns)
      .filter((col) => {
        const shouldInclude = !filterConfig.columns || !filterConfig.columns.includes(col);
        return shouldInclude;
      });

    const mappedColumns = filteredColumns2.map(col => ({
      value: col,
      label: formatHeader(col, resource)
    }));

    return mappedColumns;
  }, [filteredColumns, filterConfig.columns, resource]);

  return (
    <div className="relative">
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="secondaryFlat"
            size="default"
            className={`
              flex items-center gap-2
              transition-colors duration-300 ease-in-out
              ${filterConfig.sort && Object.keys(filterConfig.sort).length > 0
                ? "bg-green-100 hover:bg-green-200 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-gray-900/30 dark:hover:bg-gray-900/50"}
            `}
            aria-label={`Toggle sorting panel. ${filterConfig.sort ? Object.keys(filterConfig.sort).length : 0} sorting rules`}
            onClick={() => setIsOpen(true)}
          >
            <ArrowUpDownIcon className="w-4 h-4" />
            <span className="hidden sm:block">{`Sorting (${filterConfig.sort ? Object.keys(filterConfig.sort).length : 0})`}</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-fit min-w-[350px] p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-bold">Sort Data</h4>
            </div>
            <div className="space-y-2">
              {pendingEntries.map((entry, index) => {
                const sortObj = localSorting[index] || { '': 'asc' };
                const column = entry.column;
                const direction = column ? sortObj[column] : 'asc';
              

                return (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-none w-[200px]">
                      <ColumnSelectionPopover
                        index={index}
                        column={column}
                        orderedColumns={orderedColumns}
                        handleSortingChange={handleSortingChange}
                        resource={resource}
                      />
                    </div>

                    <div className="flex-none w-[100px]">
                      <DirectionSelectionPopover
                        index={index}
                        entry={entry}
                        direction={direction}
                        directionOptions={getDirectionOptions(column)}
                        handleSortingChange={handleSortingChange}
                        disabled={!column}
                      />
                    </div>

                    {column && (
                      <div className="flex-none">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSorting(index)}
                          className="h-8 w-8"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}

              <Button
                onClick={addSorting}
                variant="brandOutline"
                className="w-full mt-2"
                size="sm"
                disabled={!isLastSortComplete()}
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Sorting
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SortingPanelNew;
