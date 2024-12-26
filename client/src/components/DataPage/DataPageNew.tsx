import React, { useCallback, useEffect, useState } from "react";
import {
    getViewData,
    getFilteredData,
    createView,
    updateView,
    deleteView,
} from "../../utils/apiService/dataAPI";
import {
    GetViewDataResponse,
    GetFilteredDataRequest,
    GetFilteredDataResponse,
    CreateViewResponse,
    UpdateViewResponse,
    DeleteViewResponse,
    FilterConfig,
    View
} from "../../../../shared/src/types";
import FilterComponentNew from "../FilterComponent/FilterComponentNew";
import DataTableNew from "../DataTable/DataTableNew";
import ViewSidebarNew from "../ViewSidebar/ViewSidebarNew";

interface DataPageNewProps {
    apiEndpoint: string;
    resource: string;
    pageTitle: string;
}

const DataPageNew: React.FC<DataPageNewProps> = ({
    apiEndpoint,
    resource,
    pageTitle,
}) => {
    // Local State Variables
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentViewId, setCurrentViewId] = useState<number | null>(null);
    const [tableData, setTableData] = useState<Array<{ [key: string]: any }>>(
        []
    );
    const [views, setViews] = useState<Array<{ id: number; viewName: string }>>(
        []
    );
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(25);
    const [initialFilterConfig, setInitialFilterConfig] = useState<FilterConfig>({
        appliedFilters: {},
        appliedSorting: [],
    });
    const [currentFilterConfig, setCurrentFilterConfig] = useState<FilterConfig>({
        appliedFilters: {},
        appliedSorting: [],
    });
    const [currentViewName, setCurrentViewName] = useState<string>("");
    const [initialViewName, setInitialViewName] = useState<string>("");
    const [availableColumns, setAvailableColumns] = useState<{
        [key: string]: string;
    }>({});
    const [isModified, setIsModified] = useState<boolean>(false);

    // Check if filters have been modified
    useEffect(() => {
        const modified =
            JSON.stringify(initialFilterConfig) !== JSON.stringify(currentFilterConfig) || initialViewName !== currentViewName;
        setIsModified(modified);
    }, [initialFilterConfig, currentFilterConfig]);

    // Load the currentViewId from localStorage on component mount
    useEffect(() => {
        const storedViewId = window.localStorage.getItem(`${resource}-viewId`);
        if (storedViewId) {
            setCurrentViewId(parseInt(storedViewId, 10));
        } else {
            setCurrentViewId(null);
        }
    }, [resource]);

    // Fetch view data whenever currentViewId changes
    useEffect(() => {
        const fetchView = async () => {
            setLoading(true);
            setError(null);
            try {
                const response: GetViewDataResponse = currentViewId ? await getViewData(resource, currentViewId) : await getViewData(resource);

                if (response.success) {
                    const data = response.data;
                    setTableData(data.data);
                    setViews(data.views);
                    setTotalRecords(data.totalRecords);
                    setPage(data.page);
                    setPageSize(data.pageSize);
                    setAvailableColumns(data.availableColumnsType);
                    setInitialFilterConfig({
                        appliedFilters: data.appliedFilters,
                        appliedSorting: data.appliedSorting,
                    });
                    setCurrentFilterConfig({
                        appliedFilters: data.appliedFilters,
                        appliedSorting: data.appliedSorting,
                    });
                    setCurrentViewName(data.viewName);
                    setInitialViewName(data.viewName);
                } else {
                    setError("Failed to fetch view data.");
                }
            } catch (err: any) {
                console.error("Error fetching view data:", err);
                setError(
                    err.response?.data?.message ||
                    "An error occurred while fetching view data."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchView();
    }, [currentViewId, resource]);

    // Fetch filtered data whenever filters, pagination, or sorting changes
    useEffect(() => {
        const fetchFilteredData = async () => {
            setLoading(true);
            setError(null);
            try {
                const requestPayload: GetFilteredDataRequest = {
                    columns: Object.keys(availableColumns),
                    filters: currentFilterConfig.appliedFilters,
                    sorting: currentFilterConfig.appliedSorting,
                };

                const response: GetFilteredDataResponse = await getFilteredData(
                    resource,
                    requestPayload.columns,
                    requestPayload.filters,
                    requestPayload.sorting
                );

                if (response.success) {
                    const data = response.data;
                    setTableData(data.data);
                    setTotalRecords(data.totalRecords);
                    // Assuming availableColumns might remain the same
                } else {
                    setError("Failed to fetch filtered data.");
                }
            } catch (err: any) {
                console.error("Error fetching filtered data:", err);
                setError(
                    err.response?.data?.message ||
                    "An error occurred while fetching filtered data."
                );
            } finally {
                setLoading(false);
            }
        };

        if (currentFilterConfig) {
            fetchFilteredData();
        }
    }, [
        currentFilterConfig,
        page,
        pageSize,
        availableColumns,
        resource,
        apiEndpoint,
    ]);

    // Handle view change and persist it to localStorage
    const handleViewChange = useCallback(
        (viewId: number) => {
            setCurrentViewId(viewId);
            window.localStorage.setItem(`${resource}-viewId`, viewId.toString());
        },
        [resource]
    );

    // Handle saving the current view
    const handleSaveView = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let response: CreateViewResponse | UpdateViewResponse;

            if (currentViewId) {
                // Update existing view
                response = await updateView(
                    resource,
                    currentViewId,
                    "Updated View", // Replace with dynamic view name if needed
                    Object.keys(availableColumns),
                    currentFilterConfig.appliedFilters,
                    currentFilterConfig.appliedSorting
                );
            } else {
                // Create new view
                response = await createView(
                    resource,
                    "New View", // Replace with dynamic view name if needed
                    Object.keys(availableColumns),
                    currentFilterConfig.appliedFilters,
                    currentFilterConfig.appliedSorting
                );
            }

            if (response.success) {
                // Refresh views
                const updatedViewsResponse = await getViewData(resource, response.data.id);
                if (updatedViewsResponse.success) {
                    setViews(updatedViewsResponse.data.views);
                    setCurrentViewId(response.data.id);
                    window.localStorage.setItem(
                        `${resource}-viewId`,
                        response.data.id.toString()
                    );
                    setInitialFilterConfig(currentFilterConfig);
                    setInitialViewName(updatedViewsResponse.data.viewName);
                    setIsModified(false);
                } else {
                    setError("Failed to refresh views after saving.");
                }
            } else {
                setError("Failed to save the view.");
            }
        } catch (err: any) {
            console.error("Error saving view:", err);
            setError(
                err.response?.data?.message || "An error occurred while saving the view."
            );
        } finally {
            setLoading(false);
        }
    }, [
        resource,
        currentViewId,
        availableColumns,
        currentFilterConfig,
        getViewData,
    ]);

    // Handle deleting a view
    const handleDeleteView = useCallback(
        async (viewToDelete: View) => {
            setLoading(true);
            setError(null);
            try {
                const response: DeleteViewResponse = await deleteView(
                    resource,
                    viewToDelete.id
                );

                if (response.success) {
                    // Refresh views
                    const updatedViewsResponse = await getViewData(resource);
                    if (updatedViewsResponse.success) {
                        setViews(updatedViewsResponse.data.views);
                        if (currentViewId === viewToDelete.id) {
                            setCurrentViewId(null);
                            window.localStorage.removeItem(`${resource}-viewId`);
                        }
                    } else {
                        setError("Failed to refresh views after deletion.");
                    }
                } else {
                    setError("Failed to delete the view.");
                }
            } catch (err: any) {
                console.error("Error deleting view:", err);
                setError(
                    err.response?.data?.message || "An error occurred while deleting the view."
                );
            } finally {
                setLoading(false);
            }
        },
        [resource, currentViewId, getViewData]
    );

    // Handle filter changes
    const handleFilterChange = useCallback((newFilterConfig: FilterConfig) => {
        setCurrentFilterConfig(newFilterConfig);
    }, []);

    // Handle pagination changes
    const handlePageChange = useCallback(
        (newPage: number, newPageSize: number) => {
            setPage(newPage);
            setPageSize(newPageSize);
        },
        []
    );

    return (
        <>
            <FilterComponentNew
                resource={resource}
                pageTitle={pageTitle}
                filterConfig={currentFilterConfig}
                onFilterChange={handleFilterChange}
                page={page}
                pageSize={pageSize}
                totalPages={Math.ceil(totalRecords / pageSize)}
                setPage={handlePageChange}
                currentViewName={currentViewName}
                setCurrentViewName={setCurrentViewName}
                availableColumnsTypes={availableColumns}
            />
            <div className="flex h-screen bg-neutral-50">
                {/* Sidebar */}
                <div className="py-2 px-4">
                    <ViewSidebarNew
                        views={views}
                        resource={resource}
                        currentViewId={currentViewId}
                        onSelectView={handleViewChange}
                        onDeleteView={handleDeleteView}
                    />
                </div>
                {/* Main Content */}
                <div className="flex-1 flex flex-col py-4 px-4 overflow-auto relative">
                    {/* Data Grid Container */}
                    <div className="relative flex-1 mt-2 rounded-lg shadow-premium overflow-hidden w-full h-full bg-white">
                        {/* DataTable */}
                        <DataTableNew
                            data={tableData}
                            loading={loading}
                            error={error}
                        />

                        {/* Watermark Image */}
                        <img
                            src="./image.png"
                            alt="Watermark"
                            className="absolute inset-0 w-full h-full object-cover opacity-5 pointer-events-none"
                        />

                        {/* Save View Button */}
                        {isModified && (
                            <button
                                type="button"
                                onClick={handleSaveView}
                                className="absolute bottom-12 right-6 bg-brand text-white font-semibold py-2 px-4 rounded-md shadow-premium hover:bg-brand-light transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-dark z-20"
                            >
                                Save View
                            </button>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="absolute top-4 left-4 bg-red-100 text-red-700 px-4 py-2 rounded-md shadow-lg z-20">
                                {error}
                            </div>
                        )}

                        {/* Fetched Records Indicator */}
                        <div className="absolute top-3 right-5 bg-neutral-200 text-neutral-800 px-4 py-1 rounded-md shadow-lg z-10 ">
                            Fetched {totalRecords} records.
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DataPageNew;
