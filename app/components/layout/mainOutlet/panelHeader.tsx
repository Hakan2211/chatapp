import { cn } from '#/lib/utils';
interface PanelHeaderProps extends React.PropsWithChildren<{}> {
  className?: string;
}

interface TitleProps extends React.PropsWithChildren<{}> {
  className?: string;
}

interface ActionsProps extends React.PropsWithChildren<{}> {
  className?: string;
}

const Title: React.FC<TitleProps> = ({ children, className }) => {
  return (
    <span
      className={cn(
        'font-medium text-sm text-gray-700 dark:text-gray-300 truncate',
        className
      )}
    >
      {children}
    </span>
  );
};

const Actions: React.FC<ActionsProps> = ({ children, className }) => {
  return (
    <div className={cn('flex items-center space-x-1 min-h-[28px]', className)}>
      {children}
    </div>
  );
};

const PanelHeaderRoot: React.FC<PanelHeaderProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between',
        'px-4 py-2 border-b border-gray-200/60 dark:border-gray-800/60',
        'sticky top-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm z-10',
        className
      )}
    >
      {children}
    </div>
  );
};

type PanelHeaderComponent = React.FC<PanelHeaderProps> & {
  Title: React.FC<TitleProps>;
  Actions: React.FC<ActionsProps>;
};

export const PanelHeader = PanelHeaderRoot as PanelHeaderComponent;
PanelHeader.Title = Title;
PanelHeader.Actions = Actions;
