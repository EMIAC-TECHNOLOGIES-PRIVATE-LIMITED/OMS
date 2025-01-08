import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from "react"
import { motion } from "framer-motion"
import { View } from "../../../../shared/src/types"
import { Trash2, Grid, BarChart2, X } from "lucide-react"
import {
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

/**
 * Props for ViewSidebarNew.
 */
interface ViewSidebarNewProps {
  resource: string
  views: Array<{
    id: number
    viewName: string
  }>
  currentViewId: number | null
  onSelectView: (viewId: number) => void
  onDeleteView: (view: View) => Promise<void>
}

/**
 * Renders a shadcn-based sidebar for displaying and managing "views".
 */
const ViewSidebarNew: React.FC<ViewSidebarNewProps> = ({
  views,
  currentViewId,
  onSelectView,
  onDeleteView,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [viewToDelete, setViewToDelete] = useState<View | null>(null)

  const modalRef = useRef<HTMLDivElement>(null)

  // Sort views: default "grid" first, then the rest alphabetically
  const sortedViews = useMemo(() => {
    const defaultView = views.filter((v) => v.viewName === "grid")
    const otherViews = views
      .filter((v) => v.viewName !== "grid")
      .sort((a, b) => a.viewName.localeCompare(b.viewName))
    return [...defaultView, ...otherViews]
  }, [views])

  // Handle clicking outside the modal to close it
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false)
        setViewToDelete(null)
      }
    },
    []
  )

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isModalOpen, handleClickOutside])

  // Handle selecting a view
  const handleSelectView = (viewId: number) => {
    onSelectView(viewId)
  }

  // Handle delete button click
  const handleDeleteClick = (view: View) => {
    setViewToDelete(view)
    setIsModalOpen(true)
  }

  // Confirm deletion
  const handleConfirmDelete = async () => {
    if (!viewToDelete) return
    try {
      await onDeleteView(viewToDelete)
      setIsModalOpen(false)
      setViewToDelete(null)
    } catch (error) {
      console.error("Error deleting view:", error)
    }
  }

  // Cancel deletion
  const handleCancelDelete = () => {
    setIsModalOpen(false)
    setViewToDelete(null)
  }

  return (
    <>
      {/* Shadcn Sidebar */}
      <Sidebar className="h-full bg-neutral-100 border-r border-neutral-200">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                {/* You can replace this with any heading, icon, or brand. */}
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
                {/* We treat "Views" as a top-level label. */}
                <SidebarMenuButton asChild>
                  <span className="font-medium text-neutral-800 cursor-default">
                    Views
                  </span>
                </SidebarMenuButton>
                {/* Submenu items: each sorted view. */}
                <SidebarMenuSub>
                  {sortedViews.map((view) => (
                    <SidebarMenuSubItem key={view.id}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={view.id === currentViewId}
                      >
                        <button
                          className="flex w-full items-center justify-between gap-2"
                          onClick={() => handleSelectView(view.id)}
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

      {/* Deletion Confirmation Modal (still uses framer-motion for animation) */}
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
    </>
  )
}

export default memo(ViewSidebarNew)
