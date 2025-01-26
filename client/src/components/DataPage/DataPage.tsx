import React, { useCallback, useEffect, useRef, useState, useMemo, } from "react";
import { Spinner } from '../UI/index';
import { AppSidebar } from "@/components/app-sidebar";
import DataTableNew from "../DataTable/DataTableFinal";
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
import PaginationControlsNew from "../UI/PaginationControls/PaginationControls";
import FilterPanelNew from "../UI/FilterPanel/FilterPanel3";
import { Button } from "../ui/button";
import debounce from "lodash.debounce";


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




  // For tracking if we have fetched data
  const hasFetchedInitialData = useRef<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
 
  const modalRef = useRef<HTMLDivElement>(null);

  // For searching among views (in the sidebar)
  const [searchQuery, setSearchQuery] = useState<string>("");



  //  Modal Outside-Click 
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsModalOpen(false);
        
      }
    },
    []
  );

  // add event listener for outside click
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
          setAvailableColumns(Object.fromEntries(Object.entries(data.availableColumnsType).filter(([key]) => key !== "id")));

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

              setAvailableColumns(Object.fromEntries(Object.entries(data.availableColumnsType).filter(([key]) => key !== "id")));

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


    const debouncedFetch = debounce(async () => {
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
    }, 500);

    debouncedFetch();


    return () => {
      debouncedFetch.cancel();
    };
  }, [
    currentFilterConfig,
    resource,
    initialLoading,
    initialFilterConfig,
    initialPage,
    initialPageSize,
  ]);

  const fetchFilteredData = useCallback(async () => {
    if (initialLoading) return;

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
  }, [
    initialLoading,
    currentFilterConfig,
    page,
    pageSize,
    resource,
  ]); 


  useEffect(() => {
    fetchFilteredData();
  }, [fetchFilteredData]);

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
      // setLoading(false);
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

 



  // filtered and sorted columns 
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


  return (
    <div className="overflow-hidden">
      <SidebarProvider>
        <div className="flex min-h-[calc(100vh-5rem)] border-t overflow-hidden">
          <AppSidebar
            className="shrink-0 border-r"
            views={views}
            currentViewId={currentViewId}
            onSelectView={(id) => fetchViewData(id)}
            handleConfirmDelete={(v: View) => handleDeleteView(v)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* MAIN CONTENT */}
          <SidebarInset className="flex flex-1 flex-col overflow-hidden">


            {/* Header with trigger + breadcrumb */}
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 relative">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList className="flex w-full items-center ">
                  <div className="flex items-center gap-2">
                    <BreadcrumbItem className="hidden md:block">
                      {pageTitle}
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbPage>
                        <Input
                          type="text"
                          className="rounded-xl"
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
                        availableColumnTypes={availableColumns}
                        filterConfig={currentFilterConfig}
                        onFilterChange={(newConfig) => {
                          setCurrentFilterConfig(newConfig);
                        }}

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
                    <BreadcrumbItem>
                      <Button
                        onClick={handleSaveView}
                        size={"sm"}
                        disabled={!isModified}
                        className="w-24"
                        variant={isModified ? "brandOutline" : "secondary"}
                      >
                        Save View
                      </Button>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                      {/* sowing total fetched records */}
                      {loading && <Spinner imagePath="./image.png" size={35} />}
                      {!loading && <p>
                        Fetched {totalRecords} records
                      </p>}
                    </BreadcrumbItem>
                  </div>
                  <div className="absolute right-0 flex items-center gap-2">
                    <BreadcrumbItem className="ml-auto flex justify-end">
                      <PaginationControlsNew
                        page={page}
                        pageSize={pageSize}
                        totalPages={Math.ceil(totalRecords / pageSize)}
                        handlePageChange={(newPage, newPageSize) => {
                          setPage(newPage);
                          setPageSize(newPageSize);
                        }}
                      />
                    </BreadcrumbItem>
                  </div>


                </BreadcrumbList>
              </Breadcrumb>
            </header>

            {/* Body area: filters + table */}
            <div className="flex flex-1 flex-col gap-4"> {/* Added overflow-hidden */}
              {/* Main content container (table) */}
              <div className="relative flex-1 rounded-xl bg-muted/50"> {/* MARKER*/}
                <div className="relative h-screen w-full  rounded-lg bg-white shadow-md ">
                  {/* Horizontal scroll wrapper */}
                  <div className="w-full h-screen overflow-y-auto ">
                    <DataTableNew
                      data={tableData}
                      availableColumnTypes={availableColumns}
                      loading={loading}
                      error={error}
                      resource={resource}
                      handleDataChange={(data) => setTableData(data)}
                      handleTotalRecordsChange={() =>
                        setTotalRecords((prev) => prev - 1)
                      }
                      filteredColumns={filteredColumns} 
                      sortedColumns={sortedColumns}    
                      fetchFilteredData={fetchFilteredData}
                    />
                  </div>

                  {/* Watermark overlay */}
                  <img
                    src="./image.png"
                    alt="Watermark"
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-5"
                  />



                  {/* Error alert */}
                  {error && (
                    <div className="absolute top-4 left-4 rounded bg-red-100 px-4 py-2 text-red-700 shadow-md">
                      {error}
                    </div>
                  )}


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
