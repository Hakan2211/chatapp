import { Outlet } from 'react-router'; // Ensure using react-router-dom
import AppSidebar from '~/components/layout/appSidebar';
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from '~/components/ui/resizable';
import type {
  ImperativePanelGroupHandle,
  ImperativePanelHandle,
  PanelGroupOnLayout,
} from 'react-resizable-panels';
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '~/components/ui/sidebar';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { motion } from 'framer-motion';

// --- Icon Imports (replace with your actual icon components/library) ---
import {
  ColumnsIcon as Columns2Icon, // Assuming ColumnsIcon is your reset icon
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'; // Example using lucide-react

// --- Layout Constants ---
const DEFAULT_LAYOUT = [67, 33];
const COLLAPSED_SIZE = 0;
const MIN_PANEL_SIZE_DRAG = 5; // Minimum size before collapse triggers
const COLLAPSE_THRESHOLD = 1; // Consider a panel collapsed if its size is less than this

// --- Dashboard Component ---
function Dashboard() {
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);
  const firstPanelRef = useRef<ImperativePanelHandle>(null);
  const secondPanelRef = useRef<ImperativePanelHandle>(null);

  const [layout, setLayout] = useState<number[]>(DEFAULT_LAYOUT);

  // Update layout state when panels are resized
  const handleLayout: PanelGroupOnLayout = (sizes: number[]) => {
    setLayout(sizes);
  };

  // Reset layout to default
  const resetLayout = useCallback(() => {
    firstPanelRef.current?.expand();
    secondPanelRef.current?.expand();
    panelGroupRef.current?.setLayout(DEFAULT_LAYOUT);
  }, []); // Refs don't need to be dependencies

  // Derived states
  const isDefaultLayout =
    layout.length === 2 &&
    Math.abs(layout[0] - DEFAULT_LAYOUT[0]) < 1 &&
    Math.abs(layout[1] - DEFAULT_LAYOUT[1]) < 1;

  const isFirstPanelCollapsed = layout[0] < COLLAPSE_THRESHOLD;
  const isSecondPanelCollapsed = layout[1] < COLLAPSE_THRESHOLD;

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        let handled = false;
        switch (event.key.toLowerCase()) {
          case 'arrowleft': // Collapse Right Panel
            if (secondPanelRef.current && !isSecondPanelCollapsed) {
              secondPanelRef.current.collapse();
              handled = true;
            }
            break;
          case 'arrowright': // Collapse Left Panel
            if (firstPanelRef.current && !isFirstPanelCollapsed) {
              firstPanelRef.current.collapse();
              handled = true;
            }
            break;
          case 'r': // Reset
            resetLayout();
            handled = true;
            break;
        }
        if (handled) event.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetLayout, layout, isFirstPanelCollapsed, isSecondPanelCollapsed]); // Dependencies updated

  // --- Framer Motion Variants ---
  const panelVariants = {
    visible: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
    hidden: { opacity: 0.4, transition: { duration: 0.2, ease: 'easeOut' } },
  };

  return (
    <TooltipProvider delayDuration={100}>
      <SidebarProvider>
        <div className="flex h-screen w-screen overflow-hidden bg-gray-100 dark:bg-gray-950">
          <AppSidebar />

          <SidebarInset className="flex flex-1 flex-col overflow-hidden">
            {/* Mobile Header */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-800 lg:hidden sticky top-0 bg-gray-100 dark:bg-gray-950 z-10 flex items-center">
              <SidebarTrigger />
              <span className="ml-3 font-medium text-gray-700 dark:text-gray-300">
                Dashboard
              </span>
            </div>

            {/* Main Content Area */}
            <main className="flex flex-1 flex-col overflow-hidden">
              {/* Small/Medium Screens */}
              <div className="block lg:hidden flex-1 p-4 sm:p-6 overflow-y-auto">
                <Outlet />
              </div>

              {/* Large Screens: Resizable Panels */}
              <div className="hidden lg:flex flex-1 h-full p-3">
                {/* Ensure PanelGroup allows overflow for indicators/handles */}
                <ResizablePanelGroup
                  ref={panelGroupRef}
                  direction="horizontal"
                  className="relative flex-1 rounded-lg border border-gray-200/80 dark:border-gray-800/80 bg-background dark:bg-background"
                  onLayout={handleLayout}
                  autoSaveId="dashboard-layout" // Persist layout
                >
                  {/* --- First Panel --- */}
                  <ResizablePanel
                    ref={firstPanelRef}
                    order={1}
                    defaultSize={DEFAULT_LAYOUT[0]}
                    minSize={MIN_PANEL_SIZE_DRAG}
                    collapsible={true}
                    collapsedSize={COLLAPSED_SIZE}
                    className="flex flex-col !overflow-auto" // Panel manages scroll
                    // Render null instead of the panel content if collapsed to prevent flash/reflow issues
                    // Or use the motion.div approach if preferred
                    // style={{ display: isFirstPanelCollapsed ? 'none' : 'flex' }} // Alternative way to hide
                  >
                    {!isFirstPanelCollapsed && ( // Only render content if not collapsed
                      <motion.div
                        key="panel1-content" // Add key for mount/unmount animation
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }} // Faster fade for content
                        className="flex flex-col h-full"
                      >
                        <PanelHeader title="Column One" />
                        <div className="flex-1 p-4 lg:p-5">
                          <Outlet />
                        </div>
                      </motion.div>
                    )}
                  </ResizablePanel>

                  {/* --- Handle Section --- */}
                  {/* Show EITHER the main handle OR the indicator handle based on collapsed state */}
                  {isFirstPanelCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {/* This handle appears when FIRST panel is collapsed, acts as left edge indicator */}
                        <ResizableHandle className="indicator-handle group left">
                          <ChevronRight className="indicator-icon" />
                        </ResizableHandle>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="tooltip-content">
                        Drag or click to expand left panel
                      </TooltipContent>
                    </Tooltip>
                  ) : isSecondPanelCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {/* This handle appears when SECOND panel is collapsed, acts as right edge indicator */}
                        <ResizableHandle className="indicator-handle group right">
                          <ChevronLeft className="indicator-icon" />
                        </ResizableHandle>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="tooltip-content">
                        Drag or click to expand right panel
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    // Default main handle when neither panel is collapsed
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ResizableHandle
                          onDoubleClick={resetLayout}
                          className="main-handle group"
                        />
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="tooltip-content">
                        Drag to resize. Double-click to reset.
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {/* --- Second Panel --- */}
                  <ResizablePanel
                    ref={secondPanelRef}
                    order={2}
                    defaultSize={DEFAULT_LAYOUT[1]}
                    minSize={MIN_PANEL_SIZE_DRAG}
                    collapsible={true}
                    collapsedSize={COLLAPSED_SIZE}
                    className="flex flex-col !overflow-auto" // Panel manages scroll
                    // style={{ display: isSecondPanelCollapsed ? 'none' : 'flex' }} // Alternative way to hide
                  >
                    {!isSecondPanelCollapsed && ( // Only render content if not collapsed
                      <motion.div
                        key="panel2-content" // Add key
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex flex-col h-full"
                      >
                        <PanelHeader title="Column Two">
                          {!isDefaultLayout && (
                            <HeaderButton
                              tooltip="Reset Layout (Ctrl+R)"
                              onClick={resetLayout}
                              aria-label="Reset column layout"
                            >
                              <Columns2Icon className="h-4 w-4" />
                            </HeaderButton>
                          )}
                        </PanelHeader>
                        <div className="flex-1 p-4 lg:p-5">
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
                            <p>This is the second column area.</p>
                            <p>Drag handle or use Ctrl/Cmd + ←/→</p>
                            <p>
                              Layout: [
                              {layout.map((s) => s.toFixed(0)).join(', ')}]
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}

// --- Helper Component: PanelHeader ---
interface PanelHeaderProps {
  title: string;
  children?: React.ReactNode;
}
const PanelHeader: React.FC<PanelHeaderProps> = ({ title, children }) => (
  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200/60 dark:border-gray-800/60 sticky top-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm z-10">
    <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
      {title}
    </span>
    <div className="flex items-center space-x-1 min-h-[28px]">{children}</div>
  </div>
);

// --- Helper Component: HeaderButton ---
interface HeaderButtonProps extends React.ComponentProps<typeof Button> {
  tooltip: string;
}
const HeaderButton: React.FC<HeaderButtonProps> = ({
  tooltip,
  children,
  ...props
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-gray-500 dark:text-gray-400 hover:bg-gray-200/80 dark:hover:bg-gray-800/80 disabled:opacity-40"
        {...props}
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="text-xs px-2 py-1">
      <p>{tooltip}</p>
    </TooltipContent>
  </Tooltip>
);

export default Dashboard;
