import * as React from "react";
import { ChevronsLeftRightEllipsis, Notebook, Trash2 } from "lucide-react";
import { useRecoilValue } from "recoil";
import { authAtom } from "@/store/atoms/atoms";

import { IndianRupee, Copy, Computer, Link, Cable } from 'lucide-react';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Utility from your project to merge class names
import { cn } from "@/lib/utils";

import { toolsMapping } from "@/utils/toolsMapping/toolsMapping";

interface SideBarProps extends React.ComponentProps<typeof Sidebar> {
  // If you're using local state or query params, add what you need here
  activeToolKey: string | null;
  setActiveToolKey?: (key: string) => void;
}

export function SideBar({ activeToolKey, setActiveToolKey, ...props }: SideBarProps) {
  const authData = useRecoilValue(authAtom);
  const permissions = authData?.userInfo?.permissions?.map((p) => p.name) || [];

  // Filter user permissions for those starting with "_tools_"
  const allowedTools = permissions.filter((perm) => perm.startsWith("_tools_"));

  // Build the list of tools from your mapping
  const tools = toolsMapping.filter((toolObj) => {
    const key = Object.keys(toolObj)[0];
    return allowedTools.includes(key);
  });

  // Handling item click (if using local state)
  function handleToolClick(key: string) {
    if (setActiveToolKey) {
      setActiveToolKey(key);
    }

  }

  return (
    <Sidebar {...props} className="p-0">
      {/* Header with the same “ChevronsLeftRightEllipsis” approach */}
      <SidebarHeader className="p-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              className="font-medium text-base mt-2 text-gray-800 flex items-center
                         bg-gray-100 border border-gray-200 rounded-xl px-3 py-2
                         hover:bg-gray-100 transition-colors duration-200 w-full"
              onClick={() => setActiveToolKey?.("")}
            >
              <ChevronsLeftRightEllipsis className="w-5 h-5 text-gray-600 mr-2" />
              <span>Tools</span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="italic text-sm">
                Press <kbd>Ctrl</kbd> + <kbd>b</kbd> to toggle.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Available Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tools.map((toolObj) => {
                const key = Object.keys(toolObj)[0];
                const title = (toolObj as unknown as Record<string, string>)[key];
                const isActive = key === activeToolKey;



                return (
                  <SidebarMenuItem
                    key={key}
                    className={cn(
                      // Base style from “Views” approach
                      "flex items-center gap-2 w-full px-2 py-1 rounded-lg transition-colors duration-200 ease-in-out",
                      // Active vs. hover states
                      isActive
                        ? "bg-slate-100 text-gray-950 font-medium"
                        : "hover:bg-slate-100"
                    )}
                  >
                    <SidebarMenuButton asChild>
                      <button
                        className="flex items-center gap-2 w-full text-left"
                        onClick={() => handleToolClick(key)}
                      >

                        {(title === "Price Lookup" && <IndianRupee className="w-5 h-5" />) ||
                          (title === "Vendor Lookup" && <Computer className="w-5 h-5" />) ||
                          (title === "Duplicate Domain Lookup" && <Copy className="w-5 h-5" />) ||
                          (title === "URL Sanitizer" && <Link className="w-5 h-5" />) ||
                          (title === "Category Links Fetcher" && <Cable className="w-5 h-5" />) ||
                          (title === "Niche Domains" && <Notebook className="w-5 h-5" />) ||
                          (title === "Add Non-Responsive Domains" && <Trash2 className="w-5 h-5" />)}
                        <span>{title}</span>
                      </button>
                    </SidebarMenuButton>

                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
