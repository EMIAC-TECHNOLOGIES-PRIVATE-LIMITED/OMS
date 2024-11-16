import { useState, useEffect, useCallback, useRef } from 'react';
import {
    FilterConfig,
    FrontendAvailableColumns,
    GetViewDataResponse,
    View,
} from '../types';
import { transformAvailableColumns, fetchDataPage, cartoonCharacters } from '../utils';

interface UseDataPageProps<T> {
    apiEndpoint: string;
    resource: string;
    initialPageSize?: number;
}

export function useDataPage<T extends object>({
    apiEndpoint,
    resource,
    initialPageSize = 25,
}: UseDataPageProps<T>) {
    const [data, setData] = useState<T[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [availableColumns, setAvailableColumns] = useState<FrontendAvailableColumns>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentViewId, setCurrentViewId] = useState<number | null>(() => {
        const storedViewId = window.localStorage.getItem(`${resource}-view-id`);
        return storedViewId ? parseInt(storedViewId, 10) : null;
    });
    const [views, setViews] = useState<View[]>([]);
    const [initialFilterConfig, setInitialFilterConfig] = useState<FilterConfig | undefined>(
        undefined
    );
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(initialPageSize);
    const [isModified, setIsModified] = useState<boolean>(false);
    const [currentFilterConfig, setCurrentFilterConfig] = useState<FilterConfig | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const skipFilterUpdate = useRef(false);

    // Function to fetch view data
    const fetchViewData = useCallback(
        async (viewId?: number, isInitial: boolean = false) => {
            setLoading(true);
            setError(null);
            try {
                const endpoint = viewId ? `${apiEndpoint}/${viewId}` : `${apiEndpoint}`;
                console.log(`Fetching view data for viewId: ${viewId}`);

                const response = await fetchDataPage(
                    endpoint,
                    'get',
                    {
                        page,
                        pageSize,
                    }
                );

                if (response.success) {
                    setData(response.data as T[]);
                    setTotalRecords(response.totalRecords);
                    setAvailableColumns(transformAvailableColumns(response.availableColumns));
                    setViews(response.views);

                    // Handle view selection
                    const selectedView = viewId
                        ? response.views.find((v) => v.id === viewId)
                        : response.views.find((v) => v.viewName === 'grid');

                    if (selectedView) {
                        setCurrentViewId(selectedView.id);
                        if (!isInitial) {
                            window.localStorage.setItem(`${resource}-view-id`, selectedView.id.toString());
                        }
                    } else {
                        const defaultView = response.views.find((v) => v.viewName === 'grid');
                        if (defaultView) {
                            setCurrentViewId(defaultView.id);
                            window.localStorage.setItem(`${resource}-view-id`, defaultView.id.toString());
                        }
                    }

                    // Construct initialFilterConfig based on the selected view
                    const initialConfig: FilterConfig = {
                        viewName: selectedView?.viewName || 'Untitled View',
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
                    setError('Failed to fetch view data');
                }
            } catch (error: any) {
                console.error('Error fetching view data:', error);
                setError(
                    error.response?.data.message || 'An error occurred while fetching view data'
                );
            } finally {
                setLoading(false);
            }
        },
        [apiEndpoint, page, pageSize, resource]
    );

    // Fetch data with filter config
    const fetchDataWithFilterConfig = useCallback(
        async (filterConfig: FilterConfig) => {
            console.log('Fetching data with filter config');
            console.log(`Filter config being sent:`, filterConfig);
            setLoading(true);
            setError(null);
            try {
                const response = await fetchDataPage(
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
                    // setAvailableColumns(transformAvailableColumns(response.availableColumns));
                } else {
                    setError('Failed to fetch data');
                }
            } catch (error: any) {
                console.error('Error fetching data:', error);
                setError(
                    error.response?.data.message || 'An error occurred while fetching data'
                );
            } finally {
                setLoading(false);
            }
        },
        [apiEndpoint, page, pageSize]
    );

    // Handle view selection
    const handleSelectView = async (viewId: number) => {
        console.log('Selecting view:', viewId);
        setCurrentViewId(viewId);
        await fetchViewData(viewId);
    };

    // Create or update view
    const createOrUpdateView = useCallback(
        async (
            filterConfig: FilterConfig,
            viewId?: number
        ): Promise<GetViewDataResponse | null> => {
            setLoading(true);
            setError(null);
            console.log('Create or update view function called');
            console.log(`Filter config sent to backend:`, filterConfig);
            try {
                const endpoint = viewId ? `${apiEndpoint}/${viewId}` : `${apiEndpoint}`;
                const method: 'post' | 'put' = viewId ? 'put' : 'post';

                const response = await fetchDataPage(
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

                    handleSelectView(response.viewId.id);

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
            } catch (error: any) {
                console.error('Error creating/updating view:', error);
                setError(
                    error.response?.data.message ||
                    'An error occurred while creating/updating the view'
                );
                return null;
            } finally {
                setLoading(false);
            }
        },
        [apiEndpoint, handleSelectView, page, pageSize]
    );

    // Handle page change
    const handlePageChange = (newPage?: number, newPageSize?: number) => {
        if (newPageSize && newPageSize !== pageSize) {
            setPage(1);
            setPageSize(newPageSize);
        } else if (newPage) {
            setPage(newPage);
        }
        if (currentFilterConfig) {
            // console.log("############ current filter config called ##########")
            fetchDataWithFilterConfig(currentFilterConfig);
        } else if (currentViewId) {
            fetchViewData(currentViewId);
            // console.log("############ current view id  called ##########")
        } else {
            // console.log("############ default view called ##########")
            fetchViewData();
        }
    };

    // Handle delete view
    const handleDeleteView = (deletedViewId: number) => {
        setViews((prevViews) => prevViews.filter((view) => view.id !== deletedViewId));
        if (currentViewId === deletedViewId) {
            const defaultView = views.find((v) => v.viewName === 'grid');
            setCurrentViewId(defaultView?.id || null);
            if (defaultView) {
                fetchViewData(defaultView.id);
            } else {
                fetchViewData();
            }
        }
    };

    // Handle filter changes
    const handleFilterChange = useCallback(
        async (filterConfig: FilterConfig) => {
            const isConfigEqual =
                JSON.stringify(filterConfig) === JSON.stringify(currentFilterConfig);
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
    const handleSaveView = async () => {
        if (!currentFilterConfig) {
            return;
        }
        const randomIndex: number = Math.floor(Math.random() * 500);

        if (isDefaultView()) {
            const filterConfig = {
                ...currentFilterConfig,
                viewName:
                    currentFilterConfig.viewName === 'grid'
                        ? cartoonCharacters[randomIndex]
                        : currentFilterConfig.viewName,
            };
            await createOrUpdateView(filterConfig);
            setCurrentFilterConfig(filterConfig);
            console.log('New view created');
        } else {
            await createOrUpdateView(currentFilterConfig, currentViewId || undefined);
        }
        setIsModified(false);
    };

    // Initial data load
    useEffect(() => {
        const initializeView = async () => {
            if (isInitialLoad) {
                const storedViewId = window.localStorage.getItem(`${resource}-view-id`);
                console.log('Initial load - stored view ID:', storedViewId);

                if (storedViewId) {
                    const parsedViewId = parseInt(storedViewId, 10);
                    if (!isNaN(parsedViewId)) {
                        skipFilterUpdate.current = true;
                        await fetchViewData(parsedViewId, true);
                    } else {
                        skipFilterUpdate.current = true;
                        await fetchViewData(undefined, true);
                    }
                } else {
                    skipFilterUpdate.current = true;
                    await fetchViewData(undefined, true);
                }
                setIsInitialLoad(false);
            }
        };

        initializeView();
    }, [fetchViewData, isInitialLoad, resource]);

    // Update localStorage when currentViewId changes
    useEffect(() => {
        if (!isInitialLoad && currentViewId !== null) {
            console.log('Updating localStorage with viewId:', currentViewId);
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
        setIsInitialLoad,
        handleSelectView,
        handleDeleteView,
        handleSaveView,
        handleFilterChange,
        isDefaultView,
        handlePageChange,
    };
}
