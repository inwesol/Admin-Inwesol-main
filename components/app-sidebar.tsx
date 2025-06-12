"use client"

import * as React from "react"
import {
  Command,
  Frame,
  Map,
  PieChart,
  LucideIcon,
} from "lucide-react"

import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Define the project type
interface Project {
  name: string;
  url: string;
  icon: LucideIcon;
}

// Define the data structure
const data: {
  projects: Project[];
} = {
  projects: [
    {
      name: "Partner-Dashboard",
      url: "/partner-dashboard",
      icon: Frame,
    },
    {
      name: "Coach-Dashboard",
      url: "/coach-dashboard",
      icon: Frame,
    },
  ],
}

// Define the component props interface
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

export function AppSidebar({ ...props }: AppSidebarProps) {
  return (
    <Sidebar 
      variant="inset" 
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Inwesol</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}