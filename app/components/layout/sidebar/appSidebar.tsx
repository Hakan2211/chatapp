import React, { type JSX } from 'react';
import { NavLink, useLocation } from 'react-router';

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
import UserDropdown from '#/components/layout/sidebar/user-dropdown';
import {
  FileText,
  Home,
  GraduationCap,
  LayoutGrid,
  Plus,
  User,
} from 'lucide-react';

import { Button } from '#/components/ui/button';

import { type HomeProjectItem } from '#/mockData/mockData';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '#/components/ui/tooltip';

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
  projectsData: Project[] | undefined
): HomeProjectItem[] => {
  // Guard clause: If projectsData is null, undefined, or empty, return an empty array
  if (!projectsData || projectsData.length === 0) {
    return [];
  }

  // Now map directly over the array of Project objects
  return projectsData.map((project): HomeProjectItem => {
    return {
      id: project.id, // Use the actual project ID
      name: project.name,
      // --- Determine these values based on your Project model ---
      badge: 'Live', // Example: maybe based on a status field?
      lastActive: project.createdAt.toLocaleString(), // Example: format the date
      starred: !!project.starred, // Example: if you have a starred field
      // --- Add other fields as needed ---
    };
  });
};

type Project = {
  id: string;
  name: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: string;
  parentId: string | null;
  // Add any other relevant fields (e.g., starred, description)
  starred?: boolean;
};

export function AppSidebar({ content, ...props }: { content: JSX.Element }) {
  // const { projects, notes } = useLoaderData() as {
  //   projects: Project[];
  //   notes: Note[];
  // };

  const location = useLocation();
  const [selectedPanel, setSelectedPanel] = React.useState<PanelType>(
    PanelType.Home
  );

  React.useEffect(() => {
    const path = location.pathname;
    const matchingIcon = iconBarIcons.find((icon) => {
      if (icon.type === PanelType.Projects) {
        // Consider /projects and any child routes (/projects/*) as active
        return path.startsWith('/projects');
      }
      return path.startsWith(icon.path);
    });
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
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
                      onClick={() => console.log('New Project')}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add new project</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
          <SidebarGroup className="px-0">{content}</SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}
