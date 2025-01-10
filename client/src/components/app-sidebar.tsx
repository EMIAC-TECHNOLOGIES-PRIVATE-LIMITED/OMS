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

interface View {
  id: number;
  viewName: string;
}

// Props for hooking up dynamic “views” logic
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  views: Array<{ id: number; viewName: string }>;
  currentViewId: number | null;
  onSelectView: (viewId: number) => void;
  handleConfirmDelete: (view: View) => void;
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
  // Sort “grid” first, then alphabetical
  const sortedViews = React.useMemo(() => {
    const defaultView = views.filter((v) => v.viewName === "grid");
    const otherViews = views
      .filter((v) => v.viewName !== "grid")
      .sort((a, b) => a.viewName.localeCompare(b.viewName));
    return [...defaultView, ...otherViews];
  }, [views]);

  // Filter by search
  const filteredViews = React.useMemo(() => {
    if (!searchQuery.trim()) return sortedViews;
    const lower = searchQuery.toLowerCase();
    return sortedViews.filter((v) => v.viewName.toLowerCase().includes(lower));
  }, [searchQuery, sortedViews]);

  console.log("The received current view id is: ", currentViewId);

  return (
    <Sidebar {...props} className="p-0"> {/* Remove padding from the Sidebar */}
      <SidebarHeader className="p-0"> {/* Remove padding from SidebarHeader */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              className="font-medium text-base mt-2 text-gray-800 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-100 transition-colors duration-200 w-full"
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

        {/* Search form for filtering “views” */}
        <SearchForm
          placeholder="Search views..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
      </SidebarHeader>

      <SidebarContent>
        {/* Single Group: “Views” */}
        <SidebarGroup>
          <SidebarGroupLabel>Views</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredViews.map((view) => (

                <SidebarMenuItem
                  className="flex items-center gap-2 w-full px-2 py-1 hover:bg-slate-100 rounded-lg"
                  key={view.id}
                >
                  <SidebarMenuButton asChild isActive={view.id === currentViewId}>
                    <button
                      onClick={() => onSelectView(view.id)}
                      className={cn(
                        view.id === currentViewId && "bg-red-200 text-gray-800 font-medium",
                        "flex items-center gap-2 w-full px-2 py-1 hover:bg-slate-100 rounded-lg",
                      )}
                      data-active={view.id === currentViewId}
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


                  {/* Optional delete button for non-grid views */}
                  {view.viewName !== "grid" && (
                    <AlertDialog>
                      <AlertDialogTrigger>
                        <Button
                          variant="ghost"
                          className=""
                          size="sm"
                        >
                          <Trash2 className="w-5 h-5 red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will
                            permanently delete and remove the data from our
                            servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-white border border-brand text-brand font-bold hover:bg-brand-light/20 hover:text-brand-dark 
                 dark:border-brand-dark dark:text-brand-dark dark:hover:bg-brand-dark/10 
                 rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
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
