// src/hooks/useDataPageRecoil.ts

import { useRecoilState, useRecoilValue } from 'recoil';
import {
  dataState,
  totalRecordsState,
  availableColumnsState,
  loadingState,
  errorState,
  currentViewIdState,
  viewsState,
  initialFilterConfigState,
  pageState,
  pageSizeState,
  isModifiedState,
  currentFilterConfigState,
  isInitialLoadState,
} from '../store/atoms/atoms';
import { fetchDataPage, transformAvailableColumns, cartoonCharacters, mapBackendToFrontendType } from '../utils';
import { useEffect, useCallback } from 'react';
import { FilterConfig, GetViewDataResponse, FrontendAvailableColumns, View, ExtendedFilterCondition } from '../types';

interface UseDataPageRecoilProps {
  apiEndpoint: string;
  resource: string;
  initialPageSize?: number;
}

interface UseDataPageRecoilReturn<T extends object> {
  data: T[];
  totalRecords: number;
  availableColumns: FrontendAvailableColumns;
  loading: boolean;
  error: string | null;
  currentViewId: number | null;
  views: View[];
  initialFilterConfig?: FilterConfig;
  page: number;
  pageSize: number;
  isModified: boolean;
  currentFilterConfig: FilterConfig | null;
  isInitialLoad: boolean;
  handleSelectView: (viewId: number) => void;
  handleDeleteView: (deletedViewId: number) => void;
  handleSaveView: () => Promise<void>;
  handlePageChange: (newPage?: number, newPageSize?: number) => Promise<void>;
  isDefaultView: () => boolean;
}

export function useDataPageRecoil<T extends object>({
  apiEndpoint,
  resource,
}: UseDataPageRecoilProps): UseDataPageRecoilReturn<T> {
  const resourceKey = resource;

  // Recoil States
  const [data, setData] = useRecoilState<T[]>(dataState(resourceKey));
  const [totalRecords, setTotalRecords] = useRecoilState(totalRecordsState(resourceKey));
  const [availableColumns, setAvailableColumns] = useRecoilState<FrontendAvailableColumns>(
    availableColumnsState(resourceKey)
  );
  const [loading, setLoading] = useRecoilState(loadingState(resourceKey));
  const [error, setError] = useRecoilState<string | null>(errorState(resourceKey));
  const [currentViewId, setCurrentViewId] = useRecoilState<number | null>(currentViewIdState(resourceKey));
  const [views, setViews] = useRecoilState<View[]>(viewsState(resourceKey));
  const [initialFilterConfig, setInitialFilterConfig] = useRecoilState<FilterConfig | undefined>(
    initialFilterConfigState(resourceKey)
  );
  const [page, setPage] = useRecoilState<number>(pageState(resourceKey));
  const [pageSize, setPageSize] = useRecoilState<number>(pageSizeState(resourceKey));
  const isModified = useRecoilValue<boolean>(isModifiedState(resourceKey));
  const [currentFilterConfig, setCurrentFilterConfig] = useRecoilState<FilterConfig | null>(
    currentFilterConfigState(resourceKey)
  );
  const [isInitialLoad, setIsInitialLoad] = useRecoilState<boolean>(isInitialLoadState(resourceKey));

  // Function to convert ExtendedFilterCondition[] to Prisma where clause
  const buildWhereClause = useCallback(
    (filters: ExtendedFilterCondition[], connector: 'AND' | 'OR'): any => {
      if (!filters || filters.length === 0) return {};

      const conditions = filters
        .filter(
          (filter) =>
            filter.column &&
            filter.operator &&
            (filter.value !== '' ||
              ['isNull', 'isNotNull'].includes(filter.operator))
        )
        .map((filter) => {
          if (filter.operator === 'isNull') {
            return { [filter.column]: { equals: null } };
          }
          if (filter.operator === 'isNotNull') {
            return { [filter.column]: { not: null } };
          }

          const columnType = mapBackendToFrontendType(
            availableColumns[filter.column]?.type
          );

          let value = filter.value;
          if (columnType === 'date') {
            value = new Date(filter.value).toISOString();
          }

          return { [filter.column]: { [filter.operator]: value } };
        });

      if (conditions.length === 0) return {};

      return { [connector]: conditions };
    },
    [availableColumns]
  );

  // Function to fetch data
  const fetchData = useCallback(
    async () => {
      console.log('fetchData function called !')
      if (!currentFilterConfig) return;
      setLoading(true);
      setError(null);
      try {
        const filtersObject = buildWhereClause(currentFilterConfig.filters, currentFilterConfig.globalConnector);

        const sortingArray = currentFilterConfig.sorting;

        const filterConfigToSend = {
          filters: filtersObject,
          sorting: sortingArray,
          columns: currentFilterConfig.columns,
          grouping: currentFilterConfig.grouping,
          viewName: currentFilterConfig.viewName,
          globalConnector: currentFilterConfig.globalConnector,
        };

        const response: GetViewDataResponse = await fetchDataPage(
          `${apiEndpoint}/data`,
          'post',
          {
            page,
            pageSize,
          },
          filterConfigToSend
        );

        if (response.success) {
          setData(response.data as T[]);
          setTotalRecords(response.totalRecords);

          // Assuming availableColumns might not change here

        } else {
          setError('Failed to fetch data');
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    },
    [apiEndpoint, currentFilterConfig, page, pageSize, buildWhereClause]
  );

   useEffect(() => {
     fetchData();
   }, [currentFilterConfig, currentViewId]);

  // Function to fetch view data
  const fetchViewData = useCallback(
    async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = currentViewId ? `${apiEndpoint}/${currentViewId}` : `${apiEndpoint}`;

        const response: GetViewDataResponse = await fetchDataPage(endpoint, 'get', {
          page,
          pageSize,
        });

        if (response.success) {
          setData(response.data as T[]);
          setTotalRecords(response.totalRecords);
          setAvailableColumns(transformAvailableColumns(response.availableColumns));
          setViews(response.views);

          // Handle view selection
          const selectedView: View | undefined = response.views.find((v) => v.id === response.viewId.id);

          if (selectedView) {
            if (!isInitial) {
              window.localStorage.setItem(`${resource}-view-id`, selectedView.id.toString());
            }

            // Transform appliedFilters into ExtendedFilterCondition[]
            const filtersArray: ExtendedFilterCondition[] = response.appliedFilters
              ? Object.values(response.appliedFilters).map((filter: any) => {
                  return {
                    id: filter.id || '',
                    connector: filter.connector || 'AND',
                    column: filter.column || '',
                    operator: filter.operator || '',
                    value: filter.value || '',
                  } as ExtendedFilterCondition;
                })
              : [];

            // Construct initialFilterConfig based on the selected view
            const initialConfig: FilterConfig = {
              viewName: selectedView.viewName,
              columns: response.viewId.columns,
              filters: filtersArray,
              globalConnector: 'AND', // Default to 'AND'
              sorting: response.appliedSorting || [],
              grouping: response.appliedGrouping || [],
            };
            setInitialFilterConfig(initialConfig);

            if (!currentFilterConfig || isInitial) {
              setCurrentFilterConfig(initialConfig);
            }
          } else {
            // Handle case when no view is found
            setCurrentViewId(null);
          }
        } else {
          setError('Failed to fetch view data');
        }
      } catch (err: any) {
        console.error('Error fetching view data:', err);
        setError(err.response?.data?.message || 'An error occurred while fetching view data');
      } finally {
        setLoading(false);
      }
    },
    [apiEndpoint, page, pageSize, resource, currentFilterConfig, setCurrentFilterConfig, setInitialFilterConfig, setCurrentViewId, setAvailableColumns, setData, setTotalRecords, setViews, setError, setLoading]
  );

  // Handle view selection
  const handleSelectView = useCallback(
    (viewId: number) => {
      setCurrentViewId(viewId);
    },
    [setCurrentViewId]
  );

  // Effect to fetch data when currentViewId changes
  useEffect(() => {
    if (currentViewId !== null) {
      fetchViewData(currentViewId);
    } else {
      fetchViewData();
    }
  }, [currentViewId, fetchViewData]);

  // Handle delete view
  const handleDeleteView = useCallback(
    (deletedViewId: number) => {
      setViews((prevViews) => {
        const updatedViews = prevViews.filter((view) => view.id !== deletedViewId);

        // Check if the deleted view is the current view
        setCurrentViewId((prevCurrentViewId) => {
          if (prevCurrentViewId === deletedViewId) {
            const defaultView = updatedViews.find((v) => v.viewName === 'grid');
            if (defaultView) {
              return defaultView.id;
            } else {
              return null;
            }
          }
          return prevCurrentViewId;
        });

        return updatedViews;
      });
    },
    [setViews, setCurrentViewId]
  );

  // Create or update view
  const createOrUpdateView = useCallback(
    async (filterConfig: FilterConfig, viewId?: number): Promise<GetViewDataResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        const filtersObject = buildWhereClause(filterConfig.filters, filterConfig.globalConnector);

        const sortingArray = filterConfig.sorting;

        const filterConfigToSend = {
          filters: filtersObject,
          sorting: sortingArray,
          columns: filterConfig.columns,
          grouping: filterConfig.grouping,
          viewName: filterConfig.viewName,
          globalConnector: filterConfig.globalConnector,
        };

        const endpoint = viewId ? `${apiEndpoint}/${viewId}` : `${apiEndpoint}`;
        const method: 'post' | 'put' = viewId ? 'put' : 'post';

        const response: GetViewDataResponse = await fetchDataPage(
          endpoint,
          method,
          {
            page,
            pageSize,
          },
          filterConfigToSend
        );

        if (response.success) {
          setData(response.data as T[]);
          setTotalRecords(response.totalRecords);
          setAvailableColumns(transformAvailableColumns(response.availableColumns));
          setViews(response.views);

          // Set currentViewId to trigger data fetching via useEffect
          setCurrentViewId(response.viewId.id);

          // Transform appliedFilters into ExtendedFilterCondition[]
          const filtersArray: ExtendedFilterCondition[] = response.appliedFilters
            ? Object.values(response.appliedFilters).map((filter: any) => {
                return {
                  id: filter.id || '',
                  connector: filter.connector || 'AND',
                  column: filter.column || '',
                  operator: filter.operator || '',
                  value: filter.value || '',
                } as ExtendedFilterCondition;
              })
            : [];

          // Construct initialFilterConfig based on the updated view
          const initialConfig: FilterConfig = {
            viewName: response.viewId.viewName,
            columns: response.viewId.columns,
            filters: filtersArray,
            globalConnector: 'AND', // Default to 'AND'
            sorting: response.appliedSorting || [],
            grouping: response.appliedGrouping || [],
          };
          setInitialFilterConfig(initialConfig);
          setCurrentFilterConfig(initialConfig);
          return response;
        } else {
          setError('Failed to create/update view');
          return null;
        }
      } catch (err: any) {
        console.error('Error creating/updating view:', err);
        setError(err.response?.data?.message || 'An error occurred while creating/updating the view');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiEndpoint, page, pageSize, buildWhereClause]
  );

  // Check if current view is default
  const isDefaultView = useCallback((): boolean => {
    const defaultView = views.find((v) => v.viewName === 'grid');
    return currentViewId === defaultView?.id || currentViewId === null;
  }, [currentViewId, views]);

  // Handle save view
  const handleSaveView = useCallback(async () => {
    if (!currentFilterConfig) {
      return;
    }
    const randomIndex: number = Math.floor(Math.random() * 500);

    if (isDefaultView()) {
      const filterConfig: FilterConfig = {
        ...currentFilterConfig,
        viewName:
          currentFilterConfig.viewName === 'grid'
            ? cartoonCharacters[randomIndex]
            : currentFilterConfig.viewName,
      };
      await createOrUpdateView(filterConfig);
      // Do not setCurrentFilterConfig(filterConfig) here
    } else {
      await createOrUpdateView(currentFilterConfig, currentViewId || undefined);
    }
    // Rely on createOrUpdateView to update currentFilterConfig
  }, [currentFilterConfig, isDefaultView, createOrUpdateView, currentViewId]);

  // Handle page change
  const handlePageChange = useCallback(
    async (newPage?: number, newPageSize?: number) => {
      if (newPageSize && newPageSize !== pageSize) {
        setPage(1);
        setPageSize(newPageSize);
      } else if (newPage) {
        setPage(newPage);
      }

      await fetchData();
    },
    [pageSize, setPage, setPageSize, fetchData]
  );

  // Initial data load
  useEffect(() => {
    const initializeView = async () => {
      if (isInitialLoad) {
        const storedViewId = window.localStorage.getItem(`${resource}-view-id`);

        if (storedViewId) {
          const parsedViewId = parseInt(storedViewId, 10);
          if (!isNaN(parsedViewId)) {
            setCurrentViewId(parsedViewId);
          } else {
            setCurrentViewId(null);
          }
        } else {
          setCurrentViewId(null);
        }
        setIsInitialLoad(false);
      }
    };

    initializeView();
  }, [isInitialLoad, resource, setCurrentViewId, setIsInitialLoad]);

  // Update localStorage when currentViewId changes
  useEffect(() => {
    if (!isInitialLoad && currentViewId !== null) {
      window.localStorage.setItem(`${resource}-view-id`, currentViewId.toString());
    }
  }, [currentViewId, isInitialLoad, resource]);

  return {
    data,
    totalRecords,
    availableColumns,
    loading,
    error,
    currentViewId,
    views,
    initialFilterConfig,
    page,
    pageSize,
    isModified,
    currentFilterConfig,
    isInitialLoad,
    handleSelectView,
    handleDeleteView,
    handleSaveView,
    isDefaultView,
    handlePageChange,
  };
}
