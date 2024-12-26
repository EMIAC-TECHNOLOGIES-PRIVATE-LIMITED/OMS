// src/components/UI/ColumnPanelNew/ColumnPanelNew.tsx

import React, { useState, useRef } from 'react';
import { FilterConfig, FrontendAvailableColumns } from '../../../../shared/src/types';
import ButtonNew from '../ButtonNew/ButtonNew';
import PanelNew from '../PanelNew/PanelNew';
import { EyeSlashIcon } from '@heroicons/react/24/outline';
import ColumnSelectorNew from '../ColumnSelectorNew/ColumnSelectorNew'; // Assuming renamed

interface ColumnPanelNewProps {
  resource: string;
  filterConfig: FilterConfig;
  availableColumns: FrontendAvailableColumns;
  onFilterChange: (newFilterConfig: FilterConfig) => void;
}

const ColumnPanelNew: React.FC<ColumnPanelNewProps> = ({ resource, filterConfig, availableColumns, onFilterChange }) => {
  const [isColumnPanelOpen, setIsColumnPanelOpen] = useState<boolean>(false);
  const panelRef = useRef<HTMLDivElement>(null);

  if (!filterConfig) {
    return null;
  }

  const handleColumnsChange = (selectedColumns: string[]) => {
    onFilterChange({
      ...filterConfig,
      columns: selectedColumns,
    });
  };

  return (
    <div className="relative">
      <ButtonNew
        onClick={() => setIsColumnPanelOpen(prev => !prev)}
        icon={<EyeSlashIcon className="w-5 h-5 mr-1" />}
        label={`Show Columns (${filterConfig.columns.length})`}
      />
      <PanelNew
        isOpen={isColumnPanelOpen}
        onClose={() => setIsColumnPanelOpen(false)}
        title="Select Columns to Display"
        panelRef={panelRef}
      >
        {/* Column Selector */}
        <ColumnSelectorNew
          resource={resource}
          selectedColumns={filterConfig.columns}
          availableColumns={availableColumns}
          onColumnsChange={handleColumnsChange}
        />
      </PanelNew>
    </div>
  );
};

export default ColumnPanelNew;
