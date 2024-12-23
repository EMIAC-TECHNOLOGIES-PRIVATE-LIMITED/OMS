import { useState, useCallback, useRef, useEffect } from 'react';
import {
  FilterCondition,
  FilterConfig,
  FrontendAvailableColumns,
  ExtendedFilterCondition,
} from '../../types';
import { mapBackendToFrontendType } from '../../utils/typeMapping';

export function useFilters(
  availableColumns: FrontendAvailableColumns,
  initialFilters: any,
  initialConnector: 'AND' | 'OR',
  onFilterChange: (config: FilterConfig) => void,
  constructFilterConfig: () => FilterConfig
) {
  const [filters, setFilters] = useState<ExtendedFilterCondition[]>([]);
  const [globalConnector, setGlobalConnector] = useState<'AND' | 'OR'>(initialConnector);
  const debouncedOnFilterChange = useRef<NodeJS.Timeout | null>(null);

  // Initialize filters
  useEffect(() => {
    if (initialFilters) {
      // Parse the nested filters into a flat list
      const parsedFilters = parseFilters(initialFilters);
      setFilters(parsedFilters.filters);
      setGlobalConnector(parsedFilters.connector || 'AND');
    }
  }, [initialFilters]);

  // Helper function to parse nested filters into a flat list with a global connector
  const parseFilters = useCallback(
    (
      filtersObj: any
    ): { filters: ExtendedFilterCondition[]; connector: 'AND' | 'OR' } => {
      const result: ExtendedFilterCondition[] = [];
      let connector: 'AND' | 'OR' = 'AND';
      let isConnectorSet = false;

      const traverse = (obj: any, isRoot = false) => {
        for (const key in obj) {
          if (['AND', 'OR', 'NOT'].includes(key)) {
            if (isRoot && !isConnectorSet) {
              connector = key as 'AND' | 'OR';
              isConnectorSet = true;
            }
            const subFilters = obj[key];
            if (Array.isArray(subFilters)) {
              subFilters.forEach((subFilter: any) => {
                traverse(subFilter);
              });
            }
          } else {
            const condition = obj[key];
            for (const operator in condition) {
              const value = condition[operator];
              result.push({
                column: key,
                operator,
                value,
              });
            }
          }
        }
      };
      traverse(filtersObj, true);
      return { filters: result, connector };
    },
    []
  );

  // Debounced effect to call onFilterChange when filters change
  useEffect(() => {
    if (debouncedOnFilterChange.current) {
      clearTimeout(debouncedOnFilterChange.current);
    }

    debouncedOnFilterChange.current = setTimeout(() => {
      const filterConfig = constructFilterConfig();
      onFilterChange(filterConfig);
    }, 500); // Adjust debounce time as needed

    return () => {
      if (debouncedOnFilterChange.current) {
        clearTimeout(debouncedOnFilterChange.current);
      }
    };
  }, [filters, globalConnector, onFilterChange, constructFilterConfig]);

  return {
    filters,
    setFilters,
    globalConnector,
    setGlobalConnector,
  };
}
