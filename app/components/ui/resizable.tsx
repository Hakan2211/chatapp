import * as React from 'react';
import { GripVerticalIcon } from 'lucide-react';
import * as ResizablePrimitive from 'react-resizable-panels';

import { cn } from '~/lib/utils'; // Assuming you have this utility

// --- ResizablePanelGroup (no changes needed) ---
function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
        className
      )}
      {...props}
    />
  );
}

// --- ResizablePanel (no changes needed) ---
function ResizablePanel({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return (
    <ResizablePrimitive.Panel
      data-slot="resizable-panel"
      className={cn('', className)} // Removed redundant '' ? Keep if needed
      {...props}
    />
  );
}

// --- MODIFIED ResizableHandle ---
// Explicitly define props including children
type ResizableHandleProps = React.ComponentProps<
  typeof ResizablePrimitive.PanelResizeHandle
> & {
  withHandle?: boolean;
  children?: React.ReactNode; // Add children to the props type
};

function ResizableHandle({
  withHandle,
  className,
  children, // Destructure children from props
  ...props
}: ResizableHandleProps) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        // Base styles - applied whether rendering children or grip
        'bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90',
        // Important: Remove focus-visible:outline-hidden if you want focus rings on custom children/indicators
        // focus-visible:outline-hidden
        className // Allow overriding/extending base styles
      )}
      {...props}
    >
      {/* --- Render Logic --- */}
      {
        children ? (
          // If children are provided, render them directly
          children
        ) : withHandle ? (
          // Otherwise, if withHandle is true, render the default grip
          <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-sm border">
            <GripVerticalIcon className="size-2.5" />
          </div>
        ) : null /* Otherwise render no specific content */
      }
    </ResizablePrimitive.PanelResizeHandle>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
