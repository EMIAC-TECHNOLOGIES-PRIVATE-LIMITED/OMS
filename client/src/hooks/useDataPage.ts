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
  currentViewNameState,
  innitialViewNameState,
} from '../store/atoms/atoms';
import {
  fetchDataPage,
  transformAvailableColumns,
  cartoonCharacters,
  mapBackendToFrontendType,
} from '../utils';
import { useEffect, useCallback, useRef } from 'react';
import {
  FilterConfig,
  GetViewDataResponse,
  FrontendAvailableColumns,
  View,
  ExtendedFilterCondition,
} from '../types';

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
  handleDeleteView: (deletedViewId: number) => void;
  handleSaveView: () => Promise<void>;
  handlePageChange: (newPage?: number, newPageSize?: number) => Promise<void>;
  isDefaultView: () => boolean;
}

const transformAppliedFilters = (appliedFilters: any): ExtendedFilterCondition[] => {
  const filtersArray: ExtendedFilterCondition[] = [];

  if (appliedFilters) {
    // Iterate over each connector (e.g., AND, OR)
    for (const connector in appliedFilters) {
      if (appliedFilters.hasOwnProperty(connector)) {
        const conditions = appliedFilters[connector];

        conditions.forEach((condition: any) => {
          // Each condition is an object with a single key-value pair
          const column = Object.keys(condition)[0];
          const operatorObj = condition[column];

          // Extract operator and value
          const operator = Object.keys(operatorObj)[0];
          const value = operatorObj[operator];

          // Push the transformed filter condition
          filtersArray.push({
            id: '', // Assuming no ID is provided; adjust if necessary
            connector: connector, // e.g., 'AND'
            column: column,       // e.g., 'website'
            operator: operator,   // e.g., 'contains'
            value: value,         // e.g., 'xyz'
          } as ExtendedFilterCondition);
        });
      }
    }
  }

  return filtersArray;
};

export function useDataPage<T extends object>({
  apiEndpoint,
  resource,
}: UseDataPageRecoilProps): UseDataPageRecoilReturn<T> {
  const resourceKey = resource;

  // Global States from recoil
  const [data, setData] = useRecoilState<T[]>(dataState(resourceKey));
  const [totalRecords, setTotalRecords] = useRecoilState(
    totalRecordsState(resourceKey)
  );
  const [availableColumns, setAvailableColumns] = useRecoilState<FrontendAvailableColumns>(
    availableColumnsState(resourceKey)
  );
  const [loading, setLoading] = useRecoilState(loadingState(resourceKey));
  const [error, setError] = useRecoilState<string | null>(errorState(resourceKey));
  const [currentViewId, setCurrentViewId] = useRecoilState<number | null>(
    currentViewIdState(resourceKey)
  );
  const [views, setViews] = useRecoilState<View[]>(viewsState(resourceKey));
  const [initialFilterConfig, setInitialFilterConfig] = useRecoilState<
    FilterConfig | undefined
  >(initialFilterConfigState(resourceKey));
  const [page, setPage] = useRecoilState<number>(pageState(resourceKey));
  const [pageSize, setPageSize] = useRecoilState<number>(pageSizeState(resourceKey));
  const isModified = useRecoilValue<boolean>(isModifiedState(resourceKey));
  const [currentFilterConfig, setCurrentFilterConfig] = useRecoilState<
    FilterConfig | null
  >(currentFilterConfigState(resourceKey));

  const [currentViewName, setCurrentViewName] = useRecoilState(currentViewNameState(resource))
  const [innitialViewName, setInnitialViewName] = useRecoilState(innitialViewNameState(resource))

  const skipNextFetchData = useRef<boolean>(false);

  // Function to convert ExtendedFilterCondition[] to Prisma where clause
  const buildWhereClause = useCallback(
    (filters: ExtendedFilterCondition[], connector: 'AND' | 'OR'): any => {
      if (!filters || filters.length === 0) return {};

      const conditions = filters
        .filter(
          (filter) =>
            filter.column &&
            filter.operator &&
            (filter.value !== '' || ['isNull', 'isNotNull'].includes(filter.operator))
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

  // useEffect to initialize currentViewId from localStorage
  useEffect(() => {
    const storedViewId = window.localStorage.getItem(`${resource}-view-id`);
    if (storedViewId !== null) {
      const parsedViewId = parseInt(storedViewId, 10);
      if (!isNaN(parsedViewId) && parsedViewId > 0) {
        setCurrentViewId(parsedViewId);
      }
    } else {
      setCurrentViewId(0);
    }
    // console.log('useEffect to get currentViewId from local storage called, fetched Value : ', storedViewId , " and the set value for current view id state is :", currentViewId);


  }, [resource]);

  // Function to fetch view data
  const fetchViewData = useCallback(
    async (viewId?: number) => {

      // console.log('fetchViewDataFunction called with viewId : ', viewId);
      setLoading(true);
      setError(null);
      try {

        const endpoint = Boolean(viewId) ? `${apiEndpoint}/${viewId}` : `${apiEndpoint}`;

        const response: GetViewDataResponse = await fetchDataPage(endpoint, 'get', {
          page: 1,
          pageSize: 25,
        });

        if (response.success) {
          setData(response.data as T[]);
          setTotalRecords(response.totalRecords);
          setAvailableColumns(transformAvailableColumns(response.availableColumns));
          setViews(response.views);

          // Transform appliedFilters correctly
          const filtersArray: ExtendedFilterCondition[] = transformAppliedFilters(response.appliedFilters);

          // Construct initialFilterConfig based on the selected view
          const initialConfig: FilterConfig = {
            columns: response.viewId.columns,
            filters: filtersArray,
            globalConnector: 'AND', // Default to 'AND' or derive from response if available  
            sorting: response.appliedSorting || [],
            grouping: response.appliedGrouping || [],
          };

          // Set the skip flag before updating currentFilterConfig
          skipNextFetchData.current = true;

          if (!viewId) {
            setCurrentViewId(response.viewId.id);
            window.localStorage.setItem(`${resource}-view-id`, response.viewId.id.toString());
          }

          setInitialFilterConfig(initialConfig);
          setCurrentFilterConfig(initialConfig);
          setPage(1);
          setPageSize(25);
          setInnitialViewName(response.viewId.viewName);
          setCurrentViewName(response.viewId.viewName);


        } else {
          setError('Failed to fetch view data');
        }
      } catch (e: any) {
        if (e.status = 404) {
          fetchViewData();
          return;
        }

        console.error('Error fetching view data:', e);
        setError(
          e.response?.data?.message || 'An error occurred while fetching view data'
        );
      } finally {
        setLoading(false);
      }
    },
    [
      apiEndpoint,
      setData,
      setTotalRecords,
      setAvailableColumns,
      setViews,
      setInitialFilterConfig,
      setCurrentFilterConfig,
      setError,
      setLoading,
      skipNextFetchData,
      currentViewId,
      resource
    ]
  );

  //  useEffect to fetch view data when currentViewId changes
  useEffect(() => {
    // console.log("inside the useEffect to call the fetch view id with the value received for the currnetViewId is : ", currentViewId)

    if (!currentViewId) return;
    fetchViewData(currentViewId);

  }, [currentViewId, fetchViewData]);

  // Function to fetch data
  const fetchData = useCallback(async () => {

    if (!currentFilterConfig) return;
    setLoading(true);
    setError(null);
    try {
      const filtersObject = buildWhereClause(
        currentFilterConfig.filters,
        currentFilterConfig.globalConnector
      );

      const sortingArray = currentFilterConfig.sorting;

      const filterConfigToSend = {
        filters: filtersObject,
        sorting: sortingArray,
        columns: currentFilterConfig.columns,
        grouping: currentFilterConfig.grouping,
        viewName: currentViewName,
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
      setError(
        err.response?.data?.message || 'An error occurred while fetching data'
      );
    } finally {
      setLoading(false);
    }
  }, [
    apiEndpoint,
    resource,
    currentFilterConfig,
    page,
    pageSize,
    buildWhereClause,
    setData,
    setTotalRecords,
    setError,
    setLoading,
  ]);

  // useEffect to fetch data when currentFilterConfig, page, or pageSize changes
  useEffect(() => {
    if (skipNextFetchData.current) {
      skipNextFetchData.current = false;
      return;
    }
    if (!currentFilterConfig) return;
    fetchData();
  }, [currentFilterConfig, page, pageSize, fetchData]);


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
    async (
      filterConfig: FilterConfig,
      viewId?: number
    ): Promise<GetViewDataResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        const filtersObject = buildWhereClause(
          filterConfig.filters,
          filterConfig.globalConnector
        );

        const sortingArray = filterConfig.sorting;

        let filterConfigToSend = {
          filters: filtersObject,
          sorting: sortingArray,
          columns: filterConfig.columns,
          grouping: filterConfig.grouping,
          viewName: currentViewName,
          globalConnector: filterConfig.globalConnector,
        };

        if (innitialViewName === 'grid') {
          viewId = undefined;
          if (currentViewName === 'grid') {
            const random: number = Math.floor(Math.random() * 500);
            const name = cartoonCharacters[random];
            filterConfigToSend = { ...filterConfigToSend, viewName: name }
          }
        }

        const endpoint = viewId ? `${apiEndpoint}/${viewId}` : `${apiEndpoint}`;
        const method: 'post' | 'put' = viewId ? 'put' : 'post';

        const response: GetViewDataResponse = await fetchDataPage(
          endpoint,
          method,
          {
            page,
            pageSize,
          },
          filterConfigToSend,
        );

        if (response.success) {
          setData(response.data as T[]);
          setTotalRecords(response.totalRecords);
          setAvailableColumns(transformAvailableColumns(response.availableColumns));
          setViews(response.views);

          setCurrentViewId(response.viewId.id);
          window.localStorage.setItem(`${resource}-view-id`, response.viewId.id.toString());

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
            columns: response.viewId.columns,
            filters: filtersArray,
            globalConnector: 'AND', // Default to 'AND'
            sorting: response.appliedSorting || [],
            grouping: response.appliedGrouping || [],
          };
          setInnitialViewName(response.viewId.viewName);

          // Set the skip flag before updating currentFilterConfig
          skipNextFetchData.current = true;

          setInitialFilterConfig(initialConfig);
          setCurrentFilterConfig(initialConfig);



          return response;
        } else {
          setError('Failed to create/update view');
          return null;
        }
      } catch (err: any) {
        console.error('Error creating/updating view:', err);
        setError(
          err.response?.data?.message ||
          'An error occurred while creating/updating the view'
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [
      apiEndpoint,
      page,
      pageSize,
      buildWhereClause,
      setData,
      setTotalRecords,
      setAvailableColumns,
      setViews,
      setCurrentViewId,
      setInitialFilterConfig,
      setCurrentFilterConfig,
      setError,
      setLoading,
      skipNextFetchData,
      currentViewName
    ]
  );

  // Check if current view is default
  const isDefaultView = useCallback((): boolean => {
    return currentViewName === 'grid'
  }, [currentViewName]);

  // Handle save view
  const handleSaveView = useCallback(async () => {
    if (!currentFilterConfig) {
      return;
    }

    await createOrUpdateView(currentFilterConfig, currentViewId ? currentViewId : undefined)

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
    handleDeleteView,
    handleSaveView,
    isDefaultView,
    handlePageChange,
  };
}