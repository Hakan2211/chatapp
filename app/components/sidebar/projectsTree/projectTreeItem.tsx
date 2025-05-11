import { useState } from 'react';
import { NavLink } from 'react-router';
import { cn } from '#/lib/utils';
import {
  Folder,
  Star,
  ChevronRight,
  ChevronDown,
  MessageSquarePlus,
  MoreHorizontal,
} from 'lucide-react';
import type { ProjectWithChildren } from '#/lib/project-tree-utils';
import { SidebarMenu, SidebarMenuItem } from '#/components/ui/sidebar';
import { MAX_PROJECT_NESTING_DEPTH } from '#/lib/project-tree-utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '#/components/ui/dropdown-menu';

import { RenameItemPopover } from '#/components/ui/custom/RenameItemPopover';
import { AddItemPopover } from '#/components/ui/custom/AddItemPopover';

interface ProjectTreeItemProps {
  project: ProjectWithChildren;
  level: number;
  onDeleteProject: (projectId: string, projectName: string) => void;
  onAddChatToProject: (projectId: string) => void;
}

export function ProjectTreeItem({
  project,
  level,
  onDeleteProject,
  onAddChatToProject,
}: ProjectTreeItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRenamePopoverOpen, setIsRenamePopoverOpen] = useState(false);
  const [isAddSubProjectPopoverOpen, setIsAddSubProjectPopoverOpen] =
    useState(false);

  const hasChildren = project.children && project.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const canCreateSubProject = level < MAX_PROJECT_NESTING_DEPTH;

  // The NavLink itself will be the direct content of the <li> (SidebarMenuItem)
  // that wraps this ProjectTreeItem instance.
  return (
    <>
      {/* The NavLink (the clickable item itself) */}
      <div className="group flex items-center w-full relative">
        <NavLink
          to={`/projects/${project.id}`}
          end
          className={({ isActive, isPending }) =>
            cn(
              'flex w-full text-[var(--sidebar-text-color)] items-center text-sm rounded-md group',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isActive
                ? 'bg-black/5 dark:bg-white/10'
                : 'hover:bg-sidebar-accent dark:hover:bg-sidebar-accent-dark',
              isPending ? 'opacity-70' : ''
            )
          }
          style={{
            paddingLeft: `${0.5 + level * 1.25}rem`,
            paddingRight: `0.5rem`,
            paddingTop: `0.375rem`,
            paddingBottom: `0.375rem`,
          }}
        >
          {({ isActive }) => (
            <>
              <button
                type="button"
                onClick={hasChildren ? handleToggle : undefined}
                className={cn(
                  'flex-shrink-0 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none',
                  hasChildren
                    ? 'opacity-100'
                    : 'opacity-0 cursor-default pointer-events-none'
                )}
                aria-label={
                  hasChildren
                    ? isOpen
                      ? `Collapse ${project.name}`
                      : `Expand ${project.name}`
                    : undefined
                }
                aria-expanded={hasChildren ? isOpen : undefined}
              >
                {hasChildren ? (
                  isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )
                ) : (
                  <span className="inline-block w-4 h-4" />
                )}
              </button>
              <div className="ml-1 mr-1.5 flex-shrink-0">
                {project.starred ? (
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                ) : (
                  <Folder
                    className={cn(
                      'h-4 w-4 text-gray-500 dark:text-gray-400',
                      isActive && 'text-sky-500 dark:text-sky-500'
                    )}
                  />
                )}
              </div>
              <span className="truncate flex-1 font-medium">
                {project.name}
              </span>
            </>
          )}
        </NavLink>
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddChatToProject(project.id);
            }}
            className="p-1 rounded hover:bg-muted focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label={`Add new chat to ${project.name}`}
            title="Add new chat"
          >
            <MessageSquarePlus className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="p-1 rounded hover:bg-muted focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label={`More actions for ${project.name}`}
                title="More actions"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              onClick={(e) => e.stopPropagation()}
              className="w-48"
            >
              <AddItemPopover
                itemType="project"
                parentId={project.id}
                triggerElement={
                  <DropdownMenuItem
                    disabled={!canCreateSubProject}
                    onSelect={(e) => {
                      e.preventDefault(); // Prevent DropdownMenuItem default behavior of closing
                      if (canCreateSubProject)
                        setIsAddSubProjectPopoverOpen(true);
                    }}
                    className={
                      !canCreateSubProject
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer'
                    }
                  >
                    New Sub-Project
                    {!canCreateSubProject && (
                      <span className="text-xs ml-auto opacity-70">
                        (Limit Reached)
                      </span>
                    )}
                  </DropdownMenuItem>
                }
                onOpenChange={setIsAddSubProjectPopoverOpen} // Sync state
                popoverSide="right"
                popoverAlign="start"
              />

              {/* Rename Project using RenameItemPopover */}
              <RenameItemPopover
                itemId={project.id}
                currentName={project.name}
                itemType="project"
                triggerElement={
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault(); // Important!
                      setIsRenamePopoverOpen(true);
                    }}
                    className="cursor-pointer"
                  >
                    Rename
                  </DropdownMenuItem>
                }
                onOpenChange={setIsRenamePopoverOpen} // Sync state
                popoverSide="right"
                popoverAlign="start"
              />

              <DropdownMenuItem
                onClick={() => onAddChatToProject(project.id)}
                className="cursor-pointer"
              >
                New Chat
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDeleteProject(project.id, project.name)}
                className="text-destructive focus:text-destructive-foreground focus:bg-destructive cursor-pointer"
              >
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* If there are children and the item is open, render a NEW SidebarMenu (ul) for them.
          This <ul> will be a sibling to the NavLink above, both within the parent <li>.
          Or, more accurately, this <ul> becomes a child of the <li> that this ProjectTreeItem
          instance is rendered into.
      */}
      {hasChildren && isOpen && (
        <SidebarMenu className="pl-0">
          {' '}
          {/* Use SidebarMenu for styling, remove default padding if needed */}
          {project.children.map((childProject) => (
            // Each child project is now a SidebarMenuItem (li) directly in this new SidebarMenu (ul)
            <SidebarMenuItem key={childProject.id} className="p-0 w-full">
              {/* Recursively render ProjectTreeItem, which will contain the NavLink for the child */}
              <ProjectTreeItem
                project={childProject}
                level={level + 1}
                onDeleteProject={onDeleteProject}
                onAddChatToProject={onAddChatToProject}
              />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      )}
    </>
  );
}
