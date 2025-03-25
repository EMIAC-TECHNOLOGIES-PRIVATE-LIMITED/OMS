import * as React from "react"
import {
  ActivitySquare,
  UserCheck,
  ShieldCheck,
  CircleUserRoundIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Monitor Activity",
    url: "/dashboard/activity",
    icon: ActivitySquare,
    isActive: true,
    items: [
      {
        title: "User Activity Monitor",
        url: "/dashboard/stats/users",
      },
      {
        title: "System Performance Monitor",
        url: "/dashboard/stats/system",
      }
    ],
  },
  {
    title: "Manage Role Access",
    url: "/dashboard/manageroles",
    icon: ShieldCheck,
    items: [
      {
        title: "All Roles",
        url: "/dashboard/manageroles",
      }
    ],
  },
  {
    title: "Manage User Access",
    url: "/dashboard/manageusers",
    icon: UserCheck,
    items: [
      {
        title: "All  Users",
        url: "/dashboard/manageusers",
      },

    ],
  }
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
     <Sidebar collapsible="icon"{...props}>
      <SidebarHeader>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mt-2"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground ">
              < CircleUserRoundIcon className="size-6 mt-1" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold mt-1">
                Admin Dashboard
              </span>
            </div>
          </SidebarMenuButton>
        
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}