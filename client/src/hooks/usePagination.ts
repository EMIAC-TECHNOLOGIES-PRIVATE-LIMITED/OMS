import { useState } from 'react';

export function usePagination(
  initialPage: number,
  initialPageSize: number,
  onPageChange: (page: number, pageSize: number) => void
) {
  const [page, setPage] = useState<number>(initialPage || 1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize || 25);

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
    onPageChange(newPage, newPageSize);
  };

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    handlePageChange,
  };
}
