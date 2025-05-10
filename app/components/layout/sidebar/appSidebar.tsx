import { useEffect, useState, type JSX } from 'react';
import { Sidebar } from '#/components/ui/sidebar';
import NavigationSidebar, {
  PanelType,
  iconBarIcons,
} from './navigationSidebar';
import ContentSidebar from './contentSidebar';
import { useLocation } from 'react-router';

export function AppSidebar({ content, ...props }: { content: JSX.Element }) {
  const location = useLocation();
  const [currentActivePanel, setCurrentActivePanel] = useState<PanelType>(
    PanelType.Home
  );
  useEffect(() => {
    const path = location.pathname;

    const matchingIcon = iconBarIcons.find((icon) => {
      if (icon.type === PanelType.Projects) {
        return path.startsWith(icon.path);
      }
      return path.startsWith(icon.path);
    });

    if (matchingIcon) {
      setCurrentActivePanel(matchingIcon.type);
    } else {
      // Fallback or handle cases like '/account' if it's not a direct route for an iconBarIcon
      // For now, if no match, maybe default to home or do nothing
      // This depends on how I want to handle paths not directly in iconBarIcons
    }
  }, [location.pathname]);

  // Handler for NavigationSidebar to set panel (e.g., for Account button)
  const handlePanelSelect = (panelType: PanelType) => {
    setCurrentActivePanel(panelType);
  };

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row border-[var(--sidebar-border-color)]"
      {...props}
    >
      <NavigationSidebar onPanelSelect={handlePanelSelect} />
      <ContentSidebar content={content} activePanelType={currentActivePanel} />
    </Sidebar>
  );
}
