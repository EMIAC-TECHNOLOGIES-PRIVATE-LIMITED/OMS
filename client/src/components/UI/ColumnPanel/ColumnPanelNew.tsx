import React, { useMemo } from 'react';
import { FilterConfig } from '../../../../../shared/src/types';
import { EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  // Ensure selectedColumns is initialized from filterConfig
  const selectedColumns = filterConfig.columns || [];

  // Get available columns directly from availableColumnsTypes
  const availableColumns = useMemo(() =>
    Object.keys(availableColumnsTypes),
    [availableColumnsTypes]
  );

  // Sanitize filters and sorting when columns change
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

  // Handle column selection changes
  const handleColumnsChange = (updatedColumns: string[]) => {
    const newFilterConfig = sanitizeFilterConfig(updatedColumns);
    onFilterChange({
      ...newFilterConfig,
      columns: updatedColumns,
    });
  };

  // Format column name for display
  const formatColumnName = (name: string): string => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className="relative">
      <DropdownMenu>
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
        <DropdownMenuContent
          className="w-56"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel>Select Columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableColumns.map((column) => (
            <DropdownMenuCheckboxItem
              key={column}
              checked={selectedColumns.includes(column)}
              onCheckedChange={(checked) => {
                const updatedColumns = checked
                  ? [...selectedColumns, column]
                  : selectedColumns.filter((c) => c !== column);
                handleColumnsChange(updatedColumns);
              }}
            >
              {formatColumnName(column)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ColumnPanel;