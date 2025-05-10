import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '#/components/ui/sidebar';
import { Button } from '#/components/ui/button';
import type { EducationResource } from '#/mockData/mockData';
import {
  ArrowUpRight,
  BookOpen,
  MessageSquare,
  Plus,
  PlusCircle,
} from 'lucide-react';
import { mockEducation } from '#/mockData/mockData';

interface EducationPanelContentProps {
  // Define props if needed, e.g., resources list
}

export function EducationPanelContent(props: EducationPanelContentProps) {
  // Group resources by topic for display
  const resourcesByTopic = mockEducation.reduce((acc, resource) => {
    const topic = resource.topic;
    if (!acc[topic]) {
      acc[topic] = [];
    }
    acc[topic].push(resource);
    return acc;
  }, {} as Record<string, EducationResource[]>);

  return (
    <>
      <SidebarGroup className="flex-1 overflow-y-auto">
        {Object.entries(resourcesByTopic).map(([topic, resources]) => (
          <SidebarGroup
            key={topic}
            className="py-3 border-b border-[var(--sidebar-border-color)] last:border-b-0"
          >
            <SidebarGroupLabel className="px-4 text-xs font-medium text-black/50 dark:text-white/50 uppercase tracking-wide mb-1 flex justify-between items-center">
              <span>{topic}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
                onClick={() => console.log(`Add to ${topic}`)}
                aria-label={`Add resource to ${topic}`}
              >
                <Plus className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
              </Button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {resources.map((res) => (
                  <SidebarMenuItem key={res.id}>
                    <SidebarMenuButton
                      onClick={() => console.log('Open Resource:', res.id)}
                    >
                      <BookOpen className="h-4 w-4 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                      <span className="flex-1 text-sm truncate">
                        {res.title}
                      </span>
                      <SidebarMenuBadge>{res.type}</SidebarMenuBadge>
                    </SidebarMenuButton>
                    {/* Removed redundant badge from MenuItem */}
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => console.log(`Join ${topic} Public Room`)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span className="flex-1 text-sm truncate">
                      Join {topic} Public Room
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 ml-auto flex-shrink-0" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarGroup>

      <SidebarGroup className="mt-auto p-4 border-t border-[var(--sidebar-border-color)]">
        <Button
          className="w-full rounded-md h-9 text-sm font-medium"
          onClick={() => console.log('Add Resource')}
        >
          <PlusCircle className="h-4 w-4 mr-2" aria-hidden="true" /> Add
          Resource
        </Button>
      </SidebarGroup>
    </>
  );
}
