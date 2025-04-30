import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '#/components/ui/resizable';
import { ChevronRight, ChevronLeft, Columns2Icon } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  ImperativePanelHandle,
  PanelGroupOnLayout,
} from 'react-resizable-panels';
import type { ImperativePanelGroupHandle } from 'react-resizable-panels';
import { useIsMobile } from '#/hooks/use-mobile';
import { PanelHeader } from '#/components/layout/mainOutlet/panelHeader';
import { HeaderButton } from '#/components/layout/mainOutlet/headerButton';
import { TwoColumnProvider } from '#/context/twoColumnContext';
import React from 'react';

const DEFAULT_LAYOUT = [67, 33];
const COLLAPSED_SIZE = 0;
const MIN_PANEL_SIZE_DRAG = 5;
const COLLAPSE_THRESHOLD = 1;

interface TwoColumnResizeLayoutProps {
  children: ReactNode;
  autoSaveId: string;
}

interface PanelProps {
  children: ReactNode;
}

interface TitleProps {
  children: ReactNode;
}

interface ActionsProps {
  children: ReactNode;
}

const LeftPanelRoot: React.FC<PanelProps> = ({ children }) => {
  return <>{children}</>;
};

const RightPanelRoot: React.FC<PanelProps> = ({ children }) => {
  return <>{children}</>;
};

const Title: React.FC<TitleProps> = ({ children }) => {
  return <>{children}</>;
};

const Actions: React.FC<ActionsProps> = ({ children }) => {
  return <>{children}</>;
};

type LeftPanelComponent = React.FC<PanelProps> & {
  Title: React.FC<TitleProps>;
  Actions: React.FC<ActionsProps>;
};

type RightPanelComponent = React.FC<PanelProps> & {
  Title: React.FC<TitleProps>;
  Actions: React.FC<ActionsProps>;
};

const LeftPanel = LeftPanelRoot as LeftPanelComponent;
LeftPanel.Title = Title;
LeftPanel.Actions = Actions;

const RightPanel = RightPanelRoot as RightPanelComponent;
RightPanel.Title = Title;
RightPanel.Actions = Actions;

function TwoColumnResizeLayout({
  children,
  autoSaveId,
}: TwoColumnResizeLayoutProps) {
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);
  const firstPanelRef = useRef<ImperativePanelHandle>(null);
  const secondPanelRef = useRef<ImperativePanelHandle>(null);
  const isMobile = useIsMobile();
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

  // Extract LeftPanel and RightPanel components
  const leftPanel = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === LeftPanel
  ) as React.ReactElement<PanelProps> | undefined;

  const rightPanel = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === RightPanel
  ) as React.ReactElement<PanelProps> | undefined;

  // Extract Title and Actions from panel children
  const leftPanelChildren = leftPanel
    ? React.Children.toArray(leftPanel.props.children)
    : [];
  const leftPanelTitle = leftPanelChildren.find(
    (child) => React.isValidElement(child) && child.type === LeftPanel.Title
  ) as React.ReactElement<TitleProps> | undefined;
  const leftPanelActions = leftPanelChildren.find(
    (child) => React.isValidElement(child) && child.type === LeftPanel.Actions
  ) as React.ReactElement<ActionsProps> | undefined;

  const rightPanelChildren = rightPanel
    ? React.Children.toArray(rightPanel.props.children)
    : [];
  const rightPanelTitle = rightPanelChildren.find(
    (child) => React.isValidElement(child) && child.type === RightPanel.Title
  ) as React.ReactElement<TitleProps> | undefined;
  const rightPanelActions = rightPanelChildren.find(
    (child) => React.isValidElement(child) && child.type === RightPanel.Actions
  ) as React.ReactElement<ActionsProps> | undefined;

  // Extract content (non-Title, non-Actions children)
  const leftPanelContent = leftPanelChildren.filter(
    (child) =>
      !React.isValidElement(child) ||
      (child.type !== LeftPanel.Title && child.type !== LeftPanel.Actions)
  );
  const rightPanelContent = rightPanelChildren.filter(
    (child) =>
      !React.isValidElement(child) ||
      (child.type !== RightPanel.Title && child.type !== RightPanel.Actions)
  );

  return (
    <div className="flex flex-1 h-full w-full">
      <ResizablePanelGroup
        ref={panelGroupRef}
        direction="horizontal"
        className="relative flex-1 rounded-lg border border-gray-200/80 dark:border-gray-800/80 bg-background dark:bg-background"
        onLayout={handleLayout}
        autoSaveId={autoSaveId}
      >
        {/* Left Panel */}
        <ResizablePanel
          ref={firstPanelRef}
          order={1}
          defaultSize={DEFAULT_LAYOUT[0]}
          minSize={MIN_PANEL_SIZE_DRAG}
          collapsible={true}
          collapsedSize={COLLAPSED_SIZE}
          className="flex flex-col !overflow-auto"
        >
          {!isFirstPanelCollapsed && (
            <motion.div
              key="panel1-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col h-full"
            >
              <PanelHeader>
                <PanelHeader.Actions>
                  {leftPanelActions?.props.children}
                </PanelHeader.Actions>
              </PanelHeader>
              <div className="flex-1 p-4 lg:p-5">{leftPanelContent}</div>
            </motion.div>
          )}
        </ResizablePanel>

        {/* Handle Section */}
        {!isMobile && (
          <>
            {isFirstPanelCollapsed ? (
              <ResizableHandle className="indicator-handle group left">
                <ChevronRight className="indicator-icon" />
              </ResizableHandle>
            ) : isSecondPanelCollapsed ? (
              <ResizableHandle className="indicator-handle group right">
                <ChevronLeft className="indicator-icon" />
              </ResizableHandle>
            ) : (
              <ResizableHandle
                onDoubleClick={resetLayout}
                className="main-handle group"
              />
            )}
          </>
        )}

        {/* Right Panel */}
        {!isMobile && rightPanel && (
          <ResizablePanel
            ref={secondPanelRef}
            order={2}
            defaultSize={DEFAULT_LAYOUT[1]}
            minSize={MIN_PANEL_SIZE_DRAG}
            collapsible={true}
            collapsedSize={COLLAPSED_SIZE}
            className="flex flex-col !overflow-auto"
          >
            {!isSecondPanelCollapsed && (
              <motion.div
                key="panel2-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col h-full"
              >
                <PanelHeader>
                  <PanelHeader.Actions>
                    {rightPanelActions?.props.children}
                  </PanelHeader.Actions>
                  <PanelHeader.Actions>
                    {!isDefaultLayout && (
                      <HeaderButton
                        tooltip="Reset Layout (Ctrl+R)"
                        onClick={resetLayout}
                        aria-label="Reset column layout"
                      >
                        <Columns2Icon className="h-4 w-4" />
                      </HeaderButton>
                    )}
                  </PanelHeader.Actions>
                </PanelHeader>
                <div className="flex-1 p-4 lg:p-5">{rightPanelContent}</div>
              </motion.div>
            )}
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    </div>
  );
}

TwoColumnResizeLayout.LeftPanel = LeftPanel;
TwoColumnResizeLayout.RightPanel = RightPanel;

export default TwoColumnResizeLayout;
