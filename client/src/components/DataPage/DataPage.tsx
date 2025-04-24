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
import { useToast } from "@/hooks/use-toast";
import { useSetRecoilState } from "recoil";
import { showFabAtom } from "@/store/atoms/atoms";


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
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [filterCount, setFilterCount] = useState<number>(0);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    columns: [],
    filters: [],
    connector: "AND",
    sort: []
  });
  const [globalFilterString, setGlobalFilterString] = useState<string>("");
  const { toast } = useToast();
  const setShowFAB = useSetRecoilState(showFabAtom);
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
  const [columnDescriptions, setColumnDescriptions] = useState<{
    [key: string]: string;
  }>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

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
        setTotalCount(data.totalCount);
        setFilterCount(data.filteredCount);
        setAvailableColumns(data.availableColumnsType);
        setColumnDescriptions(data.columnDefinations);
        setFilterConfig(data.appliedFilters);
        setColumnOrder(data.columnOrder);
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
  const fetchFilteredData = useCallback(async (
    filterConfig: FilterConfig,
    page: number,
    pageSize: number,
    searchString: string // Add parameter for the search string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const resp: GetFilteredDataResponse = await getFilteredData(
        resource,
        filterConfig,
        page,
        pageSize,
        columnOrder,
        searchString, // Use the passed parameter instead of state
      );

      if (resp.success) {
        setTableData(resp.data.data);
        setFilterCount(resp.data.filteredCount);
      }
    } catch (err: any) {
      setError(handleApiError(err, "An error occurred while fetching filtered data."));
    } finally {
      setLoading(false);
    }
  }, [resource, columnOrder]);

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
      setPage(1);
      fetchFilteredData(newConfig, 1, pageSize, globalFilterString);
    }, 300);
    debouncedFetch();

    return () => {
      debouncedFetch.cancel();
    };
  }, [filterConfig, page, pageSize, globalFilterString]);

  const handlePageChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
    fetchFilteredData(filterConfig, newPage, newPageSize, globalFilterString);
  }, [filterConfig, globalFilterString]);

  const handleSaveView = useCallback(async () => {
    setError(null);
    setProcessing(true);
    try {
      if (!currentViewId || initialViewName === "grid") {
        let finalName = currentViewName;
        if (finalName === "grid" || finalName === "") {
          finalName = getRandomCartoonName();
          setCurrentViewName(finalName);
        }
        if (views.some(v => v.viewName === finalName)) {
          setShowFAB(false);
          setTimeout(() => setShowFAB(true), 3500);
          toast({
            title: "View name already exists",
            description: "Please choose a different name",
            variant: 'destructive',
            duration: 3000
          })
          return;
        }
        const resp = await createView(resource, finalName, filterConfig ? filterConfig : {}, columnOrder);
        if (resp.success) {
          setCurrentViewId(resp.data.newViewId);
          window.localStorage.setItem(`${resource}-viewId`, resp.data.newViewId.toString());
          setViews(resp.data.views);
          setInitialViewName(finalName);
        }
      } else {
        if (views.some(v => v.viewName === currentViewName && v.id !== currentViewId)) {
          setShowFAB(false);
          setTimeout(() => setShowFAB(true), 3500);
          toast({
            title: "View name already exists",
            description: "Please choose a different name",
            variant: 'destructive',
            duration: 3000
          })
          return;
        }
        const resp = await updateView(resource, currentViewId, currentViewName, filterConfig);
        if (resp.success) {
          setInitialViewName(currentViewName);
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
    } finally {
      setProcessing(false);
    }
  }, [resource, currentViewId, initialViewName, currentViewName, filterConfig, columnOrder]);

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

  const debouncedFetchWithFilter = useCallback(
    debounce((searchValue: string) => {
      setPage(1);
      fetchFilteredData(filterConfig, 1, pageSize, searchValue);
    }, 500), // Increase debounce time to 500ms for better UX
    [filterConfig, pageSize, fetchFilteredData]
  );

  // Update the onChange handler to use our debounced function
  const handleGlobalFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchValue = e.target.value;
    setGlobalFilterString(newSearchValue);
    debouncedFetchWithFilter(newSearchValue); // Pass the current value directly
  }, [debouncedFetchWithFilter]);

  const setColumnOrderSafe = useCallback((newOrder: string[]) => {
    setColumnOrder(newOrder);
  }, []);


  return (
    <div className=" h-[94vh]  ">
      <SidebarProvider>
        <div className="flex h-[100%] w-screen border-t overflow-hidden">
          <AppSidebar
            className="shrink-0 border-r h-[60vh]"
            views={views}
            currentViewId={currentViewId}
            onSelectView={(id) => {
              setGlobalFilterString("");
              fetchViewData(id)
            }}
            handleConfirmDelete={(v: { id: number, viewName: string }) => handleDeleteView(v)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* MAIN CONTENT */}
          <SidebarInset className="overflow-hidden">

            {/* Header with trigger + breadcrumb */}
            <div className="flex flex-col flex-1 h-[100%]">
              <div className="scale-75 origin-top-left  w-[133%]">
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
                            {(!dirtyFilter && currentViewName === initialViewName) ? "Saved" : "Save View"}
                          </Button>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                          {/* sowing total fetched records */}
                          {(loading || processing) && <Spinner imagePath="./image.png" size={35} />}
                          {!loading && !processing && <p>
                            Filtered {filterCount} of {totalCount} records
                          </p>}
                        </BreadcrumbItem>
                      </div>
                      <div className="absolute right-0 flex items-center gap-2">
                        <BreadcrumbItem className="flex justify-end">
                          <Input
                            type="text"
                            placeholder="Search globally..."
                            className="rounded-xl w-64"
                            value={globalFilterString}
                            onChange={handleGlobalFilterChange}
                          />
                        </BreadcrumbItem>
                        <BreadcrumbItem className="ml-auto flex justify-end">
                          <PaginationControlsNew
                            page={page}
                            pageSize={pageSize}
                            totalPages={Math.ceil((filterCount ?? 0) / pageSize)}
                            handlePageChange={handlePageChange}
                          />
                        </BreadcrumbItem>
                      </div>
                    </BreadcrumbList>
                  </Breadcrumb>
                </header>
              </div>


              <div className="relative flex-1 rounded-xl bg-muted/50 "> {/* MARKER*/}
                <div className=" w-[100%] h-[100%] rounded-lg inline-block overflow-x-auto ">
                  <DataGrid
                    data={tableData}
                    availableColumnTypes={availableColumns}
                    columnDescriptions={columnDescriptions}
                    loading={loading}
                    resource={resource}
                    filteredColumns={filteredColumns}
                    sortedColumns={sortedColumns}
                    setProcessing={setProcessing}
                    totalCount={totalCount}
                    setTotalCount={setTotalCount}
                    filteredCount={filterCount}
                    refreshRecords={(addedRecords: number) => {
                      fetchFilteredData(filterConfig, page, pageSize, globalFilterString);
                      setTotalCount((prev) => prev ? prev + addedRecords : addedRecords);
                    }}
                    filterConfig={filterConfig}
                    handleFilterChange={handleFilterChange}
                    viewId={currentViewId}
                    viewName={currentViewName}
                    setColumnOrder={setColumnOrderSafe}
                  />

                  {/* </div> */}

                  {/* Watermark overlay */}
                  <img
                    src="./image.png"
                    alt="Watermark"
                    className="pointer-events-none absolute inset-0 h-[80vh] w-full object-cover opacity-5"
                  />

                  {/* Error alert */}
                  {error && (
                    <div className="absolute top-4 left-4 rounded bg-red-100 px-4 py-2 text-red-700 shadow-md">
                      {error}
                    </div>
                  )}


                </div>
              </div>
              {/* </div> */}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default DataPage;
