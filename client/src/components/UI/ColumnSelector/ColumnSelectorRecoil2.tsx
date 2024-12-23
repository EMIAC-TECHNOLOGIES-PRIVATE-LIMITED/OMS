// src/components/UI/ColumnSelector/ColumnSelectorRecoil.tsx

import React from 'react';
import { FrontendAvailableColumns, FilterConfig } from '../../../types';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  currentFilterConfigState,
  availableColumnsState,
} from '../../../store/atoms/atoms';

const ColumnSelectorRecoil: React.FC<{ resource: string }> = ({ resource }) => {
  const [currentFilterConfig, setCurrentFilterConfig] = useRecoilState<
    FilterConfig | null
  >(currentFilterConfigState(resource));
  const availableColumns = useRecoilValue<FrontendAvailableColumns>(
    availableColumnsState(resource)
  );

  if (!currentFilterConfig) {
    return null;
  }

  const showColumns = currentFilterConfig.columns || [];

  // Handle show/hide column selection
  const handleCheckboxChange = (column: string) => {
    const newColumns = showColumns.includes(column)
      ? showColumns.filter((col) => col !== column)
      : [...showColumns, column];

    setCurrentFilterConfig((prevConfig) => {
      if (prevConfig) {
        return {
          ...prevConfig,
          columns: newColumns,
        };
      }
      return prevConfig;
    });
  };

  return (
    <div className="mb-3">
      <div className="mt-1">
        {Object.keys(availableColumns).map((column) => (
          <label
            key={column}
            className="flex items-center px-3 py-2 hover:bg-neutral-100 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={showColumns.includes(column)}
              onChange={() => handleCheckboxChange(column)}
              className="form-checkbox h-4 w-4 text-brand focus:ring-brand"
            />
            <span className="ml-2 text-sm text-neutral-700">
              {availableColumns[column]?.label || column}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ColumnSelectorRecoil;
