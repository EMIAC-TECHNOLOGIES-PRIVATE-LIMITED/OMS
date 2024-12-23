import React from 'react';

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  totalRecords: number;
  onPageChange: (page: number, pageSize: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  pageSize,
  totalRecords,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="pagination-control mt-4 flex items-center space-x-4">
      <label>
        Page Size:
        <select
          value={pageSize}
          onChange={(e) => onPageChange(page, parseInt(e.target.value))}
          className="ml-2 border rounded p-1"
        >
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </label>

      <label>
        Page Number
        <input
          className="mx-3 border rounded p-1"
          type="number"
          value={page}
          min={1}
          max={totalPages}
          onChange={(e) => {
            onPageChange(parseInt(e.target.value), pageSize);
          }}
        />
        / of {totalPages} pages.
      </label>
      <button
        onClick={() => onPageChange(page - 1, pageSize)}
        disabled={page === 1}
        className="border rounded px-2 py-1"
      >
        &lt;
      </button>

      <button
        onClick={() => onPageChange(page + 1, pageSize)}
        disabled={page === totalPages}
        className="border rounded px-2 py-1"
      >
        &gt;
      </button>
    </div>
  );
};

export default PaginationControls;
