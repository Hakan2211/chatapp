import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarFooter,
} from '#/components/ui/sidebar';
import { Sidebar } from '#/components/ui/sidebar';
import { cloneElement, useEffect, useState } from 'react';
import UserDropdown from '#/components/layout/sidebar/user-dropdown';
import {
  Home,
  LayoutGrid,
  FileText,
  GraduationCap,
  User as UserIcon,
} from 'lucide-react';
import { NavLink, useLocation, useLoaderData } from 'react-router';
import type { User } from '#/types/appTypes';

export enum PanelType {
  Account = 'account',
  Home = 'home',
  Projects = 'projects',
  Notes = 'notes',
  Education = 'education',
}

const iconSize = 'h-5 w-5';

export const iconBarIcons = [
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

export interface NavigationSidebarProps {
  onPanelSelect: (panelType: PanelType) => void;
  user: User;
}

export default function NavigationSidebar({
  onPanelSelect,
  user,
}: NavigationSidebarProps) {
  const location = useLocation();
  const [selectedPanel, setSelectedPanel] = useState<PanelType>(PanelType.Home);

  useEffect(() => {
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
                  <UserDropdown user={user} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user.name || user.username}
                  </span>
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
                      end={
                        item.path === '/dashboard' || item.path === '/education'
                      }
                    >
                      {cloneElement(item.icon, {
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
            <SidebarMenuButton onClick={() => onPanelSelect(PanelType.Account)}>
              <UserIcon className="h-5 w-5" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
