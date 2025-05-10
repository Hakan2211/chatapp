// src/routes/dashboard/projects/ProjectWorkspaceLayout.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate, NavLink } from 'react-router'; // Ensure NavLink is imported
import TwoColumnResizeLayout from '#/components/layout/mainOutlet/twoColumnResizeLayout';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/components/ui/breadcrumb';
import { motion } from 'framer-motion';
import { cn } from '#/lib/utils';
import { HeaderButton } from '#/components/layout/mainOutlet/headerButton';
import { Columns2Icon } from 'lucide-react';
import type {
  ImperativePanelHandle,
  PanelGroupOnLayout,
  ImperativePanelGroupHandle,
} from 'react-resizable-panels';
import { useIsMobile } from '#/hooks/use-mobile';
import Chat from '#/components/chat/chat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs';
// Assuming Project type is accessible or redefine/import it
// import type { Project } from './projects'; // If defined in projects.tsx

// Constants for layout (can be moved to a shared constants file)
const DEFAULT_LAYOUT = [67, 33];
const COLLAPSE_THRESHOLD = 1;
// const MIN_PANEL_SIZE_DRAG = 5; // Not used in provided snippet, but good to keep if needed
// const COLLAPSED_SIZE = 0; // Not used

interface ProjectWorkspaceLayoutProps {
  // You might pass the current project ID or details if needed for breadcrumbs, etc.
  // projectId?: string;
}

export default function ProjectMainLayout({}: /* projectId */ ProjectWorkspaceLayoutProps) {
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);
  const firstPanelRef = useRef<ImperativePanelHandle>(null);
  const secondPanelRef = useRef<ImperativePanelHandle>(null);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [layout, setLayout] = useState<number[]>(DEFAULT_LAYOUT);

  const getActiveTab = useCallback(() => {
    const pathParts = location.pathname.split('/');
    const lastSegment = pathParts[pathParts.length - 1];
    // More robust check if project ID is present
    const isDetailView =
      pathParts.includes('projects') &&
      pathParts.length > pathParts.indexOf('projects') + 1 &&
      !['editor', 'summary', 'notes'].includes(lastSegment);

    if (
      lastSegment === 'editor' ||
      lastSegment === 'summary' ||
      lastSegment === 'notes'
    ) {
      return lastSegment;
    }
    // If it's a project detail view like /projects/:projectId, default to chat
    // or if it's /projects/:projectId/chats/:chatId
    if (
      isDetailView ||
      lastSegment === 'chats' ||
      pathParts.includes('chats')
    ) {
      return 'chat';
    }
    return 'chat'; // Default fallback
  }, [location.pathname]);

  const [activeTab, setActiveTab] = useState<string>(
    isMobile ? 'chat' : getActiveTab()
  );

  useEffect(() => {
    if (!isMobile) {
      setActiveTab(getActiveTab());
    }
    // Reset layout if navigating to a new project, or keep if desired
    // For now, layout persists across project navigation within this workspace.
  }, [location.pathname, isMobile, getActiveTab]);

  const handleLayout: PanelGroupOnLayout = (sizes: number[]) => {
    setLayout(sizes);
  };

  const resetLayout = useCallback(() => {
    firstPanelRef.current?.resize(DEFAULT_LAYOUT[0]); // Use resize for specific sizes
    secondPanelRef.current?.resize(DEFAULT_LAYOUT[1]);
    // panelGroupRef.current?.setLayout(DEFAULT_LAYOUT); // setLayout also works
  }, []);

  const isDefaultLayout =
    layout.length === 2 &&
    Math.abs(layout[0] - DEFAULT_LAYOUT[0]) < 1 &&
    Math.abs(layout[1] - DEFAULT_LAYOUT[1]) < 1;
  const isFirstPanelCollapsed = layout[0] < COLLAPSE_THRESHOLD;
  const isSecondPanelCollapsed = layout[1] < COLLAPSE_THRESHOLD;

  useEffect(() => {
    if (!isMobile) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.ctrlKey || event.metaKey) {
          let handled = false;
          switch (event.key.toLowerCase()) {
            case 'arrowleft':
              if (secondPanelRef.current && !isSecondPanelCollapsed) {
                secondPanelRef.current.collapse();
                handled = true;
              } else if (firstPanelRef.current && !isFirstPanelCollapsed) {
                // Cycle to first if second already collapsed
                firstPanelRef.current.collapse();
                handled = true;
              }
              break;
            case 'arrowright':
              if (firstPanelRef.current && !isFirstPanelCollapsed) {
                firstPanelRef.current.collapse();
                handled = true;
              } else if (secondPanelRef.current && !isSecondPanelCollapsed) {
                // Cycle
                secondPanelRef.current.collapse();
                handled = true;
              }
              break;
            case 'r':
              resetLayout();
              handled = true;
              break;
          }
          if (handled) event.preventDefault();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isMobile, resetLayout, isFirstPanelCollapsed, isSecondPanelCollapsed]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // If the new tab corresponds to a route and we're not already on it
    if (value !== 'chat' && value !== getActiveTab().split('/').pop()) {
      // Construct the path relative to the current project ID
      const basePath = location.pathname.substring(
        0,
        location.pathname.lastIndexOf('/')
      );
      // Check if current path ends with /:projectId, if so, append tab
      if (
        basePath.match(/\/projects\/[^/]+$/) &&
        !location.pathname.endsWith(value)
      ) {
        navigate(value); // Navigate to sub-route like 'editor', 'summary'
      } else if (location.pathname.includes('/chats/') && value !== 'chat') {
        // If currently in a chat, navigate from project base for other tabs
        const projectBasePath = location.pathname.substring(
          0,
          location.pathname.indexOf('/chats')
        );
        navigate(`${projectBasePath}/${value}`);
      } else if (!location.pathname.endsWith(value) && value !== 'chat') {
        // Fallback for navigating if current path is just /projects/:projectId
        navigate(value);
      }
    } else if (value === 'chat' && !location.pathname.includes('/chats/')) {
      // if navigating to chat, and not already in a chat sub-route
      //  this might need to navigate to a default chat ID or the base project ID route
      //  assuming /projects/:projectId implicitly shows chat or /projects/:projectId/chats/default
      const basePath = location.pathname.split('/').slice(0, 4).join('/'); // e.g. /dashboard/projects/projectId
      if (!location.pathname.startsWith(basePath + '/chats')) {
        navigate(`${basePath}/chats/general`); // Or some default chat ID
      }
    }
  };

  const rightPanelActions = (
    <>
      <nav
        className={cn(
          'inline-flex h-10 gap-2 w-fit items-center justify-center rounded-xl p-1',
          'bg-gray-100/50 dark:bg-gray-900/70',
          'backdrop-blur-sm shadow-sm',
          'border border-white/30 dark:border-gray-700/30'
        )}
      >
        <NavLink
          to="editor"
          className={({ isActive }) =>
            cn(
              'inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5',
              'text-sm font-medium tracking-wide whitespace-nowrap',
              'transition-all duration-200 ease-out',
              isActive
                ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-foreground shadow-sm ring-1 ring-blue-500/20'
                : 'text-gray-900 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-700/30 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] hover:scale-105',
              'focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
              'disabled:pointer-events-none disabled:opacity-50'
            )
          }
        >
          Editor
        </NavLink>
        <NavLink
          to="summary"
          className={({ isActive }) =>
            cn(
              'inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5',
              'text-sm font-medium tracking-wide whitespace-nowrap',
              'transition-all duration-200 ease-out',
              isActive
                ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-foreground shadow-sm ring-1 ring-blue-500/20'
                : 'text-gray-900 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-700/30 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] hover:scale-105',
              'focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
              'disabled:pointer-events-none disabled:opacity-50'
            )
          }
        >
          Summary
        </NavLink>
        <NavLink
          to="notes"
          className={({ isActive }) =>
            cn(
              'inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5',
              'text-sm font-medium tracking-wide whitespace-nowrap',
              'transition-all duration-200 ease-out',
              isActive
                ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-foreground shadow-sm ring-1 ring-blue-500/20'
                : 'text-gray-900 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-700/30 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] hover:scale-105',
              'focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
              'disabled:pointer-events-none disabled:opacity-50'
            )
          }
        >
          Notes
        </NavLink>
      </nav>
      {!isDefaultLayout && (
        <HeaderButton
          tooltip="Reset Layout (Ctrl+R)"
          onClick={resetLayout}
          aria-label="Reset column layout"
        >
          <Columns2Icon className="h-4 w-4" />
        </HeaderButton>
      )}
    </>
  );

  // The main return of ProjectWorkspaceLayout
  return (
    <TwoColumnResizeLayout
      autoSaveId="project-workspace-layout" // More specific ID
    >
      <TwoColumnResizeLayout.LeftPanel>
        {!isMobile && (
          <TwoColumnResizeLayout.LeftPanel.Actions>
            <Breadcrumb>
              <BreadcrumbList className="sm:gap-1.5">
                <BreadcrumbItem>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <BreadcrumbLink asChild>
                      <NavLink to="/projects">Projects</NavLink>
                    </BreadcrumbLink>
                  </motion.div>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {/* TODO: Get project name dynamically */}
                  <BreadcrumbPage>
                    Project Name /{' '}
                    {activeTab === 'chat'
                      ? 'Chat'
                      : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </TwoColumnResizeLayout.LeftPanel.Actions>
        )}
        <div className={cn('flex-1 flex flex-col', !isMobile && 'lg:p-3')}>
          {' '}
          {/* Conditional padding */}
          {
            isMobile ? (
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="h-full flex flex-col"
              >
                <TabsList /* ... same as before ... */>
                  <TabsTrigger value="chat" /* ... */>Chat</TabsTrigger>
                  <TabsTrigger value="editor" /* ... */>Editor</TabsTrigger>
                  <TabsTrigger value="summary" /* ... */>Summary</TabsTrigger>
                  <TabsTrigger value="notes" /* ... */>Notes</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="chat"
                  className="flex-1 m-0 overflow-hidden"
                >
                  {/* The Chat route is /projects/:projectId/chats/:chatId */}
                  {/* So if activeTab is chat, we might need to render Outlet for the chat route, or Chat directly if it handles its own data via params */}
                  <Outlet />{' '}
                  {/* Assuming /chats/:chatId is a child route rendered here */}
                </TabsContent>
                <TabsContent
                  value="editor"
                  className="flex-1 m-0 overflow-hidden"
                >
                  <Outlet />
                </TabsContent>
                <TabsContent
                  value="summary"
                  className="flex-1 m-0 overflow-hidden"
                >
                  <Outlet />
                </TabsContent>
                <TabsContent
                  value="notes"
                  className="flex-1 m-0 overflow-hidden"
                >
                  <Outlet />
                </TabsContent>
              </Tabs>
            ) : // For desktop, if the current route is for editor, summary, notes, Outlet will render it.
            // If it's just /projects/:projectId or /projects/:projectId/chats/:chatId, it should render chat.
            // This requires careful route setup: /projects/:projectId could be an index route showing Chat.
            getActiveTab() === 'chat' ? (
              <Outlet />
            ) : (
              <Outlet />
            ) // Simplified: Outlet handles all.
            // A more explicit way:
            // {getActiveTab() === 'chat' ? <Outlet /> : <Outlet />}
            // Or, if /projects/:projectId should default to chat, then route config handles it.
            // The key is that Outlet will render the matched child:
            // - If URL is .../editor, Outlet renders editor component
            // - If URL is .../chats/123, Outlet renders chat component
            // - If URL is .../:projectId (index for project), it should render Chat.
          }
        </div>
      </TwoColumnResizeLayout.LeftPanel>

      {!isMobile && (
        <TwoColumnResizeLayout.RightPanel>
          <TwoColumnResizeLayout.RightPanel.Title>
            {/* Could be dynamic, e.g., "Editor Tools", "Summary Options" */}
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Details
          </TwoColumnResizeLayout.RightPanel.Title>
          <TwoColumnResizeLayout.RightPanel.Actions>
            {rightPanelActions}
          </TwoColumnResizeLayout.RightPanel.Actions>
          <div className="flex-1 p-1 lg:p-2 overflow-y-auto">
            {/* On desktop, the Outlet here is for sub-routes of editor, summary, notes if any, OR this panel could show specific tools/content.
                Given the current routes, this Outlet renders editor, summary, notes components.
                The LeftPanel then needs to *not* render them if this RightPanel is rendering them.
                This implies a single main <Outlet /> for the desktop view.
            */}
            <Outlet />
          </div>
        </TwoColumnResizeLayout.RightPanel>
      )}
    </TwoColumnResizeLayout>
  );
}
