import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { Trash2, Grid, BarChart2, X } from "lucide-react";
import { View } from "../../../../shared/src/types";

// Shadcn sidebar components
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInput,
} from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label";

interface ViewSidebarNewProps {
  resource: string;
  views: Array<{
    id: number;
    viewName: string;
  }>;
  currentViewId: number | null;
  onSelectView: (viewId: number) => void;
  onDeleteView: (view: View) => Promise<void>;
}

const ViewSidebarNew: React.FC<ViewSidebarNewProps> = ({
  views,
  currentViewId,
  onSelectView,
  onDeleteView,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [viewToDelete, setViewToDelete] = useState<View | null>(null);

  // Searching among views
  const [searchQuery, setSearchQuery] = useState<string>("");

  const modalRef = useRef<HTMLDivElement>(null);

  // 1) Sort: "grid" first, then alpha
  const sortedViews = useMemo(() => {
    const defaultView = views.filter((v) => v.viewName === "grid");
    const otherViews = views
      .filter((v) => v.viewName !== "grid")
      .sort((a, b) => a.viewName.localeCompare(b.viewName));
    return [...defaultView, ...otherViews];
  }, [views]);

  // 2) Filter by search
  const filteredViews = useMemo(() => {
    if (!searchQuery.trim()) return sortedViews;
    const lowSearch = searchQuery.toLowerCase();
    return sortedViews.filter((v) =>
      v.viewName.toLowerCase().includes(lowSearch)
    );
  }, [searchQuery, sortedViews]);

  // Close modal on outside click
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
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

  // ---------------
  // Handlers
  // ---------------
  const handleSelectView = (viewId: number) => {
    onSelectView(viewId);
  };

  const handleDeleteClick = (view: View) => {
    setViewToDelete(view);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!viewToDelete) return;
    try {
      await onDeleteView(viewToDelete);
      setIsModalOpen(false);
      setViewToDelete(null);
    } catch (error) {
      console.error("Error deleting view:", error);
    }
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
    setViewToDelete(null);
  };

  // ---------------
  // Render
  // ---------------
  return (
    <Sidebar className="w-64 shrink-0">
      <SidebarHeader>
        {/* Minimal search input for filtering views */}
        <div className="relative">
          <Label htmlFor="view-search" className="sr-only">
            Search Views
          </Label>
          <SidebarInput
            id="view-search"
            placeholder="Search views..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Views</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredViews.map((view) => (
                <SidebarMenuItem key={view.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={view.id === currentViewId}
                  >
                    <button
                      onClick={() => handleSelectView(view.id)}
                      className="flex w-full items-center gap-2 px-2 py-1 focus:outline-none"
                    >
                      {view.viewName === "grid" ? (
                        <Grid className="w-5 h-5" />
                      ) : (
                        <BarChart2 className="w-5 h-5" />
                      )}
                      <span>
                        {view.viewName === "grid" ? "Default Grid" : view.viewName}
                      </span>
                    </button>
                  </SidebarMenuButton>

                  {/* Delete button for non-grid views */}
                  {view.viewName !== "grid" && (
                    <button
                      onClick={() => handleDeleteClick(view)}
                      className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                      aria-label={`Delete view ${view.viewName}`}
                      title="Delete View"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* This adds a small collapsed rail that appears if the user shrinks the sidebar */}
      <SidebarRail />

      {/* Deletion Confirmation Modal */}
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
              <span className="font-bold">{viewToDelete.viewName}</span>
              "? This action cannot be undone.
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
    </Sidebar>
  );
};

export default memo(ViewSidebarNew);
