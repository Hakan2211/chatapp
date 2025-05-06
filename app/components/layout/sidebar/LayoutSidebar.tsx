import {
  HomePanelContent,
  ProjectsPanelContent,
  NotesPanelContent,
  EducationPanelContent,
  AccountPanelContent,
} from '#/components/sidebar/panels/sidebarPanels';
import type { Button } from '#/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '#/components/ui/sidebar';
import notes from '#/routes/dashboard/notes/notes';
import projects from '#/routes/dashboard/projects/projects';
import type {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@radix-ui/react-tooltip';
import {
  FileText,
  GraduationCap,
  Home,
  LayoutGrid,
  Plus,
  User,
} from 'lucide-react';
import React from 'react';
import { NavLink, Outlet } from 'react-router';
import UserDropdown from './user-dropdown';

enum PanelType {
  Account = 'account',
  Home = 'home',
  Projects = 'projects',
  Notes = 'notes',
  Education = 'education',
}

const iconSize = 'h-5 w-5';

const iconBarIcons = [
  {
    type: PanelType.Home,
    label: 'Home',
    icon: <Home className={iconSize} />,
    path: '/dashboard',
  },
  {
    type: PanelType.Projects,
    label: 'Projects',
    icon: <LayoutGrid className={iconSize} />,
    path: '/projects',
  },
  {
    type: PanelType.Notes,
    label: 'Notes',
    icon: <FileText className={iconSize} />,
    path: '/notes',
  },
  {
    type: PanelType.Education,
    label: 'Education',
    icon: <GraduationCap className={iconSize} />,
    path: '/education',
  },
];

function LayoutSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row border-[var(--sidebar-border-color)]"
      {...props}
    >
      <Sidebar
        collapsible="none"
        className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r border-[var(--sidebar-border-color)] flex flex-col"
      >
        <SidebarHeader className="mt-2">
          <SidebarMenu>
            <SidebarMenuItem className="">
              <SidebarMenuButton
                asChild
                className="!p-0 group-data-[collapsible=icon]:p-0! "
                tooltip={{
                  children: 'My Account',
                  side: 'right',
                  sideOffset: 10,
                }}
              >
                <div>
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground rounded-lg">
                    <UserDropdown />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">John Doe</span>
                    <span className="truncate text-xs">Free</span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="items-center">
          <SidebarGroup>
            <SidebarGroupContent className="">
              <SidebarMenu className="flex flex-col gap-2">
                {iconBarIcons.map((item) => (
                  <SidebarMenuItem className="cursor-pointer" key={item.label}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.label,
                        side: 'right',
                        sideOffset: 10,
                      }}
                      isActive={
                        item.type === PanelType.Projects
                          ? location.pathname.startsWith('/projects') // Active for /projects and child routes
                          : location.pathname === item.path
                      }
                      asChild
                    >
                      <NavLink
                        className="cursor-pointer block"
                        to={item.path}
                        end={item.path === '/dashboard'}
                      >
                        {React.cloneElement(item.icon, {
                          className: iconSize,
                        })}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <User className="h-5 w-5" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b border-[var(--sidebar-border-color)] p-4">
          Hello
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <Outlet />
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}

export default LayoutSidebar;
