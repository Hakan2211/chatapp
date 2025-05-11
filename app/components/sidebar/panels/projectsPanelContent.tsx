import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from '#/components/ui/sidebar';

import { ProjectTreeItem } from '#/components/sidebar/projectsTree/projectTreeItem';
import type { ProjectWithChildren } from '#/lib/project-tree-utils';
import { Button } from '#/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AddItemPopover } from '#/components/ui/custom/AddItemPopover';
import { useState } from 'react';

interface ProjectsPanelContentProps {
  rootProjects: ProjectWithChildren[];
  handleOpenAddNewSubProjectModal: (parentId: string) => void;
  handleOpenRenameProjectModal: (project: ProjectWithChildren) => void;
  handleDeleteProject: (projectId: string, projectName: string) => void;
  handleAddChatToProject: (projectId: string) => void; //this might navigate to a new route.
}

export function ProjectsPanelContent({
  rootProjects,
  handleDeleteProject,
  handleAddChatToProject,
}: ProjectsPanelContentProps) {
  // Initialize state with the passed projects data

  const [isNewRootProjectPopoverOpen, setIsNewRootProjectPopoverOpen] =
    useState(false);

  return (
    <>
      {/* Make the main container scrollable */}
      <SidebarGroup className="flex-1 overflow-y-auto py-2">
        <SidebarGroupContent>
          {/* Use SidebarMenu for the root level */}
          <SidebarMenu>
            {rootProjects && rootProjects.length > 0 ? (
              rootProjects.map((project) => (
                <SidebarMenuItem key={project.id} className="p-0">
                  {/* Use NavLink to navigate to the project's detail/editor */}
                  {/* Adjust the `to` path as per your routing structure */}
                  <ProjectTreeItem
                    key={project.id}
                    project={project}
                    level={0}
                    onDeleteProject={handleDeleteProject}
                    onAddChatToProject={handleAddChatToProject}
                  />
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
      <SidebarGroup className="mt-auto p-4 border-t border-border">
        <AddItemPopover
          itemType="project"
          // parentId is undefined/null for root projects
          triggerElement={
            <Button
              className="w-full rounded-md h-9 text-sm font-medium"
              // onClick={() => setIsNewRootProjectPopoverOpen(true)} // PopoverTrigger handles this
            >
              <PlusCircle className="h-4 w-4 mr-2" /> New Project
            </Button>
          }
          onOpenChange={setIsNewRootProjectPopoverOpen}
          popoverSide="top" // Adjust as needed
          popoverAlign="center"
          titleText="Create New Project"
        />
      </SidebarGroup>

      {/* Keep the "New Project/File" button, but maybe rename it */}
      {/* <SidebarGroup className="mt-auto p-4 border-t border-[var(--sidebar-border-color)]">
        <Button
          className="w-full rounded-md h-9 text-sm font-medium"
          onClick={() => console.log('Trigger New Project Action')} // Implement the actual action
        >
          <PlusCircle className="h-4 w-4 mr-2" /> New Project
        </Button>
      </SidebarGroup> */}
    </>
  );
}
