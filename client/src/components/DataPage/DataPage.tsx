import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import DataTableNew from "../DataTable/DataTableNew";
import {
  deleteView,
  getFilteredData,
  getViewData,
  createView,
  updateView,
} from "../../utils/apiService/dataAPI";
import { getRandomCartoonName } from "../../utils/cartoons";
import handleApiError from "../../utils/ErrorHandlers/APIError";
import {
  DeleteViewResponse,
  FilterConfig,
  GetFilteredDataRequest,
  GetFilteredDataResponse,
  View,
} from "../../../../shared/src/types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Input } from "../ui/input";

import ColumnPanelNew from "../UI/ColumnPanel/ColumnPanelNew";
import { SortingPanelNew } from "../UI";
import FilterPanelNew from "../UI/FilterPanel/FilterPanel2";

// Import Progress component from Shad CN
import { Progress } from "@/components/ui/progress";

interface DataPageProps {
  apiEndpoint: string;
  resource: string;
  pageTitle: string;
}

const DataPage: React.FC<DataPageProps> = ({ resource, pageTitle }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  const [tableData, setTableData] = useState<Array<{ [key: string]: any }>>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // Filter & Sorting
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

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [initialPage, setInitialPage] = useState<number>(1);
  const [initialPageSize, setInitialPageSize] = useState<number>(25);

  // Views
  const [views, setViews] = useState<Array<{ id: number; viewName: string }>>([]);
  const [currentViewId, setCurrentViewId] = useState<number | null>(null);
  const [currentViewName, setCurrentViewName] = useState<string>("");
  const [initialViewName, setInitialViewName] = useState<string>("");
  const [isModified, setIsModified] = useState<boolean>(false);

  // Columns
  const [availableColumns, setAvailableColumns] = useState<{
    [key: string]: string;
  }>({});

  // Progress State
  const [progress, setProgress] = useState<number>(0);

  // For tracking if we have fetched data
  const hasFetchedInitialData = useRef<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [viewToDelete, setViewToDelete] = useState<View | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // For searching among views (in the sidebar)
  const [searchQuery, setSearchQuery] = useState<string>("");

  // ------------------------------------------------
  // 2) Modal Outside-Click
  // ------------------------------------------------
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsModalOpen(false);
        setViewToDelete(null);
      }
    },
    []
  );

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen, handleClickOutside]);

  const fetchViewData = useCallback(
    async (viewId: number | null) => {
      if (viewId === currentViewId && hasFetchedInitialData.current) return;
      setLoading(true);
      setError(null);
      let retryAttempted = false;

      try {
        const resp = viewId
          ? await getViewData(resource, viewId)
          : await getViewData(resource);

        if (resp.success) {
          const data = resp.data;

          if (data.viewId !== currentViewId) {
            setCurrentViewId(data.viewId);
            window.localStorage.setItem(`${resource}-viewId`, data.viewId.toString());
          }

          setTableData(data.data);
          setViews(data.views);
          setTotalRecords(data.totalRecords);

          // Pagination
          setPage(data.page);
          setPageSize(data.pageSize);
          setInitialPage(data.page);
          setInitialPageSize(data.pageSize);

          // Columns
          setAvailableColumns(data.availableColumnsType);

          // Filter config
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

          // View name
          setCurrentViewName(data.viewName);
          setInitialViewName(data.viewName);
        }
      } catch (err: any) {
        if (!retryAttempted) {
          retryAttempted = true;
          try {
            const retryResp = await getViewData(resource);
            if (retryResp.success) {
              const data = retryResp.data;

              if (data.viewId !== currentViewId) {
                setCurrentViewId(data.viewId);
                window.localStorage.setItem(`${resource}-viewId`, data.viewId.toString());
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
          } catch (retryErr) {
            setError(handleApiError(retryErr, "Retry failed while fetching view data."));
          }
        } else {
          setError(handleApiError(err, "An error occurred while fetching view data."));
        }
      } finally {
        // setLoading(false);
        setInitialLoading(false);
        hasFetchedInitialData.current = true;
      }
    },
    [resource, currentViewId]
  );

  useEffect(() => {
    if (!hasFetchedInitialData.current) {
      const stored = window.localStorage.getItem(`${resource}-viewId`);
      const parsed = stored ? parseInt(stored, 10) : null;
      fetchViewData(parsed);
    }
  }, [fetchViewData, resource]);

  useEffect(() => {
    if (initialLoading) return;

    const fetchFilteredData = async () => {
      setLoading(true);
      setError(null);
      try {
        const req: GetFilteredDataRequest = {
          columns: currentFilterConfig.columns,
          filters: currentFilterConfig.appliedFilters,
          sorting: currentFilterConfig.appliedSorting,
          page,
          pageSize,
        };

        const resp: GetFilteredDataResponse = await getFilteredData(
          resource,
          req.columns,
          req.filters,
          req.sorting,
          page,
          pageSize
        );

        if (resp.success) {
          setTableData(resp.data.data);
          setTotalRecords(resp.data.totalRecords);
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
    initialLoading,
    initialFilterConfig,
    initialPage,
    initialPageSize,
  ]);

  // set-reset IsModified
  useEffect(() => {
    const sameFilter =
      JSON.stringify(currentFilterConfig) === JSON.stringify(initialFilterConfig);
    const sameName = currentViewName === initialViewName;
    setIsModified(!sameFilter || !sameName);
  }, [currentFilterConfig, initialFilterConfig, currentViewName, initialViewName]);

  const handleSaveView = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!currentViewId || initialViewName === "grid") {
        let finalName = currentViewName;
        if (finalName === "grid") {
          finalName = getRandomCartoonName();
          setCurrentViewName(finalName);
        }
        const resp = await createView(
          resource,
          finalName,
          currentFilterConfig.columns,
          currentFilterConfig.appliedFilters,
          currentFilterConfig.appliedSorting
        );
        if (resp.success) {
          setCurrentViewId(resp.data.viewId);
          window.localStorage.setItem(`${resource}-viewId`, resp.data.viewId.toString());
          setViews(resp.data.views);
          setInitialFilterConfig(currentFilterConfig);
          setInitialViewName(finalName);
        }
      } else {
        const resp = await updateView(
          resource,
          currentViewId,
          currentViewName,
          currentFilterConfig.columns,
          currentFilterConfig.appliedFilters,
          currentFilterConfig.appliedSorting
        );
        if (resp.success) {
          setViews(resp.data.views);
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
  }, [resource, currentViewId, initialViewName, currentViewName, currentFilterConfig]);

  const handleDeleteView = useCallback(
    async (view: View) => {
      setLoading(true);
      setError(null);
      try {
        const resp: DeleteViewResponse = await deleteView(resource, view.id);
        if (resp.success) {
          setViews(resp.data.views);
          if (currentViewId === view.id) {
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
    [currentViewId, resource, fetchViewData]
  );

  // For AppSidebar “confirm delete”
  const confirmDeleteView = (view: View) => {
    setViewToDelete(view);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async (viewId: View) => {
    await handleDeleteView(viewId);
  };

  // ------------------------------------------------
  // Progress Bar Effect
  // ------------------------------------------------
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (loading) {
      setProgress(0); // Reset progress when loading starts

      // Increment progress every 500ms up to 90%
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev; // Cap at 90% to leave room for completion
          return prev + Math.random() * 10; // Increment by a random value to simulate progress
        });
      }, 500);
    } else {
      // When loading finishes, set progress to 100% and then reset after a short delay
      setProgress(100);

      // Hide the progress bar after it reaches 100%
      timer = setTimeout(() => {
        setProgress(0);
      }, 500); // Adjust the delay as needed
    }

    // Cleanup the timer on component unmount or when loading state changes
    return () => clearInterval(timer);
  }, [loading]);

  // ------------------------------------------------
  // Compute Filtered and Sorted Columns
  // ------------------------------------------------
  const filteredColumns = useMemo(() => {
    const columns = new Set<string>();
    Object.values(currentFilterConfig.appliedFilters || {}).forEach(filterGroup => {
      filterGroup?.forEach(filter => {
        Object.keys(filter).forEach(column => {
          columns.add(column);
        });
      });
    });
    return columns;
  }, [currentFilterConfig.appliedFilters]);

  const sortedColumns = useMemo(() => {
    const columns = new Set<string>();
    currentFilterConfig.appliedSorting.forEach(sort => {
      Object.keys(sort).forEach(column => {
        columns.add(column);
      });
    });
    return columns;
  }, [currentFilterConfig.appliedSorting]);

  // ------------------------------------------------
  // 7) RENDER: Mirroring Your Home.tsx Structure
  // ------------------------------------------------
  return (
    <div className="overflow-hidden"> {/* Prevent entire page from scrolling */}
      <SidebarProvider>
        <div className="flex min-h-[calc(100vh-5rem)] border-t overflow-hidden"> {/* Added overflow-hidden */}
          {/* SIDEBAR */}
          <AppSidebar
            className="shrink-0 border-r"
            views={views}
            currentViewId={currentViewId}
            onSelectView={(id) => fetchViewData(id)}
            handleConfirmDelete={(v: View) => confirmDeleteView(v)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* MAIN CONTENT */}
          <SidebarInset className="flex flex-1 flex-col overflow-hidden"> {/* Added overflow-hidden */}
            {/* Progress Bar */}
          
            <Progress value={progress} className="w-full h-0.5" />

            {/* Header with trigger + breadcrumb */}
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 relative">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList className="flex flex-wrap"> {/* Added flex-wrap */}
                  <BreadcrumbItem className="hidden md:block">
                    {pageTitle}
                  </BreadcrumbItem>
                  <BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbPage>
                      <Input
                        type="text"
                        className="rounded-md"
                        value={currentViewName}
                        onChange={(e) => setCurrentViewName(e.target.value)}
                        placeholder="View Name"
                      />
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                  <BreadcrumbItem>
                    <ColumnPanelNew
                      resource={resource}
                      filterConfig={currentFilterConfig}
                      availableColumnsTypes={availableColumns}
                      onFilterChange={(newConfig) => {
                        setCurrentFilterConfig(newConfig);
                      }}
                    />
                  </BreadcrumbItem>
                  <BreadcrumbItem>
                    <FilterPanelNew
                      availableColumnsTypes={availableColumns}
                      filterConfig={currentFilterConfig}
                      onFilterChange={(newConfig) => {
                        setCurrentFilterConfig(newConfig);
                      }}
                      resource={resource}
                    />
                  </BreadcrumbItem>
                  <BreadcrumbItem>
                    <SortingPanelNew
                      resource={resource}
                      filterConfig={currentFilterConfig}
                      onFilterChange={(newConfig) => {
                        setCurrentFilterConfig(newConfig);
                      }}
                      availableColumnsTypes={availableColumns}
                    />
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>

            {/* Body area: filters + table */}
            <div className="flex flex-1 flex-col gap-4 overflow-hidden"> {/* Added overflow-hidden */}
              {/* Main content container (table) */}
              <div className="relative flex-1 rounded-xl bg-muted/50"> {/* Added flex-1 */}
                <div className="relative h-full w-full overflow-y-auto rounded-lg bg-white shadow-md">
                  {/* Horizontal scroll wrapper */}
                  <div className="w-full overflow-x-auto">
                    <DataTableNew
                      data={tableData}
                      availableColumns={Object.keys(availableColumns)}
                      loading={loading}
                      error={error}
                      resource={resource}
                      handleDataChange={(data) => setTableData(data)}
                      handleTotalRecordsChange={() =>
                        setTotalRecords((prev) => prev - 1)
                      }
                      filteredColumns={filteredColumns} // Passing filtered columns
                      sortedColumns={sortedColumns}     // Passing sorted columns
                    />
                  </div>

                  {/* Watermark overlay */}
                  <img
                    src="./image.png"
                    alt="Watermark"
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-5"
                  />

                  {/* Save View button if view is modified */}
                  {isModified && (
                    <button
                      onClick={handleSaveView}
                      className="absolute bottom-4 right-4 rounded-md bg-brand px-4 py-2 font-semibold text-white shadow hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-dark"
                    >
                      Save View
                    </button>
                  )}

                  {/* Error alert */}
                  {error && (
                    <div className="absolute top-4 left-4 rounded bg-red-100 px-4 py-2 text-red-700 shadow-md">
                      {error}
                    </div>
                  )}

                  {/* Record count display */}
                  <div className="absolute top-4 right-4 rounded bg-neutral-200 px-4 py-1 text-neutral-800 shadow-md">
                    {totalRecords} records
                  </div>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default DataPage;
