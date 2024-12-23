import React from 'react';
import { SortingOption, FrontendAvailableColumns } from '../../../types';

interface SortingListProps {
  sorting: SortingOption[];
  setSorting: React.Dispatch<React.SetStateAction<SortingOption[]>>;
  availableColumns: FrontendAvailableColumns;
  showColumns: string[];
}


const SortingList: React.FC<SortingListProps> = ({
  sorting,
  setSorting,
  availableColumns,
  showColumns,
}) => {
  const addSortingOption = () => {
    if (showColumns.length === 0) {
      console.warn('No columns available to sort.');
      return;
    }
    setSorting([...sorting, { column: showColumns[0], direction: 'asc' }]);
  };

  const updateSorting = (
    index: number,
    field: 'column' | 'direction',
    value: string
  ) => {
    setSorting((prevSorting) => {
      const updatedSorting = [...prevSorting];
      if (field === 'column') {
        updatedSorting[index] = {
          ...updatedSorting[index],
          column: value
        };
      } else {
        updatedSorting[index] = {
          ...updatedSorting[index],
          direction: value as 'asc' | 'desc'
        };
      }
      return updatedSorting;
    });
  };

  const removeSorting = (index: number) => {
    setSorting((prevSorting) => {
      const updatedSorting = [...prevSorting];
      updatedSorting.splice(index, 1);
      return updatedSorting;
    });
  };

  return (
    <div className="mb-4">
      <h4 className="font-medium mb-2">Sorting</h4>
      <div className="space-y-2">
        {sorting.map((sort, index) => (
          <div key={`${sort.column}-${sort.direction}-${index}`} className="flex items-center space-x-2">
            <select
              value={sort.column}
              onChange={(e) => updateSorting(index, 'column', e.target.value)}
              className="border border-gray-300 rounded-md p-1"
            >
              {showColumns.map((column) => (
                <option key={column} value={column}>
                  {availableColumns[column]?.label || column}
                </option>
              ))}
            </select>
            <select
              value={sort.direction}
              onChange={(e) => updateSorting(index, 'direction', e.target.value)}
              className="border border-gray-300 rounded-md p-1"
            >
              {availableColumns[sort.column]?.type === 'String' ? (
                <>
                  <option value="asc">A-Z</option>
                  <option value="desc">Z-A</option>
                </>
              ) : (
                <>
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </>
              )}  
            </select>
            <button
              onClick={() => removeSorting(index)}
              className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addSortingOption}
        className="mt-2 px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
      >
        Add Sorting
      </button>
    </div>
  );
};

export default SortingList;