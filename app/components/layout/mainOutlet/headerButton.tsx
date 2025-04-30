import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@radix-ui/react-tooltip';
import { Button } from '#/components/ui/button';
import { type ComponentProps } from 'react';

interface HeaderButtonProps extends ComponentProps<typeof Button> {
  tooltip: string;
}

export const HeaderButton: React.FC<HeaderButtonProps> = ({
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
