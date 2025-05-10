import { Button } from '#/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
} from '#/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip';
import { Plus } from 'lucide-react';
import type { JSX } from 'react';
import { PanelType } from '#/components/layout/sidebar/navigationSidebar';

export default function ContentSidebar({
  content,
  activePanelType,
}: {
  content: JSX.Element;
  activePanelType: PanelType;
}) {
  return (
    <Sidebar collapsible="none" className="hidden flex-1 md:flex">
      <SidebarHeader className="gap-3.5 border-b border-[var(--sidebar-border-color)] p-4">
        <div className="flex w-full items-center justify-between">
          <span className="font-medium text-base capitalize">
            {activePanelType}
          </span>
          {activePanelType === PanelType.Projects && (
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
          {activePanelType === PanelType.Notes && (
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
  );
}
