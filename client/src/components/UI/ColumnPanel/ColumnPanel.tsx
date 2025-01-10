import React, { useState, useRef } from 'react';
import { FilterConfig, } from '../../../../../shared/src/types';

import Panel from '../Panel/Panel';
import { EyeSlashIcon } from '@heroicons/react/24/outline';
import ColumnSelector from '../ColumnSelector/ColumnSelector';
import { availableColumnsTypes } from '../../../types';
import { Button } from '@/components/ui/button';

interface ColumnPanelNewProps {
  resource: string;
  filterConfig: FilterConfig;
  availableColumnsTypes: availableColumnsTypes;
  onFilterChange: (newFilterConfig: FilterConfig) => void;
}

const ColumnPanelNew: React.FC<ColumnPanelNewProps> = ({
  resource,
  filterConfig,
  availableColumnsTypes,
  onFilterChange,
}) => {
  const [isColumnPanelOpen, setIsColumnPanelOpen] = useState<boolean>(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fallback for missing columns in filterConfig
  const selectedColumns = filterConfig.columns || [];

  // Derive available columns from availableColumnsTypes
  const availableColumns = Object.keys(availableColumnsTypes);

  // Sanitize applied filters and sorting based on selected columns 
  const sanitizeFilterConfig = (columns: string[]) => {
    const updatedFilterConfig = { ...filterConfig };

    if (updatedFilterConfig.appliedFilters.AND) {
      updatedFilterConfig.appliedFilters.AND = updatedFilterConfig.appliedFilters.AND.filter((filter) => {
        const column = Object.keys(filter)[0];
        return columns.includes(column);
      });

      if (updatedFilterConfig.appliedFilters.AND.length === 0) {
        delete updatedFilterConfig.appliedFilters.AND;
      }
    } else if (updatedFilterConfig.appliedFilters.OR) {
      updatedFilterConfig.appliedFilters.OR = updatedFilterConfig.appliedFilters.OR.filter((filter) => {
        const column = Object.keys(filter)[0];
        return columns.includes(column);
      });

      if (updatedFilterConfig.appliedFilters.OR.length === 0) {
        delete updatedFilterConfig.appliedFilters.OR;
      }
    }

    // Remove sorting for columns that are not selected
    updatedFilterConfig.appliedSorting = updatedFilterConfig.appliedSorting.filter((sorting) => {
      const column = Object.keys(sorting)[0];
      return columns.includes(column);
    });

    return updatedFilterConfig;
  };



  // Handle changes to selected columns
  const handleColumnsChange = (updatedColumns: string[]) => {

    const filterConfig = sanitizeFilterConfig(updatedColumns);

    onFilterChange({
      ...filterConfig,
      columns: updatedColumns,
    });
  };

  return (
    <div className="relative">
      {/* Toggle Column Panel Button */}
      <Button
        onClick={() => setIsColumnPanelOpen((prev) => !prev)}
      >
        <EyeSlashIcon className="w-5 h-5 mr-1" />
        {`Show Columns (${selectedColumns.length})`}
      </Button>




      {/* Column Selection Panel */}
      <Panel
        isOpen={isColumnPanelOpen}
        onClose={() => setIsColumnPanelOpen(false)}
        title="Select Columns to Display"
        panelRef={panelRef}
      >
        {/* Column Selector */}
        <ColumnSelector
          selectedColumns={selectedColumns}
          availableColumns={availableColumns}
          onColumnsChange={handleColumnsChange}
        />
      </Panel>
    </div>
  );
};

export default ColumnPanelNew;
