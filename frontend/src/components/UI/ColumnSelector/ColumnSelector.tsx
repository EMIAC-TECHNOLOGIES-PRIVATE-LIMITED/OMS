// src/components/ColumnSelector.tsx

import React, { useState, useRef, useEffect } from 'react';
import { FrontendAvailableColumns } from '../../../types';

interface ColumnSelectorProps {
  availableColumns: FrontendAvailableColumns;
  showColumns: string[];
  onChange: (columns: string[]) => void;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  availableColumns,
  showColumns,
  onChange,
}) => {
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
    onChange(
      showColumns.includes(column)
        ? showColumns.filter((col) => col !== column)
        : [...showColumns, column]
    );
  };

  return (
    <div className="mb-4" ref={dropdownRef}>
      <h4 className="font-medium">Show/Hide Columns</h4>
      <div className="relative mt-2">
        <button
          type="button"
          onClick={toggleDropdown}
          className="w-full border border-gray-300 rounded-md p-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center"
        >
          <span>
            {showColumns.length > 0
              ? `${showColumns.length} Column${
                  showColumns.length > 1 ? 's' : ''
                } Selected`
              : 'Select Columns'}
          </span>
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${
              dropdownOpen ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {Object.keys(availableColumns).map((column) => (
              <label
                key={column}
                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={showColumns.includes(column)}
                  onChange={() => handleCheckboxChange(column)}
                  className="mr-2"
                />
                <span className="text-sm">{availableColumns[column].label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ColumnSelector;
