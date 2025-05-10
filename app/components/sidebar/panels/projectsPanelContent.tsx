import { Button } from '#/components/ui/button';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '#/components/ui/sidebar';
import { cn } from '#/lib/utils';
import { Folder, Star, PlusCircle } from 'lucide-react';
import { NavLink } from 'react-router';
import type { Project } from '#/types/appTypes';

interface ProjectsPanelContentProps {
  projects: Project[];
}

export function ProjectsPanelContent({ projects }: ProjectsPanelContentProps) {
  // Initialize state with the passed projects data

  return (
    <>
      {/* Make the main container scrollable */}
      <SidebarGroup className="flex-1 overflow-y-auto py-2">
        <SidebarGroupContent>
          {/* Use SidebarMenu for the root level */}
          <SidebarMenu>
            {projects && projects.length > 0 ? (
              projects.map((project) => (
                <SidebarMenuItem key={project.id} className="p-0">
                  {/* Use NavLink to navigate to the project's detail/editor */}
                  {/* Adjust the `to` path as per your routing structure */}
                  <NavLink
                    to={`/projects/${project.id}`} // Example path
                    className={(
                      { isActive } // Use NavLink's isActive
                    ) =>
                      cn(
                        'block w-full' // Make the link fill the item
                        // Remove default NavLink styling if SidebarMenuButton handles it
                      )
                    }
                    // Prevent NavLink default style interfering with Button style
                    style={({ isActive }) => ({
                      textDecoration: 'none',
                      color: 'inherit',
                    })}
                  >
                    {(
                      { isActive } // Get isActive from NavLink render prop
                    ) => (
                      <SidebarMenuButton
                        className={cn(
                          'w-full justify-start px-4 py-2 text-sm', // Standard button styling
                          isActive
                            ? 'bg-black/5 dark:bg-white/10 text-primary'
                            : 'hover:bg-black/[.03] dark:hover:bg-white/[.03]' // Active/hover states
                        )}
                        // Remove onClick if navigation is handled by NavLink
                        // Add group/item if needed for hover actions on project level later
                      >
                        {project.starred ? (
                          <Star className="h-3.5 w-3.5 mr-2 text-amber-400 fill-amber-400 flex-shrink-0" />
                        ) : (
                          // Use Folder icon or a placeholder for alignment
                          <Folder className="h-3.5 w-3.5 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                          // <span className="w-3.5 h-3.5 mr-2 flex-shrink-0"></span> // Alternative placeholder
                        )}
                        <span className="truncate flex-1 font-medium">
                          {project.name}
                        </span>
                        {/* Add project-level actions (e.g., delete, rename buttons) here if needed */}
                        {/* Example: <ProjectActions project={project} /> */}
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No projects found. <br />
                Click 'New Project' to create one.
              </div>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Keep the "New Project/File" button, but maybe rename it */}
      <SidebarGroup className="mt-auto p-4 border-t border-[var(--sidebar-border-color)]">
        <Button
          className="w-full rounded-md h-9 text-sm font-medium"
          onClick={() => console.log('Trigger New Project Action')} // Implement the actual action
        >
          <PlusCircle className="h-4 w-4 mr-2" /> New Project
        </Button>
      </SidebarGroup>
    </>
  );
}
