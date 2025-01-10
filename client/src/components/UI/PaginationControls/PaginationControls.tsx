import React from 'react';

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  totalPages: number;
  handlePageChange: (page: number, pageSize: number) => void;
}

const PaginationControlsNew: React.FC<PaginationControlsProps> = ({
  page,
  pageSize,
  totalPages,
  handlePageChange,
}) => {

  return (
    <div className="pagination-controls mt-4 flex items-center space-x-4">
      {/* Page Size Selection */}
      <label className="flex items-center space-x-2">
        <span>Page Size:</span>
        <select
          value={pageSize}
          onChange={(e) => handlePageChange(1, parseInt(e.target.value, 10))}
          className="border rounded p-1"
        >
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </label>

      {/* Current Page Input */}
      <label className="flex items-center space-x-2">
        <span>Page:</span>
        <input
          type="number"
          value={page}
          min={1}
          max={totalPages}
          onChange={(e) => {
            const newPage = Math.min(Math.max(parseInt(e.target.value, 10), 1), totalPages);
            handlePageChange(newPage, pageSize);
          }}
          className="w-16 border rounded p-1 text-center"
        />
        <span>/ {totalPages}</span>
      </label>

      {/* Previous Page Button */}
      <button
        onClick={() => handlePageChange(page - 1, pageSize)}
        disabled={page <= 1}
        className="border rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &lt;
      </button>

      {/* Next Page Button */}
      <button
        onClick={() => handlePageChange(page + 1, pageSize)}
        disabled={page >= totalPages}
        className="border rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &gt;
      </button>
    </div>
  );
};

export default PaginationControlsNew;
