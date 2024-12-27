import React, { useState, useRef } from 'react';
import { FilterConfig } from '../../../../../shared/src/types';
import Button from '../Button/Button';
import Panel from '../Panel/Panel';
import { ArrowsUpDownIcon, ChevronDownIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import IconButton from '../IconButton/IconButton';

interface SortingPanelNewProps {
  resource: string;
  filterConfig: FilterConfig;
  availableColumnsTypes: { [key: string]: any }; 
  onFilterChange: (newFilterConfig: FilterConfig) => void;
}

const SortingPanelNew: React.FC<SortingPanelNewProps> = ({
  filterConfig,
  availableColumnsTypes,
  onFilterChange,
}) => {
  const [isSortingPanelOpen, setIsSortingPanelOpen] = useState<boolean>(false);
  const [localSorting, setLocalSorting] = useState<{ [key: string]: 'asc' | 'desc' }[]>(
    filterConfig.appliedSorting || []
  );
  const panelRef = useRef<HTMLDivElement>(null);

  const toggleSortingPanel = () => {
    setIsSortingPanelOpen((prev) => !prev);
  };

  const handleSortingChange = (index: number, field: 'column' | 'direction', value: string) => {
    const updatedSorting = [...localSorting];
    const currentEntry = updatedSorting[index] || {};

    if (field === 'column') {
      const direction = currentEntry[Object.keys(currentEntry)[0] || ''] || 'asc';
      updatedSorting[index] = { [value]: direction };
    } else if (field === 'direction') {
      const column = Object.keys(currentEntry)[0] || '';
      if (column) {
        updatedSorting[index] = { [column]: value as 'asc' | 'desc' };
      }
    }

    setLocalSorting(updatedSorting);
  };

  const addSorting = () => {
    setLocalSorting([...localSorting, { '': 'asc' }]);
  };

  const removeSorting = (index: number) => {
    setLocalSorting((prev) => prev.filter((_, i) => i !== index));
  };

  const applySorting = () => {
    const validSorting = localSorting.filter((entry) => {
      const column = Object.keys(entry)[0];
      const direction = entry[column];
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
      <Button
        onClick={toggleSortingPanel}
        icon={<ArrowsUpDownIcon className="w-5 h-5 mr-1" />}
        label={`Sort (${filterConfig.appliedSorting.length})`}
      />

      <Panel
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
                {/* Column Selection */}
                <div className="relative mr-2">
                  <select
                    value={column}
                    onChange={(e) => handleSortingChange(index, 'column', e.target.value)}
                    className="appearance-none w-32 border border-brand rounded-md p-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="">Select Column</option>
                    {Object.keys(availableColumnsTypes).map((col) => (
                      <option key={col} value={col}>
                        {availableColumnsTypes[col]?.label || col}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-1 top-1.5 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>

                {/* Direction Selection */}
                <div className="relative mr-2">
                  <select
                    value={direction}
                    onChange={(e) => handleSortingChange(index, 'direction', e.target.value)}
                    className="appearance-none w-24 border border-brand rounded-md p-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand"
                    disabled={!column}
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                  <ChevronDownIcon className="absolute right-1 top-1.5 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>

                {/* Remove Sorting Button */}
                <IconButton
                  icon={<TrashIcon className="w-4 h-4 text-red-500" />}
                  ariaLabel="Remove Sorting"
                  onClick={() => removeSorting(index)}
                />
              </div>
            );
          })}

          <Button
            onClick={addSorting}
            icon={<PlusIcon className="w-4 h-4 mr-1" />}
            label="Add Sorting"
            className="mt-2 text-xs"
          />
        </div>

        <div className="flex justify-end mt-4">
          <Button
            onClick={() => setIsSortingPanelOpen(false)}
            label="Cancel"
            className="mr-2"
          />
          <Button
            onClick={applySorting}
            label="Apply"
          />
        </div>
      </Panel>
    </div>
  );
};

export default SortingPanelNew;
