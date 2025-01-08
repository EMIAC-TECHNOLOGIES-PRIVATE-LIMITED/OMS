import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react"
import { motion } from "framer-motion"
import {
  getViewData,
  getFilteredData,
  createView,
  updateView,
  deleteView,
} from "../../utils/apiService/dataAPI"
import {
  GetViewDataResponse,
  GetFilteredDataRequest,
  GetFilteredDataResponse,
  DeleteViewResponse,
  FilterConfig,
  View,
} from "../../../../shared/src/types"
import FilterComponentNew from "../FilterComponent/FilterComponentNew"
import DataTableNew from "../DataTable/DataTable"
import { getRandomCartoonName } from "../../utils/cartoons"
import handleApiError from "../../utils/ErrorHandlers/APIError"

// ---- shadcn imports for layout/UI
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Trash2, Grid, BarChart2, X } from "lucide-react"

interface DataPageNewProps {
  apiEndpoint: string
  resource: string
  pageTitle: string
}

const DataPageNew: React.FC<DataPageNewProps> = ({ resource, pageTitle }) => {
  // ----- Business Logic States -----
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [innitalLoading, setInitialLoading] = useState<boolean>(true)
  const [currentViewId, setCurrentViewId] = useState<number | null>(null)
  const [tableData, setTableData] = useState<Array<{ [key: string]: any }>>([])
  const [views, setViews] = useState<Array<{ id: number; viewName: string }>>([])
  const [totalRecords, setTotalRecords] = useState<number>(0)
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(25)

  const [initialPage, setInitialPage] = useState<number>(1)
  const [initialPageSize, setInitialPageSize] = useState<number>(25)

  const [initialFilterConfig, setInitialFilterConfig] = useState<FilterConfig>({
    columns: [],
    appliedFilters: {},
    appliedSorting: [],
  })
  const [currentFilterConfig, setCurrentFilterConfig] = useState<FilterConfig>({
    columns: [],
    appliedFilters: {},
    appliedSorting: [],
  })
  const [currentViewName, setCurrentViewName] = useState<string>("")
  const [initialViewName, setInitialViewName] = useState<string>("")
  const [availableColumns, setAvailableColumns] = useState<{
    [key: string]: string
  }>({})
  const [isModified, setIsModified] = useState<boolean>(false)
  const hasFetchedInitialData = useRef<boolean>(false)

  // ----- Deletion Modal States -----
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [viewToDelete, setViewToDelete] = useState<View | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // ----- Data Fetching / View Logic -----
  const fetchViewData = useCallback(
    async (viewId: number | null) => {
      if (viewId === currentViewId && hasFetchedInitialData.current) {
        return
      }
      setLoading(true)
      setError(null)

      let retryAttempted = false

      try {
        const response = viewId
          ? await getViewData(resource, viewId)
          : await getViewData(resource)

        if (response.success) {
          const data = response.data

          if (data.viewId !== currentViewId) {
            setCurrentViewId(data.viewId)
            window.localStorage.setItem(
              `${resource}-viewId`,
              data.viewId.toString()
            )
          }

          setTableData(data.data)
          setViews(data.views)
          setTotalRecords(data.totalRecords)
          setPage(data.page)
          setPageSize(data.pageSize)
          setInitialPage(data.page)
          setInitialPageSize(data.pageSize)

          setAvailableColumns(data.availableColumnsType)

          setInitialFilterConfig({
            columns: Object.keys(data.column),
            appliedFilters: data.appliedFilters,
            appliedSorting: data.appliedSorting,
          })
          setCurrentFilterConfig({
            columns: Object.keys(data.column),
            appliedFilters: data.appliedFilters,
            appliedSorting: data.appliedSorting,
          })
          setCurrentViewName(data.viewName)
          setInitialViewName(data.viewName)
        }
      } catch (err: any) {
        if (!retryAttempted) {
          retryAttempted = true
          try {
            const retryResponse = await getViewData(resource)
            if (retryResponse.success) {
              const data = retryResponse.data

              if (data.viewId !== currentViewId) {
                setCurrentViewId(data.viewId)
                window.localStorage.setItem(
                  `${resource}-viewId`,
                  data.viewId.toString()
                )
              }

              setTableData(data.data)
              setViews(data.views)
              setTotalRecords(data.totalRecords)
              setPage(data.page)
              setPageSize(data.pageSize)
              setInitialPage(data.page)
              setInitialPageSize(data.pageSize)

              setAvailableColumns(data.availableColumnsType)

              setInitialFilterConfig({
                columns: Object.keys(data.column),
                appliedFilters: data.appliedFilters,
                appliedSorting: data.appliedSorting,
              })
              setCurrentFilterConfig({
                columns: Object.keys(data.column),
                appliedFilters: data.appliedFilters,
                appliedSorting: data.appliedSorting,
              })
              setCurrentViewName(data.viewName)
              setInitialViewName(data.viewName)
              return
            }
          } catch (retryErr: any) {
            setError(
              handleApiError(retryErr, "Retry failed while fetching view data.")
            )
          }
        } else {
          setError(
            handleApiError(err, "An error occurred while fetching view data.")
          )
        }
      } finally {
        setLoading(false)
        setInitialLoading(false)
        hasFetchedInitialData.current = true
      }
    },
    [resource, currentViewId]
  )

  useEffect(() => {
    if (!hasFetchedInitialData.current) {
      const storedViewId = window.localStorage.getItem(`${resource}-viewId`)
      const parsedId = storedViewId ? parseInt(storedViewId, 10) : null
      fetchViewData(parsedId)
    }
  }, [resource, fetchViewData])

  useEffect(() => {
    if (innitalLoading) return

    const isSameFilterAsServer =
      JSON.stringify(currentFilterConfig) ===
      JSON.stringify(initialFilterConfig) &&
      currentViewName === initialViewName

    const isSamePaginationAsServer =
      page === initialPage && pageSize === initialPageSize

    if (isSameFilterAsServer && isSamePaginationAsServer) {
      return
    }

    const fetchFilteredData = async () => {
      setLoading(true)
      setError(null)
      try {
        const requestPayload: GetFilteredDataRequest = {
          columns: currentFilterConfig.columns,
          filters: currentFilterConfig.appliedFilters,
          sorting: currentFilterConfig.appliedSorting,
          page,
          pageSize,
        }

        const response: GetFilteredDataResponse = await getFilteredData(
          resource,
          requestPayload.columns,
          requestPayload.filters,
          requestPayload.sorting,
          page,
          pageSize
        )

        if (response.success) {
          const data = response.data
          setTableData(data.data)
          setTotalRecords(data.totalRecords)
        } else {
          setError("Failed to fetch filtered data.")
        }
      } catch (err: any) {
        setError(
          handleApiError(err, "An error occurred while fetching filtered data.")
        )
      } finally {
        setLoading(false)
      }
    }

    fetchFilteredData()
  }, [
    currentFilterConfig,
    page,
    pageSize,
    resource,
    innitalLoading,
    initialFilterConfig,
    initialPage,
    initialPageSize,
    currentViewName,
    initialViewName,
  ])

  useEffect(() => {
    const isSameFilterAsInitial =
      JSON.stringify(currentFilterConfig) === JSON.stringify(initialFilterConfig)
    const isSameViewNameAsInitial = currentViewName === initialViewName
    setIsModified(!isSameFilterAsInitial || !isSameViewNameAsInitial)
  }, [
    currentFilterConfig,
    initialFilterConfig,
    currentViewName,
    initialViewName,
  ])

  const handleSaveView = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (!currentViewId || initialViewName === "grid") {
        let finalViewName = currentViewName
        if (finalViewName === "grid") {
          finalViewName = getRandomCartoonName()
          setCurrentViewName(finalViewName)
        }
        const response = await createView(
          resource,
          finalViewName,
          currentFilterConfig.columns,
          currentFilterConfig.appliedFilters,
          currentFilterConfig.appliedSorting
        )
        if (response.success) {
          setCurrentViewId(response.data.viewId)
          window.localStorage.setItem(
            `${resource}-viewId`,
            response.data.viewId.toString()
          )
          setViews(response.data.views)
          setInitialFilterConfig(currentFilterConfig)
          setInitialViewName(finalViewName)
        }
      } else {
        const response = await updateView(
          resource,
          currentViewId,
          currentViewName,
          currentFilterConfig.columns,
          currentFilterConfig.appliedFilters,
          currentFilterConfig.appliedSorting
        )
        if (response.success) {
          setViews(response.data.views)
          setInitialFilterConfig(currentFilterConfig)
          setInitialViewName(currentViewName)
        } else {
          setError("Failed to save the view.")
        }
      }
    } catch (err: any) {
      setError(handleApiError(err, "An error occurred while saving the view."))
    } finally {
      setLoading(false)
    }
  }, [
    resource,
    currentViewId,
    currentFilterConfig,
    currentViewName,
    initialViewName,
  ])

  const handleDeleteView = useCallback(
    async (viewToDelete: View) => {
      setLoading(true)
      setError(null)
      try {
        const response: DeleteViewResponse = await deleteView(
          resource,
          viewToDelete.id
        )
        if (response.success) {
          setViews(response.data.views)
          if (currentViewId === viewToDelete.id) {
            window.localStorage.removeItem(`${resource}-viewId`)
            fetchViewData(null)
          }
        } else {
          setError("Failed to refresh views after deletion.")
        }
      } catch (err: any) {
        setError(
          handleApiError(err, "An error occurred while deleting the view.")
        )
      } finally {
        setLoading(false)
      }
    },
    [resource, currentViewId, fetchViewData]
  )

  // ----- Deletion Modal Handlers -----
  const handleDeleteClick = (view: View) => {
    setViewToDelete(view)
    setIsModalOpen(true)
  }
  const handleConfirmDelete = async () => {
    if (!viewToDelete) return
    try {
      await handleDeleteView(viewToDelete)
      setIsModalOpen(false)
      setViewToDelete(null)
    } catch (error) {
      console.error("Error deleting view:", error)
    }
  }
  const handleCancelDelete = () => {
    setIsModalOpen(false)
    setViewToDelete(null)
  }

  // ----- Sort the Views for Sidebar (grid first, then alpha) -----
  const sortedViews = useMemo(() => {
    const defaultView = views.filter((v) => v.viewName === "grid")
    const otherViews = views
      .filter((v) => v.viewName !== "grid")
      .sort((a, b) => a.viewName.localeCompare(b.viewName))
    return [...defaultView, ...otherViews]
  }, [views])

  // ----- Modal Outside Click Handler -----
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsModalOpen(false)
        setViewToDelete(null)
      }
    }
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isModalOpen])

  // ----- Render -----
  return (
    <SidebarProvider>
      {/* Sidebar with sub-menu items for each view */}
      <Sidebar className="h-full bg-neutral-100 border-r border-neutral-200">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                {/* Example brand/heading in the sidebar header */}
                <div className="flex items-center gap-2">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Grid className="size-4" />
                  </div>
                  <div className="leading-none">
                    <span className="font-semibold text-neutral-800">
                      All Views
                    </span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <span className="font-medium text-neutral-800 cursor-default">
                    Views
                  </span>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {sortedViews.map((view) => (
                    <SidebarMenuSubItem key={view.id}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={view.id === currentViewId}
                      >
                        <button
                          className="flex w-full items-center justify-between gap-2"
                          onClick={() => {
                            window.localStorage.setItem(
                              `${resource}-viewId`,
                              view.id.toString()
                            )
                            fetchViewData(view.id)
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {view.viewName === "grid" ? (
                              <Grid className="w-5 h-5" />
                            ) : (
                              <BarChart2 className="w-5 h-5" />
                            )}
                            <span>{view.viewName}</span>
                          </div>
                          {view.viewName !== "grid" && (
                            <Trash2
                              className="w-5 h-5 text-red-500 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteClick(view)
                              }}
                            />
                          )}
                        </button>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarRail />
      </Sidebar>

      {/* The main content area, with the toggle button in the header */}
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-3">
          {/* Toggle button for the sidebar */}
          <SidebarTrigger />

          <Separator orientation="vertical" className="mx-2 h-6" />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">{pageTitle}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>All Data</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Only show "Save View" if something changed */}
          {isModified && (
            <button
              type="button"
              onClick={handleSaveView}
              className="ml-auto bg-brand text-white font-semibold py-2 px-4 rounded-md shadow-premium hover:bg-brand-light transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-dark"
            >
              Save View
            </button>
          )}
        </header>

        <div className="flex-1 flex flex-col py-4 px-4 overflow-auto relative bg-neutral-50">
          {/* Filter bar */}
          <FilterComponentNew
            resource={resource}
            pageTitle={pageTitle}
            filterConfig={currentFilterConfig}
            onFilterChange={(newFilterConfig) => {
              setPage(1)
              setCurrentFilterConfig(newFilterConfig)
            }}
            page={page}
            pageSize={pageSize}
            totalPages={Math.ceil(totalRecords / pageSize)}
            handlePageChange={(newPage, newPageSize) => {
              if (newPage) setPage(newPage)
              if (newPageSize) setPageSize(newPageSize)
            }}
            currentViewName={currentViewName}
            setCurrentViewName={setCurrentViewName}
            availableColumnsTypes={availableColumns}
          />

          {/* Data Table */}
          <div className="relative mt-4 flex-1 rounded-lg shadow-premium overflow-hidden w-full h-full bg-white">
            <DataTableNew
              data={tableData}
              availableColumns={Object.keys(availableColumns)}
              loading={loading}
              error={error}
              resource={resource}
              handleDataChange={(data) => {
                setTableData(data)
              }}
              handleTotalRecordsChange={() => {
                setTotalRecords((prev) => prev - 1)
              }}
            />
            {/* Watermark */}
            <img
              src="./image.png"
              alt="Watermark"
              className="absolute inset-0 w-full h-full object-cover opacity-5 pointer-events-none"
            />
            {/* Error Alert */}
            {error && (
              <div className="absolute top-4 left-4 bg-red-100 text-red-700 px-4 py-2 rounded-md shadow-lg z-20">
                {error}
              </div>
            )}
            {/* Record Count */}
            <div className="absolute top-3 right-5 bg-neutral-200 text-neutral-800 px-4 py-1 rounded-md shadow-lg z-10">
              Fetched {totalRecords} records.
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Deletion Confirmation Modal (uses framer-motion) */}
      {isModalOpen && viewToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            ref={modalRef}
            className="bg-white rounded-lg p-6 w-80 shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-neutral-800">
                Confirm Deletion
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-500 hover:text-neutral-700 focus:outline-none"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-neutral-700 mb-4">
              Are you sure you want to delete the view "
              <span className="font-bold">{viewToDelete.viewName}</span>"? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-neutral-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-800"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </SidebarProvider>
  )
}

export default DataPageNew
