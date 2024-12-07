import { useState, useEffect } from 'react';
import { FrontendAvailableColumns } from '../types';

export function useColumns(
  availableColumns: FrontendAvailableColumns,
  initialColumns: string[]
) {
  const [showColumns, setShowColumns] = useState<string[]>([]);

  // Initialize shown columns
  useEffect(() => {
    if (initialColumns) {
      setShowColumns(initialColumns);
    } else {
      setShowColumns(Object.keys(availableColumns));rea
    }
  }, [availableColumns, initialColumns]);

  return {
    showColumns,
    setShowColumns,
  };
}
