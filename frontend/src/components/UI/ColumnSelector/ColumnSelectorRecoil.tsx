import React, { useState, useRef, useEffect } from 'react';
import { FrontendAvailableColumns, FilterConfig } from '../../../types';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useRecoilState, useRecoilValue } from 'recoil';
import { currentFilterConfigState, availableColumnsState } from '../../../store/atoms/atoms';

const ColumnSelectorRecoil: React.FC<{ resource: string }> = ({ resource }) => {
  const [currentFilterConfig, setCurrentFilterConfig] = useRecoilState<FilterConfig | null>(
    currentFilterConfigState(resource)
  );
  const availableColumns = useRecoilValue<FrontendAvailableColumns>(availableColumnsState(resource));

  console.log("availabe columns  :", availableColumns);

  if (!currentFilterConfig) {
    return null; // Or render a loading indicator
  }

  const showColumns = currentFilterConfig.columns || [];

  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Toggle columns dropdown
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle show/hide column selection
  const handleCheckboxChange = (column: string) => {
    const newColumns = showColumns.includes(column)
      ? showColumns.filter((col) => col !== column)
      : Object.keys(availableColumns).filter((c) => (
        showColumns.includes(c) || c === column
      ))

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
    <div className="mb-3" ref={dropdownRef}>
      <h4 className="font-medium text-sm text-neutral-800">Show/Hide Columns</h4>
      <div className="relative mt-1">
        <button
          type="button"
          onClick={toggleDropdown}
          className="w-full border border-neutral-300 rounded-md p-2 text-left flex justify-between items-center bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-dark transition-colors duration-200"
        >
          <span className="text-sm">
            {showColumns.length > 0
              ? `${showColumns.length} Column${showColumns.length > 1 ? 's' : ''} Selected`
              : 'Select Columns'}
          </span>
          {dropdownOpen ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {dropdownOpen && (
          <div className="absolute left-0 mt-1 w-full bg-white border border-neutral-300 rounded-md shadow-lg max-h-60 overflow-y-auto z-10">
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
        )}
      </div>
    </div>
  );
};

export default ColumnSelectorRecoil;