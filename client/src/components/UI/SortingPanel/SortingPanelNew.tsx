// src/components/UI/SortingPanelNew/SortingPanelNew.tsx

import React, { useState, useRef } from 'react';
import { FilterConfig, FrontendAvailableColumns, SortingOption, LogicalOperator } from '../../../../shared/src/types';
import ButtonNew from '../ButtonNew/ButtonNew';
import PanelNew from '../PanelNew/PanelNew';
import { ArrowsUpDownIcon, ChevronDownIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { mapBackendToFrontendType } from '../../../utils';
import IconButtonNew from '../IconButtonNew/IconButtonNew';

interface SortingPanelNewProps {
  resource: string;
  filterConfig: FilterConfig;
  availableColumns: FrontendAvailableColumns;
  onFilterChange: (newFilterConfig: FilterConfig) => void;
}

const SortingPanelNew: React.FC<SortingPanelNewProps> = ({ resource, filterConfig, availableColumns, onFilterChange }) => {
  const [isSortingPanelOpen, setIsSortingPanelOpen] = useState<boolean>(false);
  const [localSorting, setLocalSorting] = useState<SortingOption[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  if (!filterConfig) {
    return null;
  }

  const toggleSortingPanel = () => {
    if (!isSortingPanelOpen) {
      setLocalSorting(filterConfig.appliedSorting);
    }
    setIsSortingPanelOpen(prev => !prev);
  };

  const handleSortingChange = (index: number, field: keyof SortingOption, value: any) => {
    const updatedSorting = [...localSorting];
    if (field === 'column') {
      const existingDirection = updatedSorting[index][Object.keys(updatedSorting[index])[0] || 'asc'];
      updatedSorting[index] = { [value]: existingDirection };
    } else if (field === 'direction') {
      const column = Object.keys(updatedSorting[index])[0];
      updatedSorting[index] = { [column]: value };
    }
    setLocalSorting(updatedSorting);
  };

  const addSorting = () => {
    setLocalSorting([...localSorting, { '': 'asc' }]);
  };

  const removeSorting = (index: number) => {
    const updatedSorting = [...localSorting];
    updatedSorting.splice(index, 1);
    setLocalSorting(updatedSorting);
  };

  const applySorting = () => {
    // Remove any incomplete sorting options
    const validSorting = localSorting.filter(sort => {
      const column = Object.keys(sort)[0];
      const direction = sort[column];
      return column && direction;
    });

    onFilterChange({
      ...filterConfig,
      appliedSorting: validSorting,
    });

    setIsSortingPanelOpen(false);
  };

  return (
    <div className="relative">
      <ButtonNew
        onClick={toggleSortingPanel}
        icon={<ArrowsUpDownIcon className="w-5 h-5 mr-1" />}
        label={`Sort (${filterConfig.appliedSorting.length})`}
      />
      <PanelNew
        isOpen={isSortingPanelOpen}
        onClose={() => setIsSortingPanelOpen(false)}
        title="Sorting Options"
        panelRef={panelRef}
      >
        <div>
          {localSorting.map((sort, index) => {
            const column = Object.keys(sort)[0] || '';
            const direction = sort[column] || 'asc';

            return (
              <div key={index} className="flex items-center mb-1">
                <div className="relative mr-2">
                  <select
                    value={column}
                    onChange={(e) => handleSortingChange(index, 'column', e.target.value)}
                    className="appearance-none w-32 border border-brand rounded-md p-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="">Select Column</option>
                    {availableColumns && Object.keys(availableColumns).map(col => (
                      <option key={col} value={col}>
                        {availableColumns[col]?.label || col}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-1 top-1.5 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>

                <div className="relative mr-2">
                  <select
                    value={direction}
                    onChange={(e) => handleSortingChange(index, 'direction', e.target.value as 'asc' | 'desc')}
                    className="appearance-none w-24 border border-brand rounded-md p-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand"
                    disabled={!column}
                  >
                    {column && ['Int', 'BigInt'].includes(mapBackendToFrontendType(availableColumns[column]?.type || 'String')) ? (
                      <>
                        <option value="asc">1-9</option>
                        <option value="desc">9-1</option>
                      </>
                    ) : (
                      <>
                        <option value="asc">A-Z</option>
                        <option value="desc">Z-A</option>
                      </>
                    )}
                  </select>
                  <ChevronDownIcon className="absolute right-1 top-1.5 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>

                <IconButtonNew
                  icon={<TrashIcon className="w-4 h-4 text-red-500" />}
                  ariaLabel="Remove Sorting"
                  onClick={() => removeSorting(index)}
                  className="text-red-500 hover:text-red-700 focus:outline-none bg-transparent hover:bg-slate-300"
                />
              </div>
            );
          })}

          <ButtonNew
            onClick={addSorting}
            icon={<PlusIcon className="w-4 h-4 mr-1" />}
            label="Add Sorting"
            className="mt-2 text-xs"
          />
        </div>

        <div className="flex justify-end mt-4">
          <ButtonNew
            onClick={() => setIsSortingPanelOpen(false)}
            label="Cancel"
            className="mr-2"
          />
          <ButtonNew
            onClick={applySorting}
            label="Apply"
          />
        </div>
      </PanelNew>
    </div>
  );
};

export default SortingPanelNew;
