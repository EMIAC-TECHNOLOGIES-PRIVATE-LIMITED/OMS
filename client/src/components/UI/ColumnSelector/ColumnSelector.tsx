
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface ColumnSelectorProps {
  availableColumns: string[];
  selectedColumns: string[]; 
  onColumnsChange: (columns: string[]) => void; 
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  availableColumns,
  selectedColumns,
  onColumnsChange,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
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

  // Handle checkbox state changes
  const handleCheckboxChange = (column: string) => {
    const updatedColumns = selectedColumns.includes(column)
      ? selectedColumns.filter((col) => col !== column)
      : [...selectedColumns, column];
    onColumnsChange(updatedColumns);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Toggle Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        className="w-full border border-neutral-300 rounded-md p-2 text-left flex justify-between items-center bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-dark transition-colors duration-200"
      >
        <span className="text-sm">
          {selectedColumns.length > 0
            ? `${selectedColumns.length} Column${
                selectedColumns.length > 1 ? 's' : ''
              } Selected`
            : 'Select Columns'}
        </span>
        {dropdownOpen ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Dropdown Content */}
      {dropdownOpen && (
        <div className="absolute left-0 mt-1 w-full bg-white border border-neutral-300 rounded-md shadow-lg max-h-60 overflow-y-auto z-10">
          {availableColumns.map((column) => (
            <label
              key={column}
              className="flex items-center px-3 py-2 hover:bg-neutral-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedColumns.includes(column)}
                onChange={() => handleCheckboxChange(column)}
                className="form-checkbox h-4 w-4 text-brand focus:ring-brand"
              />
              <span className="ml-2 text-sm text-neutral-700">{column}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColumnSelector;
