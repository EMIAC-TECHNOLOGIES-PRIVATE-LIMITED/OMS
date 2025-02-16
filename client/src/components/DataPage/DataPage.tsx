import React, { useCallback, useEffect, useRef, useState, } from "react";
import { Spinner } from '../UI/index';
import { AppSidebar } from "@/components/app-sidebar";

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
import DataGrid from "../DataTable/DataTable";



interface DataPageProps {
  apiEndpoint: string;
  resource: string;
  pageTitle: string;
}

const DataPage: React.FC<DataPageProps> = ({ resource, pageTitle }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [tableData, setTableData] = useState<Array<{ [key: string]: any }>>([]);
  const [totalRecords, setTotalRecords] = useState<number | null>(null);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    columns: [],
    filters: [],
    connector: "AND",
    sort: []
  });
  const [dirtyFilter, setDirtyFilter] = useState(false);
  const initialFilterConfig = useRef<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [views, setViews] = useState<Array<{ id: number; viewName: string }>>([]);
  const [currentViewId, setCurrentViewId] = useState<number | null>(null);
  const [currentViewName, setCurrentViewName] = useState<string>("");
  const [initialViewName, setInitialViewName] = useState<string>("");
  const [availableColumns, setAvailableColumns] = useState<{
    [key: string]: string;
  }>({});

  const [filteredColumns, setFilteredColumns] = useState<string[]>([]);
  const [sortedColumns, setSortedColumns] = useState<string[]>([]);

  const initialFire = useRef<number>(3);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setIsModalOpen(false);
    }
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => handleClickOutside(e);

    if (isModalOpen) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [isModalOpen, handleClickOutside]);

  // fetching view data 
  const fetchViewData = useCallback(async (viewId: number | null) => {
    setLoading(true);
    setError(null);
    initialFire.current = 3;
    try {
      const resp = viewId
        ? await getViewData(resource, viewId)
        : await getViewData(resource);

      if (resp.success) {
        const data = resp.data;

        setCurrentViewId(data.viewId);
        window.localStorage.setItem(`${resource}-viewId`, data.viewId.toString());
        setPage(1);
        setPageSize(25);
        setTableData(data.data);
        setViews(data.views);
        setTotalRecords(data.totalRecords);
        setAvailableColumns(data.availableColumnsType);
        setFilterConfig(data.appliedFilters);
        setCurrentViewName(data.viewName);
        setInitialViewName(data.viewName);
        initialFilterConfig.current = JSON.stringify(data.appliedFilters);
        setDirtyFilter(false);
      }
    } catch (error: any) {
      setError(handleApiError(error, "An error occurred while fetching view data."));
    } finally {
      setLoading(false);
    }
  }, [resource]);

  // fetch filtered data function
  const fetchFilteredData = useCallback(async (filterConfig: FilterConfig, page: number, pageSize: number) => {
    setLoading(true);
    setError(null);
    try {
      const req: GetFilteredDataRequest = {
        appliedFilters: filterConfig,
        page,
        pageSize,
      };
      const resp: GetFilteredDataResponse = await getFilteredData(
        resource,
        req.appliedFilters,
        page,
        pageSize
      );

      if (resp.success) {
        setTableData(resp.data.data);
        setTotalRecords(resp.data.totalRecords);
      }
    } catch (err: any) {
      setError(handleApiError(err, "An error occurred while fetching filtered data."));
    } finally {
      setLoading(false);
    }
  }, [filterConfig, page, pageSize, resource]);

  // initial view data fetching fire
  useEffect(() => {
    const viewId = window.localStorage.getItem(`${resource}-viewId`);
    if (viewId) {
      fetchViewData(parseInt(viewId));
    } else {
      fetchViewData(null);
    }
  }, [resource]);

  // columns to be passed for colouring to dataTable component.
  useEffect(() => {
    // For filters - this part is correct since filters is an array of objects with a column property
    const columns = filterConfig?.filters?.map((f) => f.column);
    setFilteredColumns(columns || []);

    // For sort - need to fix this part
    // Current structure is array of objects where each object has a key-value pair
    const sortColumns = filterConfig?.sort?.map(sortObj =>
      // Get the first (and only) key from the object
      Object.keys(sortObj)[0]
    );
    setSortedColumns(sortColumns || []);
  }, [filterConfig]);

  const handleFilterChange = useCallback((newConfig: FilterConfig) => {
    setFilterConfig(newConfig);
    setDirtyFilter(JSON.stringify(newConfig) !== initialFilterConfig.current);
    const debouncedFetch = debounce(async () => {
      fetchFilteredData(newConfig, page, pageSize);
    }, 300);
    debouncedFetch();

    return () => {
      debouncedFetch.cancel();
    };
  }, [filterConfig, page, pageSize]);

  const handlePageChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
    fetchFilteredData(filterConfig, newPage, newPageSize);
  }, [filterConfig]);

  const handleSaveView = useCallback(async () => {
    setError(null);
    try {
      if (!currentViewId || initialViewName === "grid") {
        let finalName = currentViewName;
        if (finalName === "grid") {
          finalName = getRandomCartoonName();
          setCurrentViewName(finalName);
        }
        const resp = await createView(resource, finalName, filterConfig ? filterConfig : {});
        if (resp.success) {
          setCurrentViewId(resp.data.newViewId);
          window.localStorage.setItem(`${resource}-viewId`, resp.data.newViewId.toString());
          setViews(resp.data.views);
          setInitialViewName(finalName);
        }
      } else {
        const resp = await updateView(resource, currentViewId, currentViewName, filterConfig);
        if (resp.success) {
          setViews((prev) =>
            prev.map((v) => v.id === currentViewId
              ? { id: currentViewId, viewName: currentViewName }
              : v
            )
          );
        }
      }

      initialFilterConfig.current = JSON.stringify(filterConfig);
      setDirtyFilter(false);
    } catch (err: any) {
      setError(handleApiError(err, "An error occurred while saving the view."));
    }
  }, [resource, currentViewId, initialViewName, currentViewName, filterConfig]);

  const handleDeleteView = useCallback(async (view: { id: number, viewName: string }) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[DataPage] : Handle delete view called with view : ', view);
      const resp: DeleteViewResponse = await deleteView(resource, view.id);
      if (resp.success) {
        setViews(prev => prev.filter(v => v.id !== view.id));
        if (currentViewId === view.id) {
          window.localStorage.removeItem(`${resource}-viewId`);
          await fetchViewData(null);
        }
      } else {
        setError("Failed to refresh views after deletion.");
      }
    } catch (err: any) {
      setError(handleApiError(err, "An error occurred while deleting the view."));
    } finally {
      setLoading(false);
    }
  }, [currentViewId, resource, fetchViewData]);


  return (
    <div className="overflow-hidden">
      <SidebarProvider>
        <div className="flex min-h-[calc(100vh-5rem)] border-t overflow-hidden">
          <AppSidebar
            className="shrink-0 border-r"
            views={views}
            currentViewId={currentViewId}
            onSelectView={(id) => fetchViewData(id)}
            handleConfirmDelete={(v: { id: number, viewName: string }) => handleDeleteView(v)}
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
                        filterConfig={filterConfig}
                        availableColumnsTypes={availableColumns}
                        onFilterChange={handleFilterChange}
                      />

                    </BreadcrumbItem>
                    <BreadcrumbItem>
                      <FilterPanelNew
                        availableColumnTypes={availableColumns}
                        filterConfig={filterConfig}
                        onFilterChange={handleFilterChange}
                        resource={resource} />
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                      <SortingPanelNew
                        resource={resource}
                        filterConfig={filterConfig}
                        onFilterChange={handleFilterChange}
                        availableColumnsTypes={availableColumns}
                      />
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                      <Button
                        onClick={handleSaveView}
                        size={"sm"}
                        disabled={!dirtyFilter && currentViewName === initialViewName}
                        className="w-24"
                        variant={"brandOutline"}
                      >
                        Save View
                      </Button>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                      {/* sowing total fetched records */}
                      {(loading || processing) && <Spinner imagePath="./image.png" size={35} />}
                      {!loading && !processing && <p>
                        Fetched {totalRecords} records
                      </p>}
                    </BreadcrumbItem>
                  </div>
                  <div className="absolute right-0 flex items-center gap-2">
                    <BreadcrumbItem className="ml-auto flex justify-end">
                      <PaginationControlsNew
                        page={page}
                        pageSize={pageSize}
                        totalPages={Math.ceil((totalRecords ?? 0) / pageSize)}
                        handlePageChange={handlePageChange}
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
                <div className="relative h-screen w-full rounded-lg bg-white shadow-md ">
                  {/* Horizontal scroll wrapper */}
                  <div >
                    <DataGrid
                      data={tableData}
                      availableColumnTypes={availableColumns}
                      loading={loading}
                      resource={resource}
                      filteredColumns={filteredColumns}
                      sortedColumns={sortedColumns}
                      setProcessing={setProcessing}
                      totalRecords={totalRecords}
                      setTotalRecords={setTotalRecords}
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
