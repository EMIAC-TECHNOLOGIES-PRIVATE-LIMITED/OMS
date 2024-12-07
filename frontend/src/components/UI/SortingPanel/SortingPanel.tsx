import React, { useState, useRef } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  currentFilterConfigState,
  availableColumnsState,
} from '../../../store/atoms/atoms';
import { FrontendAvailableColumns, FilterConfig, SortingOption } from '../../../types';
import Button from '../Button/Button';
import Panel from '../Panel/Panel';
import {
  ArrowsUpDownIcon,
  ChevronDownIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface SortingPanelRecoilProps {
  resource: string;
}

const SortingPanelRecoil: React.FC<SortingPanelRecoilProps> = ({ resource }) => {
  const [currentFilterConfig, setCurrentFilterConfig] = useRecoilState<
    FilterConfig | null
  >(currentFilterConfigState(resource));

  const availableColumns = useRecoilValue<FrontendAvailableColumns>(
    availableColumnsState(resource)
  );

  const [isSortingPanelOpen, setIsSortingPanelOpen] = useState<boolean>(false);
  const [localSorting, setLocalSorting] = useState<SortingOption[]>([]);

  const panelRef = useRef<HTMLDivElement>(null);

  if (!currentFilterConfig) {
    return null;
  }

  const toggleSortingPanel = () => {
    if (!isSortingPanelOpen) {
      setLocalSorting(currentFilterConfig.sorting);
    }
    setIsSortingPanelOpen((prev) => !prev);
  };

  return (
    <div className="relative">
      <Button
        onClick={toggleSortingPanel}
        icon={<ArrowsUpDownIcon className="w-5 h-5 mr-1" />}
        label={`Sort (${currentFilterConfig.sorting.length})`}
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
                <div className="relative mr-2">
                  <select
                    value={column}
                    onChange={(e) => {
                      const newColumn = e.target.value;
                      setLocalSorting((prevSorting) => {
                        const newSorting = [...prevSorting];
                        newSorting[index] = { [newColumn]: direction };
                        return newSorting;
                      });
                    }}
                    className="appearance-none w-32 border border-brand rounded-md p-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="">Select Column</option>
                    {availableColumns &&
                      Object.keys(availableColumns).map((col) => (
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
                    onChange={(e) => {
                      const newDirection = e.target.value as 'asc' | 'desc';
                      setLocalSorting((prevSorting) => {
                        const newSorting = [...prevSorting];
                        newSorting[index] = { [column]: newDirection };
                        return newSorting;
                      });
                    }}
                    className="appearance-none w-24 border border-brand rounded-md p-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand"
                    disabled={!column}
                  >
                    {column && availableColumns[column]?.type === 'Int' || availableColumns[column]?.type === 'BigInt' ? (
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

                <Button
                  onClick={() => {
                    setLocalSorting((prevSorting) => {
                      const newSorting = [...prevSorting];
                      newSorting.splice(index, 1);
                      return newSorting;
                    });
                  }}
                  icon={<TrashIcon className="w-4 h-4 text-red-500" />}
                  className="text-red-500 hover:text-red-700 focus:outline-none bg-transparent hover:bg-slate-300"
                  ariaLabel="Remove Sorting"
                  title="Remove Sorting"
                />
              </div>
            );
          })}

          <Button
            onClick={() => {
              setLocalSorting((prevSorting) => [
                ...prevSorting,
                { '': 'asc' },
              ]);
            }}
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
            onClick={() => {
              setCurrentFilterConfig((prevConfig) =>
                prevConfig
                  ? { ...prevConfig, sorting: localSorting }
                  : null
              );
            }}
            label="Apply"
          />
        </div>
      </Panel>
    </div>
  );
};

export default SortingPanelRecoil;
