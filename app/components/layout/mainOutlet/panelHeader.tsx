import { type ReactNode } from 'react';

interface PanelHeaderProps {
  title: string;
  children?: ReactNode;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  title,
  children,
}) => (
  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200/60 dark:border-gray-800/60 sticky top-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm z-10">
    <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
      {title}
    </span>
    <div className="flex items-center space-x-1 min-h-[28px]">{children}</div>
  </div>
);
