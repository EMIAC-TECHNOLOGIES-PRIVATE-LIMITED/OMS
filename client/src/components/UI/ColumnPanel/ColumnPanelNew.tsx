import React, { useMemo } from 'react';
import { FilterConfig } from '../../../../../shared/src/types';
import { EyeOff, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface ColumnPanelProps {
  resource: string;
  filterConfig: FilterConfig;
  availableColumnsTypes: Record<string, any>;
  onFilterChange: (newFilterConfig: FilterConfig) => void;
}

const ColumnPanel: React.FC<ColumnPanelProps> = ({
  resource,
  filterConfig,
  availableColumnsTypes,
  onFilterChange,
}) => {
  const selectedColumns = filterConfig.columns || [];
  const availableColumns = useMemo(
    () => Object.keys(availableColumnsTypes),
    [availableColumnsTypes]
  );

  const sanitizeFilterConfig = (columns: string[]) => {
    const updatedFilterConfig = { ...filterConfig };

    // Handle AND filters
    if (updatedFilterConfig.appliedFilters.AND) {
      updatedFilterConfig.appliedFilters.AND = updatedFilterConfig.appliedFilters.AND.filter((filter) => {
        const column = Object.keys(filter)[0];
        return columns.includes(column);
      });

      if (updatedFilterConfig.appliedFilters.AND.length === 0) {
        delete updatedFilterConfig.appliedFilters.AND;
      }
    }

    // Handle OR filters
    if (updatedFilterConfig.appliedFilters.OR) {
      updatedFilterConfig.appliedFilters.OR = updatedFilterConfig.appliedFilters.OR.filter((filter) => {
        const column = Object.keys(filter)[0];
        return columns.includes(column);
      });

      if (updatedFilterConfig.appliedFilters.OR.length === 0) {
        delete updatedFilterConfig.appliedFilters.OR;
      }
    }

    // Clean up sorting
    updatedFilterConfig.appliedSorting = updatedFilterConfig.appliedSorting.filter((sorting) => {
      const column = Object.keys(sorting)[0];
      return columns.includes(column);
    });

    return updatedFilterConfig;
  };

  const handleColumnsChange = (updatedColumns: string[]) => {
    const newFilterConfig = sanitizeFilterConfig(updatedColumns);
    onFilterChange({
      ...newFilterConfig,
      columns: updatedColumns,
    });
  };

  const formatColumnName = (name: string): string => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };


  return (
    <div className="relative">
      <DropdownMenu >
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondaryFlat"
            size="default"
            className={`
              flex items-center gap-2
              transition-colors duration-300 ease-in-out
              ${selectedColumns.length < availableColumns.length
                ? "bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                : ""}
            `}
            aria-label={`Toggle column visibility. ${selectedColumns.length} columns shown`}
          >
            <EyeOff className="w-4 h-4" />
            <span>Hide Columns ({Object.keys(availableColumnsTypes).length - selectedColumns.length})</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-auto overflow-y-visible " align="end" sideOffset={4}>
          <DropdownMenuLabel className='font-bold'>Select Columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Command>
            <CommandInput placeholder="Search columns..." />
            <CommandList>
              <CommandEmpty>No columns found.</CommandEmpty>
              <CommandGroup>
                {availableColumns.map((column) => (
                  <CommandItem
                    key={column}
                    onSelect={() => {
                      const updatedColumns = selectedColumns.includes(column)
                        ? selectedColumns.filter((c) => c !== column)
                        : [...selectedColumns, column];
                      handleColumnsChange(updatedColumns);
                    }}
                  >
                    {formatColumnName(column)}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedColumns.includes(column) ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ColumnPanel;
