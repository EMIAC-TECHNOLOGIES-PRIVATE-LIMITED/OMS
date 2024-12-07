
import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  pageState,
  pageSizeState,
  totalRecordsState,
} from '../../../store/atoms/atoms';

interface PaginationControlsProps {
  resource: string;
}

const PaginationControlsRecoil: React.FC<PaginationControlsProps> = ({ resource }) => {
  const [page, setPage] = useRecoilState<number>(pageState(resource));
  const [pageSize, setPageSize] = useRecoilState<number>(pageSizeState(resource));
  const totalRecords = useRecoilValue<number>(totalRecordsState(resource));

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="pagination-control mt-4 flex items-center space-x-4">
      <label>
        Page Size:
        <select
          value={pageSize}
          onChange={(e) => {
            const newPageSize = parseInt(e.target.value);
            setPageSize(newPageSize);
            setPage(1); // Reset to page 1 when page size changes
          }}
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
            setPage(parseInt(e.target.value));
          }}
        />
        / of {totalPages} pages.
      </label>
      <button
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        className="border rounded px-2 py-1"
      >
        &lt;
      </button>

      <button
        onClick={() => setPage(page + 1)}
        disabled={page === totalPages}
        className="border rounded px-2 py-1"
      >
        &gt;
      </button>
    </div>
  );
};

export default PaginationControlsRecoil;
