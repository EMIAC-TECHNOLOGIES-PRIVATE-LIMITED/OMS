  import { useEffect, useState, useCallback } from 'react';
  import axios from 'axios';
  import { DataTable, ViewSidebar, FilterComponent } from '../';
  import {
    WebsiteData,
    FilterConfig,
    FrontendAvailableColumns,
    GetViewDataResponse,
    View,
    BackendAvailableColumns,
    BackendColumnType,
    SortingOption,
  } from '../../types/index';

  const api: string = import.meta.env.VITE_API_URL;
  const token: string = import.meta.env.VITE_API_TOKEN || 'your-default-token-here';

  const Sites = () => {
    const [data, setData] = useState<WebsiteData[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [availableColumns, setAvailableColumns] = useState<FrontendAvailableColumns>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentViewId, setCurrentViewId] = useState<number | null>(() => {
      // Initialize currentViewId from localStorage on component mount
      const storedViewId = window.localStorage.getItem('sites-view-id');
      return storedViewId ? parseInt(storedViewId, 10) : null;
    });
    const [views, setViews] = useState<View[]>([]);
    const [initialFilterConfig, setInitialFilterConfig] = useState<FilterConfig | undefined>(undefined);
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(25);
    const [isModified, setIsModified] = useState<boolean>(false);
    const [currentFilterConfig, setCurrentFilterConfig] = useState<FilterConfig | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Fn to transfer backend columns types to frontend columns types and add 'label'
    const transformAvailableColumns = (backendColumns: BackendAvailableColumns): FrontendAvailableColumns => {
      const frontendColumns: FrontendAvailableColumns = {};
      for (const [key, type] of Object.entries(backendColumns)) {
        frontendColumns[key] = {
          label: key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          type: type as BackendColumnType,
        };
      }
      return frontendColumns;
    };

    // Fn to fetch view data, default view if no viewId provided
    const fetchViewData = useCallback(async (viewId?: number, isInitial: boolean = false) => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = viewId
          ? `${api}/data/sites/${viewId}`
          : `${api}/data/sites`;

        console.log(`Fetching view data for viewId: ${viewId}`);

        const response = await axios.get<GetViewDataResponse>(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page,
            pageSize,
          },
        });

        if (response.data.success) {
          setData(response.data.data);
          setTotalRecords(response.data.totalRecords);
          setAvailableColumns(transformAvailableColumns(response.data.availableColumns));
          setViews(response.data.views);

          // Handle view selection
          const selectedView = viewId
            ? response.data.views.find((v) => v.id === viewId)
            : response.data.views.find((v) => v.viewName === 'grid');

          if (selectedView) {
            setCurrentViewId(selectedView.id);
            if (isInitial) {
              window.localStorage.setItem('sites-view-id', selectedView.id.toString());
            }
          } else if (isInitial) {
            // Only reset to default view if this is not an initial load
            const defaultView = response.data.views.find((v) => v.viewName === 'grid');
            if (defaultView) {
              setCurrentViewId(defaultView.id);
              window.localStorage.setItem('sites-view-id', defaultView.id.toString());
            }
          }

          // Construct initialFilterConfig based on the selected view
          const initialFilters: Record<string, any> = response.data.appliedFilters;
          const initialSorting: SortingOption[] = response.data.appliedSorting;
          const initialGrouping: string[] = response.data.appliedGrouping;

          const initialConfig: FilterConfig = {
            viewName: selectedView?.viewName || 'Untitled View',
            columns: Object.keys(response.data.availableColumns),
            filters: initialFilters,
            sorting: initialSorting,
            grouping: initialGrouping,
          };

          setInitialFilterConfig(initialConfig);
          setCurrentFilterConfig(initialConfig);
          setIsModified(false);
        } else {
          setError('Failed to fetch view data');
        }
      } catch (error: any) {
        console.error('Error fetching view data:', error);
        setError(
          error.response?.data.message ||
          'An error occurred while fetching view data'
        );
      } finally {
        setLoading(false);
      }
    }, [page, pageSize]);

    // Initial data load
    useEffect(() => {
      const initializeView = async () => {
        if (isInitialLoad) {
          const storedViewId = window.localStorage.getItem('sites-view-id');
          console.log('Initial load - stored view ID:', storedViewId);

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
    }, [fetchViewData, isInitialLoad]);

    // Update localStorage when currentViewId changes
    useEffect(() => {
      if (!isInitialLoad && currentViewId !== null) {
        console.log('Updating localStorage with viewId:', currentViewId);
        window.localStorage.setItem('sites-view-id', currentViewId.toString());
      }
    }, [currentViewId, isInitialLoad]);

    // Handle view selection
    const handleSelectView = async (viewId: number) => {
      console.log('Selecting view:', viewId);
      setCurrentViewId(viewId);
      await fetchViewData(viewId);
    };

    // NEW : Fetch data without creating or updating any view
    const fetchDataWithFilterConfig = useCallback(async (filterConfig: FilterConfig) => {

      console.log('New fetch only data function called')
      console.log(`The iler congfig bein sent are ${filterConfig}`)
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post<GetViewDataResponse>(
          `${api}/data/sites/data`,
          filterConfig,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            params: {
              page,
              pageSize,
            },
          }
        );

        if (response.data.success) {
          setData(response.data.data);
          setTotalRecords(response.data.totalRecords);
          setAvailableColumns(transformAvailableColumns(response.data.availableColumns));
        } else {
          setError('Failed to fetch data');
        }
      } catch (error: any) {
        setError(
          error.response?.data.message || 'An error occurred while fetching data'
        );
      } finally {
        setLoading(false);
      }
    }, [page, pageSize]);


    const createOrUpdateView = useCallback(async (
      filterConfig: FilterConfig,
      viewId?: number
    ): Promise<GetViewDataResponse | null> => {
      setLoading(true);
      setError(null);
      console.log('Create or update function called')
      console.log(`The filter config sent to backend are ${filterConfig}`)
      try {
        const endpoint = viewId
          ? `${api}/data/sites/${viewId}`
          : `${api}/data/sites`;

        const method = viewId ? 'put' : 'post';

        const response = await axios.request<GetViewDataResponse>({
          url: endpoint,
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": 'application/json'
          },
          params: {
            page,
            pageSize
          },
          data: filterConfig
        });

        if (response.data.success) {
          setData(response.data.data);
          setTotalRecords(response.data.totalRecords);
          setAvailableColumns(transformAvailableColumns(response.data.availableColumns));
          setViews(response.data.views);
          const updatedView = viewId
            ? response.data.views.find((v) => v.id === viewId)
            : response.data.views.find((v) => v.viewName === filterConfig.viewName);

          setCurrentViewId(updatedView?.id || null);
          if (updatedView)
            handleSelectView(updatedView.id)

          // Construct initialFilterConfig based on the updated view
          const initialFilters: Record<string, any> = response.data.appliedFilters;
          const initialSorting: SortingOption[] = response.data.appliedSorting;
          const initialGrouping: string[] = response.data.appliedGrouping;

          const initialConfig: FilterConfig = {
            viewName: updatedView?.viewName || 'Untitled View',
            columns: Object.keys(response.data.availableColumns),
            filters: initialFilters,
            sorting: initialSorting,
            grouping: initialGrouping,
          };

          setInitialFilterConfig(initialConfig);
          setCurrentFilterConfig(initialConfig);
          setIsModified(false);
          return response.data;
        } else {
          setError('Failed to create/update view');
          return null;
        }
      } catch (error: any) {
        setError(
          error.response?.data.message ||
          'An error occurred while creating/updating the view'
        );
        console.log(error);
        return null;
      } finally {
        setLoading(false);
      }
    }, [page, pageSize]);

    /**
     * Handler for selecting an existing view from the sidebar.
     */

    const handlePageChange = (newPage?: number, newPageSize?: number) => {
      if (newPageSize && newPageSize !== pageSize) {
        setPage(1);
        setPageSize(newPageSize);
      } else if (newPage) {
        setPage(newPage);
      }
      if (currentFilterConfig) {
        fetchDataWithFilterConfig(currentFilterConfig);
      } else if (currentViewId) {
        fetchViewData(currentViewId);
      } else {
        fetchViewData();
      }
    };

    const handleDeleteView = (deletedViewId: number) => {
      setViews((prevViews) => prevViews.filter((view) => view.id !== deletedViewId));
      if (currentViewId === deletedViewId) {
        const defaultView = views.find((v) => v.viewName === 'Grid View');
        setCurrentViewId(defaultView?.id || null);
        if (defaultView) {
          fetchViewData(defaultView.id);
        } else {
          fetchViewData();
        }
      }
    };

    /**
     * Handler for changes in the filter configuration.
     * Fetches data based on the new configuration and sets the modified state.
     */
    const onFilterChange = useCallback(async (filterConfig: FilterConfig) => {

      const isConfigEqual = JSON.stringify(filterConfig) === JSON.stringify(currentFilterConfig);
      if (!isConfigEqual) {
        await fetchDataWithFilterConfig(filterConfig);
        setCurrentFilterConfig(filterConfig);
        setIsModified(true);
      }
    }, [currentFilterConfig, fetchDataWithFilterConfig]);


    const isDefaultView = useCallback((): boolean => {
      const defaultView = views.find((v) => v.viewName === 'grid');
      return currentViewId === defaultView?.id || currentViewId === null;
    }, [currentViewId, views]);


    const handleSaveView = async () => {
      if (!currentFilterConfig) {
        return;
      }

      if (isDefaultView()) {
        const filterConfig = {
          ...currentFilterConfig,
          viewName: currentFilterConfig.viewName === 'grid' ? 'Untiteled View' : currentFilterConfig.viewName
        };
        await createOrUpdateView(filterConfig);
        console.log('new view created');
      } else {
        await createOrUpdateView(currentFilterConfig, currentViewId || undefined);
      }
      setIsModified(false);
    };

    return (
      <div className="flex h-screen">
        {/* Sidebar */}
        <ViewSidebar
          views={views}
          resource="sites"
          currentViewId={currentViewId}
          onSelectView={handleSelectView}
          onDeleteView={handleDeleteView}
        />


        <div className="flex-1 p-4 overflow-auto">
          <h2 className="text-2xl font-bold mb-4">Sites</h2>
          {availableColumns && initialFilterConfig && (
            <FilterComponent
              availableColumns={availableColumns}
              onFilterChange={onFilterChange}
              initialFilterConfig={initialFilterConfig} // Pass the initialFilterConfig
              page={page}
              pageSize={pageSize}
              totalRecords={totalRecords}
              onPageChange={handlePageChange}
            />
          )}
          {/* Save View Button */}
          {isModified && (
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={handleSaveView}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {isDefaultView() ? 'Save View' : 'Save'}
              </button>
            </div>
          )}
          <DataTable
            data={data}
            availableColumns={availableColumns}
            loading={loading}
            error={error}
            totalRecords={totalRecords}
          />
          {error && <div className="text-red-500 mt-4">{error}</div>}
        </div>
      </div>
    );
  };

  export default Sites;
