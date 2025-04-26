'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '#/lib/utils'; // Make sure this path is correct

// --- Correct: Tooltip is now just an alias for the Radix Root ---
const Tooltip = TooltipPrimitive.Root;

// --- TooltipProvider ---
// Removed React.forwardRef as TooltipPrimitive.Provider does not accept a ref directly
const TooltipProvider = ({
  delayDuration = 700 /* Default Shadcn value */,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>) => (
  <TooltipPrimitive.Provider
    // Removed ref={ref}
    delayDuration={delayDuration}
    skipDelayDuration={300} // Added standard Shadcn value
    {...props}
  />
);
TooltipProvider.displayName = TooltipPrimitive.Provider.displayName;

// --- Correct: TooltipTrigger is just an alias for the Radix Trigger ---
const TooltipTrigger = TooltipPrimitive.Trigger;

// --- TooltipContent with forwardRef (Recommended) ---
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        // Using standard Shadcn UI classes for better compatibility/appearance
        'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
    {/* Removed the Arrow component for simplicity, add back if needed and styled */}
    {/* <TooltipPrimitive.Arrow className="fill-popover border" /> */}
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
