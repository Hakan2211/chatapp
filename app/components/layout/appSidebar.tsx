// src/components/layout/appSidebar.tsx
import React, { useState, useEffect } from 'react';
import {
  Sidebar as ShadcnSidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '~/components/ui/sidebar';
import HomeIcon from '../icons/homeIcon';
import SettingsIcon from '../icons/settingsIcon';
import UsersIcon from '../icons/usersIcon';
import BookLockIcon from '../icons/bookLockIcon';
import { cn } from '~/lib/utils';
import { NavLink } from 'react-router';

interface AppSidebarProps {
  onClose?: () => void;
}

// Helper component to handle hydration-safe active class
function HydrationSafeNavLink({
  to,
  className: baseClassName,
  children,
  onClick,
  ...props
}: React.ComponentProps<typeof NavLink> & {
  className:
    | string
    | ((props: {
        isActive: boolean;
        isPending: boolean;
      }) => string | undefined);
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <NavLink
      to={to}
      className={({ isActive, isPending }) => {
        // Calculate the base class string (safe for server and client initial render)
        const resolvedBaseClassName =
          typeof baseClassName === 'function'
            ? baseClassName({ isActive: false, isPending: false }) // Provide default values for initial render
            : baseClassName;

        // Apply active class ONLY if mounted and actually active
        return cn(
          resolvedBaseClassName,
          isMounted && isActive ? 'bg-gray-200' : '' // Apply active class only after mount
        );
      }}
      onClick={onClick}
      {...props}
    >
      {children}
    </NavLink>
  );
}

export default function AppSidebar({ onClose }: AppSidebarProps) {
  const navItems = [
    // ... your navItems array
    { name: 'Home', path: '/', icon: <HomeIcon className="h-5 w-5" /> },
    {
      name: 'Private Rooms',
      path: '/dashboard/private',
      icon: <BookLockIcon className="h-5 w-5" />,
    },
    {
      name: 'Public Rooms',
      path: '/dashboard/public',
      icon: <UsersIcon className="h-5 w-5" />,
    },
    {
      name: 'Settings',
      path: '/dashboard/settings',
      icon: <SettingsIcon className="h-5 w-5" />,
    },
  ];

  return (
    <ShadcnSidebar className="w-64  border-r-0 bg-gray-800">
      <SidebarHeader className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">LearnTogether</h2>
      </SidebarHeader>
      <SidebarMenu className="p-4">
        {navItems.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              {/* Use the helper component */}
              <HydrationSafeNavLink
                to={item.path}
                // Provide the base class string - REMOVE the isActive logic from here
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
                onClick={onClose}
              >
                {item.icon}
                <span>{item.name}</span>
              </HydrationSafeNavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </ShadcnSidebar>
  );
}
