import React, { useMemo } from 'react';
import { FilterConfig } from '../../../../../shared/src/types';
import { EyeOff, Check } from 'lucide-react';
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
import { availableColumnsTypes } from '@/types';

interface ColumnPanelProps {
  resource: string;
  filterConfig: FilterConfig;
  availableColumnsTypes: Record<string, any>;
  onFilterChange: (newFilterConfig: FilterConfig) => void;
}

const ColumnPanel: React.FC<ColumnPanelProps> = ({
  filterConfig,
  availableColumnsTypes,
  onFilterChange,
  resource
}) => {
  const selectedColumns = filterConfig.columns || [];

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

  const availableColumns = useMemo(
    () => Object.keys(filteredColumns),
    [availableColumnsTypes]
  );


  const sanitizeFilterConfig = (columns: string[]) => {
    const updatedFilterConfig = { ...filterConfig };

    // remove the filters and sorting that is present in the columns that are not selected
    updatedFilterConfig.filters = updatedFilterConfig.filters?.filter((f) => !columns.includes(f.column));
    updatedFilterConfig.sort = updatedFilterConfig.sort?.filter((s) =>
      Object.keys(s).some(key => !columns.includes(key))
    );
    updatedFilterConfig.columns = columns;

    return updatedFilterConfig;
  };


  const handleColumnsChange = (updatedColumns: string[]) => {
    const newFilterConfig = sanitizeFilterConfig(updatedColumns);
    onFilterChange({
      ...newFilterConfig,
    });
  };

  const formatHeader = (name: string, resource: string): string => {
    const [parentField, childField] = name.split('.');
    if (parentField === resource) {
      return childField.charAt(0).toUpperCase() + childField.slice(1);
    }
    return `${parentField.charAt(0).toUpperCase() + parentField.slice(1)} ${childField.charAt(0).toUpperCase() + childField.slice(1)}`;
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
              ${filterConfig.columns?.length && filterConfig.columns?.length > 0
                ? "bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/30 dark:hover:bg-slate-900/50"}
            `}
            aria-label={`Toggle column visibility. ${selectedColumns.length} columns shown`}
          >
            <EyeOff className="w-4 h-4" />
            <span>Hide Columns ({filterConfig.columns?.length || 0})</span>
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
                    {formatHeader(column, resource)}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedColumns.includes(column) ? "opacity-0" : "opacity-100"
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