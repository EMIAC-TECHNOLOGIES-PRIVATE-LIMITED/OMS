import React, { useState, useRef } from 'react';
import { FilterConfig, } from '../../../../../shared/src/types';
import Button from '../Button/Button';
import Panel from '../Panel/Panel';
import { EyeSlashIcon } from '@heroicons/react/24/outline';
import ColumnSelector from '../ColumnSelector/ColumnSelector';
import { availableColumnsTypes } from '../../../types';

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

  // Handle changes to selected columns
  const handleColumnsChange = (updatedColumns: string[]) => {
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
        icon={<EyeSlashIcon className="w-5 h-5 mr-1" />}
        label={`Show Columns (${selectedColumns.length})`}
      />

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
