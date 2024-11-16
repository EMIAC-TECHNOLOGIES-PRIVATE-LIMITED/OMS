import { useState, useEffect } from 'react';
import { SortingOption } from '../types';

export function useSorting(initialSorting: Array<{ [key: string]: 'asc' | 'desc' }>) {
  const [sorting, setSorting] = useState<SortingOption[]>([]);

  useEffect(() => {
    if (initialSorting && Array.isArray(initialSorting)) {
      const parsedSorting = initialSorting.map((sortObj) => {
        const column = Object.keys(sortObj)[0];
        const direction = sortObj[column];
        return { column, direction };
      });
      setSorting(parsedSorting);
    } else {
      setSorting([]);
    }
  }, [initialSorting]);

  const updateSorting = (index: number, field: keyof SortingOption, value: string) => {
    setSorting(prevSorting => {
      const updatedSorting = [...prevSorting];
      updatedSorting[index] = {
        ...updatedSorting[index],
        [field]: value
      };
      return updatedSorting;
    });
  };

  const addSorting = () => {
    setSorting(prev => [...prev, { column: '', direction: 'asc' }]);
  };

  const removeSorting = (index: number) => {
    setSorting(prev => prev.filter((_, i) => i !== index));
  };

  return {
    sorting,
    setSorting,
    updateSorting,
    addSorting,
    removeSorting
  };
}