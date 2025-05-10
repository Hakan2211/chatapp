import {
  NavLink,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  type LoaderFunctionArgs,
} from 'react-router';
import TwoColumnResizeLayout from '#/components/layout/mainOutlet/twoColumnResizeLayout';
import { useCallback, useEffect, useRef, useState } from 'react';
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
} from 'react-resizable-panels';
import type { ImperativePanelGroupHandle } from 'react-resizable-panels';
import { useIsMobile } from '#/hooks/use-mobile';
import Chat from '#/components/chat/chat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs';
import SidebarLayout from '#/components/layout/sidebar/appLayout';
import { NotesPanelContent } from '#/components/sidebar/panels/sidebarPanels';

const DEFAULT_LAYOUT = [67, 33];
const COLLAPSE_THRESHOLD = 1;
const MIN_PANEL_SIZE_DRAG = 5;
const COLLAPSED_SIZE = 0;

export async function loader({ request }: LoaderFunctionArgs) {}

export default function Notes() {
  const data = useLoaderData<typeof loader>();
  console.log(data, 'data');
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);
  const firstPanelRef = useRef<ImperativePanelHandle>(null);
  const secondPanelRef = useRef<ImperativePanelHandle>(null);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [layout, setLayout] = useState<number[]>(DEFAULT_LAYOUT);

  // Determine active tab based on route
  const getActiveTab = () => {
    const path = location.pathname.split('/').pop();
    if (path === 'editor') {
      return 'editor';
    }
    if (path === 'summary' || path === 'notes') {
      return path;
    }
    return 'chat';
  };

  const [activeTab, setActiveTab] = useState<string>(
    isMobile ? 'chat' : getActiveTab()
  );

  useEffect(() => {
    if (!isMobile) {
      setActiveTab(getActiveTab()); // Always sync with route on desktop
    }
  }, [location.pathname, isMobile]);

  // Update layout state
  const handleLayout: PanelGroupOnLayout = (sizes: number[]) => {
    setLayout(sizes);
  };

  // Reset layout to default
  const resetLayout = useCallback(() => {
    firstPanelRef.current?.expand();
    secondPanelRef.current?.expand();
    panelGroupRef.current?.setLayout(DEFAULT_LAYOUT);
  }, []);

  // Derived states
  const isDefaultLayout =
    layout.length === 2 &&
    Math.abs(layout[0] - DEFAULT_LAYOUT[0]) < 1 &&
    Math.abs(layout[1] - DEFAULT_LAYOUT[1]) < 1;
  const isFirstPanelCollapsed = layout[0] < COLLAPSE_THRESHOLD;
  const isSecondPanelCollapsed = layout[1] < COLLAPSE_THRESHOLD;

  // Keyboard Shortcuts
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
              }
              break;
            case 'arrowright':
              if (firstPanelRef.current && !isFirstPanelCollapsed) {
                firstPanelRef.current.collapse();
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

  // Handle tab change for mobile
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value !== 'chat' && value !== getActiveTab()) {
      navigate(value); // Navigate to editor, summary, or notes if not already active
    }
  };

  // Right panel actions (navigation links and reset button)
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

  return (
    <SidebarLayout content={<NotesPanelContent notes={[]} />}>
      <TwoColumnResizeLayout autoSaveId="dashboard-layout">
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
                      <BreadcrumbLink href="#">Playground</BreadcrumbLink>
                    </motion.div>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Chat</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </TwoColumnResizeLayout.LeftPanel.Actions>
          )}
          <div className="flex-1 lg:p-3 flex flex-col">
            {isMobile ? (
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="h-full flex flex-col"
              >
                <TabsList
                  className={cn(
                    'grid grid-cols-4 w-full h-8 bg-gray-100/50 dark:bg-gray-900/70 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 rounded-lg p-1',
                    'mb-2'
                  )}
                >
                  <TabsTrigger
                    value="chat"
                    className={cn(
                      'h-6 text-xs font-medium tracking-wide',
                      'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/10 data-[state=active]:to-purple-500/10',
                      'data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-blue-500/20',
                      'text-gray-900 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-700/30 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] hover:scale-105',
                      'transition-all duration-200 ease-out'
                    )}
                  >
                    Chat
                  </TabsTrigger>
                  <TabsTrigger
                    value="editor"
                    className={cn(
                      'h-6 text-xs font-medium tracking-wide',
                      'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/10 data-[state=active]:to-purple-500/10',
                      'data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-blue-500/20',
                      'text-gray-900 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-700/30 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] hover:scale-105',
                      'transition-all duration-200 ease-out'
                    )}
                  >
                    Editor
                  </TabsTrigger>
                  <TabsTrigger
                    value="summary"
                    className={cn(
                      'h-6 text-xs font-medium tracking-wide',
                      'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/10 data-[state=active]:to-purple-500/10',
                      'data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-blue-500/20',
                      'text-gray-900 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-700/30 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] hover:scale-105',
                      'transition-all duration-200 ease-out'
                    )}
                  >
                    Summary
                  </TabsTrigger>
                  <TabsTrigger
                    value="notes"
                    className={cn(
                      'h-6 text-xs font-medium tracking-wide',
                      'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/10 data-[state=active]:to-purple-500/10',
                      'data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-blue-500/20',
                      'text-gray-900 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-700/30 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] hover:scale-105',
                      'transition-all duration-200 ease-out'
                    )}
                  >
                    Notes
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="chat" className="flex-1 m-0">
                  <Chat />
                </TabsContent>
                <TabsContent value="editor" className="flex-1 m-0">
                  <Outlet />
                </TabsContent>
                <TabsContent value="summary" className="flex-1 m-0">
                  <Outlet />
                </TabsContent>
                <TabsContent value="notes" className="flex-1 m-0">
                  <Outlet />
                </TabsContent>
              </Tabs>
            ) : (
              <Chat />
            )}
          </div>
        </TwoColumnResizeLayout.LeftPanel>
        {!isMobile && (
          <TwoColumnResizeLayout.RightPanel>
            <TwoColumnResizeLayout.RightPanel.Title>
              Project
            </TwoColumnResizeLayout.RightPanel.Title>
            <TwoColumnResizeLayout.RightPanel.Actions>
              {rightPanelActions}
            </TwoColumnResizeLayout.RightPanel.Actions>
            <div className="flex-1 p-4 lg:p-5">
              <Outlet />
            </div>
          </TwoColumnResizeLayout.RightPanel>
        )}
      </TwoColumnResizeLayout>
    </SidebarLayout>
  );
}
