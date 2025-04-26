import React, { useState, useMemo } from 'react';
import { NavLink, useLoaderData, useLocation } from 'react-router';

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
  useSidebar,
} from '#/components/ui/sidebar';
import UserDropdown from '#/components/layout/user-dropdown';
import {
  FileText,
  Home,
  GraduationCap,
  LayoutGrid,
  Plus,
  User,
} from 'lucide-react';

import { Button } from '#/components/ui/button';
import {
  AccountPanelContent,
  EducationPanelContent,
  HomePanelContent,
  NotesPanelContent,
  ProjectsPanelContent,
} from '#/components/sidebar/panels/sidebarPanels';

import {
  type MockProjectFilesData,
  type Note,
  type HomeProjectItem,
  type ProjectTreeOptions,
} from '#/mockData/mockData';

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

const transformProjectsForHome = (
  data: MockProjectFilesData
): HomeProjectItem[] => {
  // Simple transformation: Takes top-level items, assumes they are projects
  // TODO: This is a basic example; adapt it based on how your actual
  // MockProjectFilesData maps to HomeProjectItem (e.g., extracting options)
  return data.tree
    .map((item, index): HomeProjectItem | null => {
      if (typeof item === 'string') {
        // Handle top-level files if needed, or filter them out
        return null; // Or create a default HomeProjectItem
      }
      // Assuming top-level arrays are projects
      const name = item[0];
      const options =
        typeof item[item.length - 1] === 'object' &&
        !Array.isArray(item[item.length - 1])
          ? (item[item.length - 1] as ProjectTreeOptions)
          : {};
      return {
        id: `project-${name}-${index}`, // Generate a unique ID
        name: name,
        badge: 'Mock', // Add appropriate badge logic
        lastActive: 'Unknown', // Add appropriate lastActive logic
        starred: !!options.starred, // Ensure boolean (handles undefined)
      };
    })
    .filter((p): p is HomeProjectItem => p !== null);
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { projects: nestedProjectsData, notes } = useLoaderData() as {
    projects: MockProjectFilesData;
    notes: Note[];
  };

  const homePanelProjects = useMemo(
    () => transformProjectsForHome(nestedProjectsData),
    [nestedProjectsData]
  );

  const location = useLocation();
  const [selectedPanel, setSelectedPanel] = React.useState<PanelType>(
    PanelType.Home
  );

  React.useEffect(() => {
    const path = location.pathname;
    const matchingIcon = iconBarIcons.find((icon) =>
      path.startsWith(icon.path)
    );
    if (matchingIcon) {
      setSelectedPanel(matchingIcon.type);
    }
  }, [location.pathname]);

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
                    {/* Replace UserDropdown with static content or fetch user data */}
                    <UserDropdown />
                    {/* <span>JD</span> */}
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
                      isActive={item.path === location.pathname}
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
              <SidebarMenuButton
                onClick={() => setSelectedPanel(PanelType.Account)}
              >
                <User className="h-5 w-5" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b border-[var(--sidebar-border-color)] p-4">
          <div className="flex w-full items-center justify-between">
            <span className="font-medium text-base capitalize">
              {selectedPanel}
            </span>
            {selectedPanel === 'projects' && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => console.log('New Project')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            {selectedPanel === 'notes' && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => console.log('New Note')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            {selectedPanel === 'home' && (
              <HomePanelContent projects={homePanelProjects} />
            )}
            {selectedPanel === 'projects' && (
              <ProjectsPanelContent projects={nestedProjectsData} />
            )}
            {selectedPanel === 'notes' && <NotesPanelContent notes={notes} />}
            {selectedPanel === 'education' && <EducationPanelContent />}
            {selectedPanel === 'account' && <AccountPanelContent />}
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}
