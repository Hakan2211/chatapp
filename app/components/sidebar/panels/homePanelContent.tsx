import { Button } from '#/components/ui/button';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '#/components/ui/sidebar';
import { mockHomeActivity, type HomeProjectItem } from '#/mockData/mockData';
import { Star } from 'lucide-react';
import { Link } from 'react-router';

interface HomePanelContentProps {
  projects: HomeProjectItem[];
}

export function HomePanelContent({ projects }: HomePanelContentProps) {
  return (
    <>
      <SidebarGroup className="py-3">
        <SidebarGroupLabel className="px-4 text-xs font-medium uppercase tracking-wide text-black/50 mb-1">
          Recent Activity
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {mockHomeActivity.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton>
                  <span className="flex items-center gap-2 w-full">
                    {item.icon && (
                      <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                        {item.icon}
                      </span>
                    )}
                    <span className="flex-1 text-sm truncate">
                      {item.label}
                    </span>
                    <span className="text-xs ml-auto whitespace-nowrap text-gray-500">
                      {item.detail}
                    </span>
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="py-3 border-t border-[var(--sidebar-border-color)]">
        <SidebarGroupLabel className="px-4 text-xs font-medium uppercase tracking-wide text-black/50 mb-1">
          Active Projects
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {projects.map((p) => (
              <SidebarMenuItem key={p.id}>
                <SidebarMenuButton asChild>
                  {/* Use the placeholder Link or your actual Link component */}
                  <Link to={`/projects/${p.id}`}>
                    <span className="flex items-center gap-2 w-full">
                      {p.starred ? (
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                      ) : (
                        // Use a placeholder span to maintain alignment
                        <span className="w-3.5 h-3.5 flex-shrink-0"></span>
                      )}
                      <span className="flex-1 text-sm truncate">{p.name}</span>
                      {p.badge && (
                        <SidebarMenuBadge>{p.badge}</SidebarMenuBadge>
                      )}
                    </span>
                  </Link>
                </SidebarMenuButton>
                {/* Removed redundant lastActive display from here, maybe add as tooltip or secondary line if needed */}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="mt-auto p-4 border-t border-[var(--sidebar-border-color)]">
        <Button
          variant="outline"
          size="sm"
          className="w-full rounded-md text-xs h-8"
        >
          View All Activity
        </Button>
      </SidebarGroup>
    </>
  );
}
