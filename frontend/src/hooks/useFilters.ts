// src/hooks/useFilters.ts

import { useState, useEffect, useCallback } from 'react';
import { ExtendedFilterCondition, FrontendAvailableColumns } from '../types';

export function useFilters(
  availableColumns: FrontendAvailableColumns,
  initialFilters: any,
  initialConnector: 'AND' | 'OR'
) {
  const [filters, setFilters] = useState<ExtendedFilterCondition[]>([]);
  const [globalConnector, setGlobalConnector] = useState<'AND' | 'OR'>(initialConnector);

  // Parse filters
  const parseFilters = useCallback(
    (filtersObj: any): { filters: ExtendedFilterCondition[]; connector: 'AND' | 'OR' } => {
      const result: ExtendedFilterCondition[] = [];
      let connector: 'AND' | 'OR' = initialConnector;

      if (!filtersObj || Object.keys(filtersObj).length === 0) {
        return { filters: [], connector };
      }

      const rootConnector = Object.keys(filtersObj)[0] as 'AND' | 'OR';
      connector = rootConnector;

      const conditions = filtersObj[rootConnector];
      conditions.forEach((condition: any) => {
        const column = Object.keys(condition)[0];
        const operatorObj = condition[column];
        const operator = Object.keys(operatorObj)[0];
        const value = operatorObj[operator];

        result.push({ column, operator, value });
      });

      return { filters: result, connector };
    },
    [initialConnector]
  );

  useEffect(() => {
    const { filters: parsedFilters, connector } = parseFilters(initialFilters);
    setFilters(parsedFilters);
    setGlobalConnector(connector);
  }, [initialFilters, parseFilters]);

  return {
    filters,
    setFilters,
    globalConnector,
    setGlobalConnector,
  };
}
