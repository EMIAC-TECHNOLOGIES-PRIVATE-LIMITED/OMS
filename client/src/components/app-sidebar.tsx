import * as React from "react";
import { Trash2, Grid, BarChart2 } from "lucide-react";
import { SearchForm } from "@/components/search-form";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

import { ChevronsLeftRightEllipsis } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSetRecoilState } from "recoil";
import { showFabAtom } from "@/store/atoms/atoms";

interface View {
  id: number;
  viewName: string;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  views: Array<{ id: number; viewName: string }>;
  currentViewId: number | null;
  onSelectView: (viewId: number) => void;
  handleConfirmDelete: (view: View) => Promise<void>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export function AppSidebar({
  views,
  currentViewId,
  onSelectView,
  handleConfirmDelete,
  searchQuery,
  setSearchQuery,
  ...props
}: AppSidebarProps) {
  const setShowFab = useSetRecoilState(showFabAtom);

  const sortedViews = React.useMemo(() => {
    const defaultView = views.filter((v) => v.viewName === "grid");
    const otherViews = views
      .filter((v) => v.viewName !== "grid")
      .sort((a, b) => a.viewName.localeCompare(b.viewName));
    return [...defaultView, ...otherViews];
  }, [views]);

  const filteredViews = React.useMemo(() => {
    if (!searchQuery.trim()) return sortedViews;
    const lower = searchQuery.toLowerCase();
    return sortedViews.filter((v) => v.viewName.toLowerCase().includes(lower));
  }, [searchQuery, sortedViews]);

  // Handler for AlertDialog open state changes
  const handleDialogOpenChange = (open: boolean) => {
    setShowFab(!open); // Hide FAB when dialog is open, show when closed
  };

  return (
    <Sidebar {...props} className="p-0 h-[93vh] border-2 ">
      <SidebarHeader className="p-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              className="font-medium text-base mt-2 text-gray-800 flex items-center bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-100 transition-colors duration-200 w-full"
            >
              <ChevronsLeftRightEllipsis className="w-5 h-5 text-gray-600 mr-2" />
              <span>Views</span>
            </TooltipTrigger>

            <TooltipContent>
              <p className="italic text-sm">
                Press <kbd>Ctrl</kbd> + <kbd>b</kbd> to toggle.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <SearchForm
          placeholder="Search views..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Views</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredViews.map((view) => (
                <SidebarMenuItem
                  className={cn(
                    "flex items-center gap-2 w-full px-2 py-1 rounded-lg transition-colors duration-200 ease-in-out",
                    view.id === currentViewId ? "bg-slate-100 text-gray-950 font-medium transition-colors duration-200 ease-in-out" : "hover:bg-slate-100 transition-colors duration-200 ease-in-out"
                  )}
                  key={view.id}
                >
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => onSelectView(view.id)}
                      className="flex items-center gap-2 w-full"
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

                  {view.viewName !== "grid" && (
                    <AlertDialog onOpenChange={handleDialogOpenChange}>
                      <AlertDialogTrigger>
                        <Button variant="ghost" size="sm" className="p-1">
                          <Trash2 className="w-5 h-5 red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. It will permanently delete this view.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            className="bg-white border border-black t font-bold  rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-white border border-red-800 text-red-800 font-bold hover:bg-red-100 rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
                            onClick={() => handleConfirmDelete(view)}
                          >
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}