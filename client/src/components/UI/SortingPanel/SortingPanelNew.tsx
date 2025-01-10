import React, { useState, useEffect } from 'react';
import { FilterConfig } from '../../../../../shared/src/types';
import { ArrowUpDownIcon, PlusIcon, Check, ChevronsUpDown, X } from 'lucide-react';
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

const formatHeader = (header: string) =>
  header.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const SortingPanelNew: React.FC<SortingPanelNewProps> = ({
  filterConfig,
  availableColumnsTypes,
  onFilterChange,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [localSorting, setLocalSorting] = useState<{ [key: string]: 'asc' | 'desc' }[]>(
    filterConfig.appliedSorting
  );
  const [pendingEntries, setPendingEntries] = useState<SortingEntry[]>([
    { column: '', hasDirection: false }
  ]);

  // Synchronize local state with global filterConfig when it changes
  useEffect(() => {
    const validSorting = filterConfig.appliedSorting;
    setLocalSorting(validSorting);
    setPendingEntries(
      validSorting.length > 0
        ? validSorting.map(sort => {
          const column = Object.keys(sort)[0];
          return { column, hasDirection: true };
        })
        : [{ column: '', hasDirection: false }]
    );
  }, [filterConfig.appliedSorting]);

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

        // **Only** update filter if the current sorting entry is complete
        if (newPendingEntries[index].hasDirection) {
          const validSorting = newSorting.filter((sort, i) => {
            const sortKey = Object.keys(sort)[0];
            return sortKey !== '' && newPendingEntries[i]?.hasDirection;
          });
          console.log('Calling onFilterChange from handleSortingChange');
          onFilterChange({
            ...filterConfig,
            appliedSorting: validSorting,
          });
        }
      }
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

    const validSorting = newSorting.filter((_, i) => newPendingEntries[i]?.hasDirection);
    console.log('Calling onFilterChange from removeSorting');
    onFilterChange({
      ...filterConfig,
      appliedSorting: validSorting,
    });
  };

  const handlePanelClose = () => {
    const validEntries = pendingEntries.filter(entry => entry.column !== '' && entry.hasDirection);
    const validSorting = localSorting.filter((_, index) =>
      pendingEntries[index]?.column !== '' && pendingEntries[index]?.hasDirection
    );

    setPendingEntries(validEntries.length > 0 ? validEntries : [{ column: '', hasDirection: false }]);
    setLocalSorting(validSorting);

    console.log('Panel closed without calling onFilterChange');
    setIsOpen(false);
  };

  const isLastSortComplete = () => {
    if (pendingEntries.length === 0) return true;
    const last = pendingEntries[pendingEntries.length - 1];
    return last.column !== '' && last.hasDirection;
  };

  const getDirectionOptions = (column: string) => {
    const type = availableColumnsTypes[column];
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

  const orderedColumns = Object.keys(availableColumnsTypes)
    .filter((col) => filterConfig.columns.includes(col))
    .map(col => ({
      value: col,
      label: formatHeader(col)
    }));

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={(open) => !open && handlePanelClose()}>
        <PopoverTrigger asChild>
          <Button
            variant="secondaryFlat"
            size="default"
            className={`
              flex items-center gap-2
              transition-colors duration-300 ease-in-out
              ${filterConfig.appliedSorting.length > 0
                ? "bg-green-100 hover:bg-green-200 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                : ""}
            `}
            aria-label={`Toggle column visibility. ${filterConfig.appliedSorting.length} columns shown`}
            onClick={() => setIsOpen(true)}
          >
            <ArrowUpDownIcon className="w-4 h-4" />
            <span className="hidden sm:block">{`Sorting (${filterConfig.appliedSorting.length})`}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Sort Data</h4>
              <p className="text-sm text-muted-foreground">
                Select columns and sort direction to organize your data.
              </p>
            </div>

            <div className="space-y-2">
              {pendingEntries.map((entry, index) => {
                const sort = localSorting[index] || { '': 'asc' };
                const column = entry.column;
                const direction = column ? sort[column] : 'asc';
                const directionOptions = getDirectionOptions(column);

                return (
                  <div key={index} className="flex items-center gap-2 w-full max-w-[100%]">
                    <div className="flex items-center gap-2 flex-nowrap overflow-hidden pr-2">
                      {/* Column Selection */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="secondaryFlat"
                            role="combobox"
                            size="sm"
                            className="w-[200px] justify-between"
                          >
                            {column ? formatHeader(column) : "Select Column"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
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

                      {/* Direction Selection */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="secondaryFlat"
                            size="sm"
                            role="combobox"
                            className="w-[140px] justify-between"
                            disabled={!column}
                          >
                            {column && entry.hasDirection ?
                              directionOptions.find(opt => opt.value === direction)?.label
                              : "Select Order"
                            }
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

                      {column && <Button variant="ghost" size="sm"
                        onClick={() => removeSorting(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>}
                    </div>
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
                <PlusIcon className="w-4 h-4 " />
                Add Sorting
              </Button>
            </div>

            {/* No Apply Button as per your request */}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SortingPanelNew;
