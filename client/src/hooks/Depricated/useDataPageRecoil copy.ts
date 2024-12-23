import { useRecoilState } from 'recoil';
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
import { fetchDataPage, transformAvailableColumns, cartoonCharacters } from '../utils';
import { useEffect, useCallback } from 'react';
import { FilterConfig, GetViewDataResponse, FrontendAvailableColumns, View } from '../types';

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
  handleSelectView: (viewId: number) => Promise<void>;
  handleDeleteView: (deletedViewId: number) => Promise<void>;
  handleSaveView: () => Promise<void>;
  handleFilterChange: (filterConfig: FilterConfig) => Promise<void>;
  isDefaultView: () => boolean;
  handlePageChange: (newPage?: number, newPageSize?: number) => Promise<void>;
}

export function useDataPageRecoil<T extends object>({
  apiEndpoint,
  resource,
  initialPageSize = 25,
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
  const [isModified, setIsModified] = useRecoilState<boolean>(isModifiedState(resourceKey));
  const [currentFilterConfig, setCurrentFilterConfig] = useRecoilState<FilterConfig | null>(
    currentFilterConfigState(resourceKey)
  );
  const [isInitialLoad, setIsInitialLoad] = useRecoilState<boolean>(isInitialLoadState(resourceKey));

  // Function to fetch view data
  const fetchViewData = useCallback(
    async (viewId?: number, isInitial: boolean = false) => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = viewId ? `${apiEndpoint}/${viewId}` : `${apiEndpoint}`;

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
          let selectedView: View | undefined = response.views.find((v) => v.id === response.viewId.id);

          if (selectedView) {
            if (!isInitial) {
              window.localStorage.setItem(`${resource}-view-id`, selectedView.id.toString());
            }

            // Construct initialFilterConfig based on the selected view
            const initialConfig: FilterConfig = {
              viewName: selectedView.viewName,
              columns: response.viewId.columns,
              filters: response.appliedFilters,
              sorting: response.appliedSorting,
              grouping: response.appliedGrouping,
            };
            setInitialFilterConfig(initialConfig);

            if (!currentFilterConfig || isInitial) {
              setCurrentFilterConfig(initialConfig);
            }

            setIsModified(false);
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
    [apiEndpoint, page, pageSize, resource]
  );

  // Function to fetch data with filter config
  const fetchDataWithFilterConfig = useCallback(
    async (filterConfig: FilterConfig) => {
      setLoading(true);
      setError(null);
      try {
        const response: GetViewDataResponse = await fetchDataPage(
          `${apiEndpoint}/data`,
          'post',
          {
            page,
            pageSize,
          },
          filterConfig
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
    [apiEndpoint, page, pageSize]
  );

  // Handle view selection
  const handleSelectView = useCallback(
    async (viewId: number) => {
      console.log('handle select View funciton called');
      await fetchViewData(viewId);
    },
    [currentViewId]
  );

   useEffect(() => {
     if (currentViewId !== null) {
       console.log('currentViewId changed, fetching data...');
       fetchViewData(currentViewId);
     } else {
       fetchViewData();
     }
   }, [currentViewId, fetchViewData]);
  

  // Create or update view
  const createOrUpdateView = useCallback(
    async (filterConfig: FilterConfig, viewId?: number): Promise<GetViewDataResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = viewId ? `${apiEndpoint}/${viewId}` : `${apiEndpoint}`;
        const method: 'post' | 'put' = viewId ? 'put' : 'post';

        const response: GetViewDataResponse = await fetchDataPage(
          endpoint,
          method,
          {
            page,
            pageSize,
          },
          filterConfig
        );

        if (response.success) {
          setData(response.data as T[]);
          setTotalRecords(response.totalRecords);
          setAvailableColumns(transformAvailableColumns(response.availableColumns));
          setViews(response.views);

          setCurrentViewId(response.viewId.id);

          // Construct initialFilterConfig based on the updated view
          const initialConfig: FilterConfig = {
            viewName: response.viewId.viewName,
            columns: Object.keys(response.availableColumns),
            filters: response.appliedFilters,
            sorting: response.appliedSorting,
            grouping: response.appliedGrouping,
          };
          setInitialFilterConfig(initialConfig);
          setCurrentFilterConfig(initialConfig);
          setIsModified(false);
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
    [apiEndpoint, page, pageSize]
  );

  // Handle page change
  const handlePageChange = useCallback(
    async (newPage?: number, newPageSize?: number) => {
      if (newPageSize && newPageSize !== pageSize) {
        setPage(1);
        setPageSize(newPageSize);
      } else if (newPage) {
        setPage(newPage);
      }

      if (currentFilterConfig) {
        await fetchDataWithFilterConfig(currentFilterConfig);
      } else if (currentViewId) {
        await fetchViewData(currentViewId);
      } else {
        await fetchViewData();
      }
    },
    [pageSize, setPage, setPageSize, currentFilterConfig, currentViewId, fetchDataWithFilterConfig, fetchViewData]
  );

  // Handle delete view
  const handleDeleteView = useCallback(
    async (deletedViewId: number) => {
      setViews((prevViews) => {
        const updatedViews = prevViews.filter((view) => view.id !== deletedViewId);

        // Check if the deleted view is the current view
        setCurrentViewId((prevCurrentViewId) => {
          if (prevCurrentViewId === deletedViewId) {
            const defaultView = updatedViews.find((v) => v.viewName === 'grid');
            if (defaultView) {
              fetchViewData(defaultView.id);
              return defaultView.id;
            } else {
              fetchViewData();
              return null;
            }
          }
          return prevCurrentViewId;
        });

        return updatedViews;
      });
    },
    [fetchViewData, setViews, setCurrentViewId]
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    async (filterConfig: FilterConfig) => {
      const isConfigEqual = JSON.stringify(filterConfig) === JSON.stringify(currentFilterConfig);
      if (!isConfigEqual) {
        await fetchDataWithFilterConfig(filterConfig);
        setCurrentFilterConfig(filterConfig);
        setIsModified(true);
      }
    },
    [currentFilterConfig, fetchDataWithFilterConfig]
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
      setCurrentFilterConfig(filterConfig);
    } else {
      await createOrUpdateView(currentFilterConfig, currentViewId || undefined);
    }
    setIsModified(false);
  }, [currentFilterConfig, isDefaultView, createOrUpdateView, currentViewId, setCurrentFilterConfig, setIsModified]);

  // Initial data load
  useEffect(() => {
    const initializeView = async () => {
      if (isInitialLoad) {
        const storedViewId = window.localStorage.getItem(`${resource}-view-id`);

        if (storedViewId) {
          const parsedViewId = parseInt(storedViewId, 10);
          if (!isNaN(parsedViewId)) {
            await fetchViewData(parsedViewId, true);
          } else {
            await fetchViewData(undefined, true);
          }
        } else {
          await fetchViewData(undefined, true);
        }
        setIsInitialLoad(false);
      }
    };

    initializeView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchViewData, isInitialLoad, resource]);

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
    handleFilterChange,
    isDefaultView,
    handlePageChange,
  };
}
