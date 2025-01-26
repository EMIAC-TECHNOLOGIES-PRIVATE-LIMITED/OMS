import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  getViewData,
  getFilteredData,
  createView,
  updateView,
  deleteView,
} from "../../utils/apiService/dataAPI";
import {
  GetFilteredDataRequest,
  GetFilteredDataResponse,
  DeleteViewResponse,
  FilterConfig,
  View,
} from "../../../../shared/src/types";
import FilterComponentNew from "../FilterComponent/FilterComponentNew";
import DataTableNew from "../DataTable/DataTable";
import ViewSidebarNew from "../ViewSidebar/ViewSidebarNew";
import { getRandomCartoonName } from "../../utils/cartoons";
import handleApiError from "../../utils/ErrorHandlers/APIError";

interface DataPageNewProps {
  apiEndpoint: string;
  resource: string;
  pageTitle: string;
}

const DataPageNew: React.FC<DataPageNewProps> = ({
  resource,
  pageTitle,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [innitalLoading, setInitialLoading] = useState<boolean>(true);
  const [currentViewId, setCurrentViewId] = useState<number | null>(null);
  const [tableData, setTableData] = useState<Array<{ [key: string]: any }>>([]);
  const [views, setViews] = useState<Array<{ id: number; viewName: string }>>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const [initialPage, setInitialPage] = useState<number>(1);
  const [initialPageSize, setInitialPageSize] = useState<number>(25);

  const [initialFilterConfig, setInitialFilterConfig] = useState<FilterConfig>({
    columns: [],
    appliedFilters: {},
    appliedSorting: [],
  });
  const [currentFilterConfig, setCurrentFilterConfig] = useState<FilterConfig>({
    columns: [],
    appliedFilters: {},
    appliedSorting: [],
  });
  const [currentViewName, setCurrentViewName] = useState<string>("");
  const [initialViewName, setInitialViewName] = useState<string>("");
  const [availableColumns, setAvailableColumns] = useState<{
    [key: string]: string;
  }>({});
  const [isModified, setIsModified] = useState<boolean>(false);

  const hasFetchedInitialData = useRef<boolean>(false);

  const fetchViewData = useCallback(
    async (viewId: number | null) => {
      if (viewId === currentViewId && hasFetchedInitialData.current) {
        return;
      }
      setLoading(true);
      setError(null);

      let retryAttempted = false;

      try {
        const response = viewId
          ? await getViewData(resource, viewId)
          : await getViewData(resource);

        if (response.success) {
          const data = response.data;

          if (data.viewId !== currentViewId) {
            setCurrentViewId(data.viewId);
            window.localStorage.setItem(
              `${resource}-viewId`,
              data.viewId.toString()
            );
          }

          setTableData(data.data);
          setViews(data.views);
          setTotalRecords(data.totalRecords);
          setPage(data.page);
          setPageSize(data.pageSize);
          setInitialPage(data.page);
          setInitialPageSize(data.pageSize);

          setAvailableColumns(data.availableColumnsType);

          setInitialFilterConfig({
            columns: Object.keys(data.column),
            appliedFilters: data.appliedFilters,
            appliedSorting: data.appliedSorting,
          });
          setCurrentFilterConfig({
            columns: Object.keys(data.column),
            appliedFilters: data.appliedFilters,
            appliedSorting: data.appliedSorting,
          });
          setCurrentViewName(data.viewName);
          setInitialViewName(data.viewName);
        }
      } catch (err: any) {
        if (!retryAttempted) {
          retryAttempted = true;
          try {
            const retryResponse = await getViewData(resource);
            if (retryResponse.success) {
              const data = retryResponse.data;

              if (data.viewId !== currentViewId) {
                setCurrentViewId(data.viewId);
                window.localStorage.setItem(
                  `${resource}-viewId`,
                  data.viewId.toString()
                );
              }

              setTableData(data.data);
              setViews(data.views);
              setTotalRecords(data.totalRecords);
              setPage(data.page);
              setPageSize(data.pageSize);
              setInitialPage(data.page);
              setInitialPageSize(data.pageSize);

              setAvailableColumns(data.availableColumnsType);

              setInitialFilterConfig({
                columns: Object.keys(data.column),
                appliedFilters: data.appliedFilters,
                appliedSorting: data.appliedSorting,
              });
              setCurrentFilterConfig({
                columns: Object.keys(data.column),
                appliedFilters: data.appliedFilters,
                appliedSorting: data.appliedSorting,
              });
              setCurrentViewName(data.viewName);
              setInitialViewName(data.viewName);
              return;
            }
          } catch (retryErr: any) {
            setError(handleApiError(retryErr, "Retry failed while fetching view data."));
          }
        } else {
          setError(handleApiError(err, "An error occurred while fetching view data."));
        }
      } finally {
        setLoading(false);
        setInitialLoading(false);
        hasFetchedInitialData.current = true;
      }
    },
    [resource, currentViewId]
  );

  useEffect(() => {
    if (!hasFetchedInitialData.current) {
      const storedViewId = window.localStorage.getItem(`${resource}-viewId`);
      const parsedId = storedViewId ? parseInt(storedViewId, 10) : null;
      fetchViewData(parsedId);
    }
  }, [resource, fetchViewData]);

  useEffect(() => {
    if (innitalLoading) return;

    const isSameFilterAsServer =
      JSON.stringify(currentFilterConfig) === JSON.stringify(initialFilterConfig) &&
      currentViewName === initialViewName;

    const isSamePaginationAsServer =
      page === initialPage && pageSize === initialPageSize;

    if (isSameFilterAsServer && isSamePaginationAsServer) {
      return;
    }

    const fetchFilteredData = async () => {
      setLoading(true);
      setError(null);
      try {
        const requestPayload: GetFilteredDataRequest = {
          columns: currentFilterConfig.columns,
          filters: currentFilterConfig.appliedFilters,
          sorting: currentFilterConfig.appliedSorting,
          page,
          pageSize,
        };

        const response: GetFilteredDataResponse = await getFilteredData(
          resource,
          requestPayload.columns,
          requestPayload.filters,
          requestPayload.sorting,
          page,
          pageSize
        );

        if (response.success) {
          const data = response.data;
          setTableData(data.data);
          setTotalRecords(data.totalRecords);
        } else {
          setError("Failed to fetch filtered data.");
        }
      } catch (err: any) {
        setError(handleApiError(err, "An error occurred while fetching filtered data."));
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredData();
  }, [
    currentFilterConfig,
    page,
    pageSize,
    resource,
    innitalLoading,
    initialFilterConfig,
    initialPage,
    initialPageSize,
  ]);

  // setting isModified state 
  useEffect(() => {
    const isSameFilterAsInitial =
      JSON.stringify(currentFilterConfig) === JSON.stringify(initialFilterConfig);
    const isSameViewNameAsInitial = currentViewName === initialViewName;

    setIsModified(!isSameFilterAsInitial || !isSameViewNameAsInitial);
  }, [currentFilterConfig, initialFilterConfig, currentViewName, initialViewName]);

  const handleSaveView = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!currentViewId || initialViewName === "grid") {
        let finalViewName = currentViewName;
        if (finalViewName === "grid") {
          finalViewName = getRandomCartoonName();
          setCurrentViewName(finalViewName);
        }
        const response = await createView(
          resource,
          finalViewName,
          currentFilterConfig.columns,
          currentFilterConfig.appliedFilters,
          currentFilterConfig.appliedSorting
        );
        if (response.success) {
          setCurrentViewId(response.data.viewId);
          window.localStorage.setItem(
            `${resource}-viewId`,
            response.data.viewId.toString()
          );
          setViews(response.data.views);
          setInitialFilterConfig(currentFilterConfig);
          setInitialViewName(finalViewName);
        }
      } else {
        const response = await updateView(
          resource,
          currentViewId,
          currentViewName,
          currentFilterConfig.columns,
          currentFilterConfig.appliedFilters,
          currentFilterConfig.appliedSorting
        );
        if (response.success) {
          setViews(response.data.views);
          setInitialFilterConfig(currentFilterConfig);
          setInitialViewName(currentViewName);
        } else {
          setError("Failed to save the view.");
        }
      }
    } catch (err: any) {
      setError(handleApiError(err, "An error occurred while saving the view."));
    } finally {
      setLoading(false);
    }
  }, [
    resource,
    currentViewId,
    currentFilterConfig,
    currentViewName,
    initialViewName,
  ]);

  const handleDeleteView = useCallback(
    async (viewToDelete: View) => {
      setLoading(true);
      setError(null);
      try {
        const response: DeleteViewResponse = await deleteView(resource, viewToDelete.id);
        if (response.success) {
          setViews(response.data.views);
          if (currentViewId === viewToDelete.id) {
            window.localStorage.removeItem(`${resource}-viewId`);
            fetchViewData(null);
          }
        } else {
          setError("Failed to refresh views after deletion.");
        }
      } catch (err: any) {
        setError(handleApiError(err, "An error occurred while deleting the view."));
      } finally {
        setLoading(false);
      }
    },
    [resource, currentViewId, fetchViewData]
  );

  return (
    <>
      <FilterComponentNew
        resource={resource}
        pageTitle={pageTitle}
        filterConfig={currentFilterConfig}
        onFilterChange={(newFilterConfig) => {
          setPage(1);
          setCurrentFilterConfig(newFilterConfig);
        }}
        page={page}
        pageSize={pageSize}
        totalPages={Math.ceil(totalRecords / pageSize)}
        handlePageChange={(newPage, newPageSize) => {
          if (newPage) setPage(newPage);
          if (newPageSize) setPageSize(newPageSize);
        }}
        currentViewName={currentViewName}
        setCurrentViewName={setCurrentViewName}
        availableColumnsTypes={availableColumns}
      />
      <div className="flex h-screen bg-neutral-50">
        <div className="py-2 px-4">
          <ViewSidebarNew
            views={views}
            resource={resource}
            currentViewId={currentViewId}
            onSelectView={(viewId) => {
              window.localStorage.setItem(`${resource}-viewId`, viewId.toString());
              fetchViewData(viewId);
            }}
            onDeleteView={handleDeleteView}
          />
        </div>
        <div className="flex-1 flex flex-col py-4 px-4 overflow-auto relative">
          <div className="relative flex-1 mt-2 rounded-lg shadow-premium overflow-hidden w-full h-full bg-white">
            <DataTableNew
              data={tableData}
              availableColumns={Object.keys(availableColumns)}
              loading={loading}
              error={error}
              resource={resource}
              handleDataChange={(data) => {
                setTableData(data);
              }}
              handleTotalRecordsChange={() => {
                setTotalRecords(prev => prev - 1);
              }}
            />
            <img
              src="./image.png"
              alt="Watermark"
              className="absolute inset-0 w-full h-full object-cover opacity-5 pointer-events-none"
            />
            {isModified && (
              <button
                type="button"
                onClick={handleSaveView}
                className="absolute bottom-12 right-6 bg-brand text-white font-semibold py-2 px-4 rounded-md shadow-premium hover:bg-brand-light transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-dark z-20"
              >
                Save View
              </button>
            )}
            {error && (
              <div className="absolute top-4 left-4 bg-red-100 text-red-700 px-4 py-2 rounded-md shadow-lg z-20">
                {error}
              </div>
            )}
            <div className="absolute top-3 right-5 bg-neutral-200 text-neutral-800 px-4 py-1 rounded-md shadow-lg z-10">
              Fetched {totalRecords} records.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DataPageNew;
