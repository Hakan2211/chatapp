import React, { useCallback, useState } from 'react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  // SidebarMenuSub is not needed for the ProjectTree implementation below
} from '#/components/ui/sidebar'; // Adjust path as needed
import { Input } from '#/components/ui/input';
import { Button } from '#/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '#/components/ui/collapsible'; // Needed for Projects
import { cn } from '#/lib/utils'; // Adjust path as needed
import {
  FileText,
  LogOut,
  Settings,
  CreditCard,
  User,
  PlusCircle,
  Folder,
  MessageSquare,
  BookOpen,
  Search,
  ChevronRight,
  Plus,
  Star,
  Clock,
  File,
  ArrowUpRight,
} from 'lucide-react';
import type { SidebarData } from '#/routes/dashboard/layout';
import { Link } from 'react-router';
import {
  type ProjectFileTreeItem,
  type ProjectTreeOptions,
  type UserData,
  mockEducation,
  type EducationResource,
  mockNotes,
  type Note,
  mockHomeActivity,
  type HomeActivityItem,
  mockHomeProjects,
  type HomeProjectItem,
  mockProjectFiles,
  type MockProjectFilesData,
} from '#/mockData/mockData';

function updateStarredStatus(
  items: ProjectFileTreeItem[],
  path: string[],
  level = 0
): ProjectFileTreeItem[] {
  const targetName = path[level];

  return items.map((item): ProjectFileTreeItem => {
    let currentName: string;
    let currentItems: ProjectFileTreeItem[] = [];
    let currentOptions: ProjectTreeOptions = {};
    let isFolder = false;

    if (typeof item === 'string') {
      currentName = item;
    } else {
      // Item is an array [name, ...children, options?] or [name, ...children]
      currentName = item[0];
      isFolder = item.length > 1; // It's a folder if it has more than just a name
      const lastElement = item[item.length - 1];
      const hasOptions =
        typeof lastElement === 'object' && !Array.isArray(lastElement);

      currentOptions = hasOptions ? (lastElement as ProjectTreeOptions) : {};
      // Get children items, excluding the name and options object (if present)
      currentItems = item.slice(
        1,
        hasOptions ? item.length - 1 : item.length
      ) as ProjectFileTreeItem[];
    }

    // If this is not the item we're looking for at this level, return it as is
    if (currentName !== targetName) {
      return item;
    }

    // If this IS the item and we are at the final level of the path
    if (level === path.length - 1) {
      const newOptions = {
        ...currentOptions,
        starred: !currentOptions.starred,
      };
      // Reconstruct the item immutably
      if (isFolder) {
        // Ensure options object is the last element if it exists or is needed
        if (Object.keys(newOptions).length > 0 || currentItems.length > 0) {
          return [currentName, ...currentItems, newOptions];
        } else {
          // Handle case of an empty folder being toggled, treat like file structure
          return [currentName, newOptions]; // Might need adjustment based on desired empty folder structure
        }
      } else {
        // Reconstructing a file item (represented just by name) or a folder item being treated as a file
        // If it was just a string before, wrap it in an array with options
        return [currentName, newOptions]; // Simplification: Store files as [name, options] when starred
      }
    }

    // If this IS the item but not the final level, recurse deeper
    if (isFolder) {
      const updatedItems = updateStarredStatus(currentItems, path, level + 1);
      // Reconstruct folder item
      return [currentName, ...updatedItems, currentOptions];
    }

    // If it's not a folder but we aren't at the last level, something is wrong with the path
    console.warn('Path mismatch during star toggle:', path, level, item);
    return item; // Return original item
  });
}

interface HomePanelContentProps {
  projects: HomeProjectItem[];
}

// --- 1. Home Panel Content ---
export function HomePanelContent({ projects }: HomePanelContentProps) {
  return (
    <>
      <SidebarGroup className="py-3">
        <SidebarGroupLabel className="px-4 text-xs font-medium uppercase tracking-wide mb-1">
          Recent Activity
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {/* Static activity for now */}
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
                    <span className="text-xs ml-auto whitespace-nowrap">
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
        <SidebarGroupLabel className="px-4 text-xs font-medium uppercase tracking-wide mb-1">
          Active Projects
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {projects.map((p) => (
              <SidebarMenuItem key={p.id}>
                <SidebarMenuButton asChild>
                  <Link to={`/projects/${p.id}`}>
                    <span className="flex items-center gap-2 w-full">
                      {p.starred ? (
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 flex-shrink-0"></span>
                      )}
                      <span className="flex-1 text-sm truncate">{p.name}</span>
                      {p.badge && (
                        <SidebarMenuBadge>{p.badge}</SidebarMenuBadge>
                      )}
                    </span>
                  </Link>
                </SidebarMenuButton>
                <div className="text-xs ml-2">{p.lastActive}</div>
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

// --- 2. Projects Panel Content (with File Tree) ---

// Helper component for the recursive tree structure
function ProjectTree({
  item,
  level,
  path, // Path to this item from the root
  onToggleStar, // Function to call when star is clicked
}: {
  item: ProjectFileTreeItem;
  level: number;
  path: string[];
  onToggleStar: (path: string[]) => void;
}) {
  // Logic to extract name, items, options, isFolder, isStarred (same as before)
  let name: string;
  let items: ProjectFileTreeItem[] = [];
  let options: ProjectTreeOptions = {};
  let isFolder = false;

  if (typeof item === 'string') {
    name = item;
    // If a file was previously starred, it might be stored as [name, options]
    // This logic currently assumes files start as strings, adjust if needed based on updateStarredStatus
  } else {
    name = item[0];
    const lastElement = item[item.length - 1];
    const hasOptions =
      typeof lastElement === 'object' && !Array.isArray(lastElement);
    options = hasOptions ? (lastElement as ProjectTreeOptions) : {};
    // Exclude name and options from children
    items = item.slice(
      1,
      hasOptions ? item.length - 1 : item.length
    ) as ProjectFileTreeItem[];
    isFolder = items.length > 0 || (item.length > 1 && !hasOptions); // Folder if it has items OR just a name + options
    // Correct isFolder check: should be true if it's an array intended to be a folder
    if (Array.isArray(item) && !isFolder && items.length === 0) {
      // Handle case like ["filename", {starred: true}] which isn't technically a folder of items
      isFolder = false;
    }
  }

  const isStarred = !!options.starred; // Ensure boolean value
  const indentStyle = { paddingLeft: `${1 + level * 1.25}rem` };

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent Collapsible trigger or file open click
    onToggleStar(path);
  };

  // --- Star Button Component ---
  const StarButton = (
    <div // <-- Changed from 'button' to 'div'
      role="button" // <-- Add role for accessibility
      tabIndex={0} // <-- Make it focusable
      onClick={handleStarClick}
      onKeyDown={(e) => {
        // <-- Handle keyboard activation (Enter/Space)
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault(); // Prevent spacebar scrolling
          handleStarClick(e as unknown as React.MouseEvent);
        }
      }}
      className={cn(
        'ml-auto flex-shrink-0 p-1 rounded hover:bg-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors cursor-pointer' // Added focus styles and cursor
      )}
      aria-label={isStarred ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={isStarred} // <-- Add aria-pressed for toggle buttons
    >
      <Star
        className={cn(
          'h-4 w-4 pointer-events-none', // Prevent icon itself intercepting clicks
          isStarred
            ? 'text-amber-500 fill-amber-400'
            : 'text-gray-400 hover:text-gray-600'
        )}
      />
    </div>
  );

  // Render File
  if (!isFolder) {
    return (
      <SidebarMenuItem style={indentStyle} className="group/item pr-1">
        {' '}
        {/* Adjust padding */}
        <SidebarMenuButton
          onClick={() => console.log('Open file:', name)}
          className="data-[active=true]:bg-black/5 data-[active=true]:text-black justify-start"
        >
          <File className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500" />
          <span className="truncate flex-1">{name}</span>
          {/* Render star button always */}
          {StarButton}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // Render Folder
  if (isFolder) {
    // Added explicit check for clarity, though it was implied before
    return (
      <SidebarMenuItem className="p-0">
        {' '}
        {/* Outer <li> */}
        <Collapsible className="group/collapsible">
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              style={indentStyle}
              className="group/trigger pr-1 justify-start [&[data-state=open]>svg:first-child]:rotate-90"
            >
              <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0 transition-transform duration-200 text-gray-400" />
              <Folder className="h-4 w-4 mr-2 flex-shrink-0 text-sky-600" />
              <span className="truncate flex-1 font-medium">{name}</span>
              {StarButton} {/* StarButton is the div now, which is fine */}
            </SidebarMenuButton>
          </CollapsibleTrigger>

          {/* CollapsibleContent's direct child is now a <ul> */}
          <CollapsibleContent
          // Optional: remove padding here if handled by ul/li, but often kept for overall indent
          // className="pl-[1.25rem]"
          // Ensure content is unmounted when closed if using framer-motion/transitions
          // Or use forceMount on CollapsibleContent if needed
          >
            {/* NEW: Wrap the recursive calls in a <ul> element */}
            <ul
              className="flex w-full flex-col" // Add classes similar to SidebarMenu if needed
              data-sidebar="menu" // Add attribute for consistency if needed
            >
              {items.map((subItem, index) => {
                const subItemName =
                  typeof subItem === 'string' ? subItem : subItem[0];
                // ProjectTree now renders an <li> as a direct child of this new <ul>
                return (
                  <ProjectTree
                    key={`${subItemName}-${index}`}
                    item={subItem}
                    level={level + 1}
                    path={[...path, subItemName]}
                    onToggleStar={onToggleStar}
                  />
                );
              })}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    );
  }

  // Fallback or handle non-folder/non-file case if necessary
  return null;
}

// Update props to accept MockProjectFilesData
interface ProjectsPanelContentProps {
  projects: MockProjectFilesData;
}

export function ProjectsPanelContent({ projects }: ProjectsPanelContentProps) {
  const [searchTerm, setSearchTerm] = useState(''); // Keep search?
  const [projectData, setProjectData] = useState(projects); // State to hold mutable data

  // Callback function to update the starred status in the state
  const handleToggleStar = useCallback((path: string[]) => {
    setProjectData((currentData) => {
      const updatedTree = updateStarredStatus(currentData.tree, path);
      return { ...currentData, tree: updatedTree };
    });
  }, []);

  // TODO: Implement filtering for the tree structure if search is kept
  // const filteredProjects = projects.tree.filter((project) =>
  //   project.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  return (
    <>
      <SidebarGroup className="p-4 border-b border-[var(--sidebar-border-color)]">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
          <Input
            placeholder="Search projects..." // Search needs rework for tree
            className="pl-8 h-9 rounded-md bg-white border-black/10 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </SidebarGroup>

      {/* Render the Project Tree */}
      <SidebarGroup className="flex-1 overflow-y-auto py-2">
        <SidebarGroupContent>
          <SidebarMenu>
            {' '}
            {/* SidebarMenu likely wraps the tree items internally */}
            {projectData.tree.length > 0 ? (
              projectData.tree.map((item, index) => {
                const itemName = typeof item === 'string' ? item : item[0];
                return (
                  <ProjectTree
                    key={`${itemName}-${index}`}
                    item={item}
                    level={0}
                    path={[itemName]} // Initial path for top-level items
                    onToggleStar={handleToggleStar} // Pass the callback
                  />
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No projects found.
              </div>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="mt-auto p-4 border-t border-[var(--sidebar-border-color)]">
        <Button className="w-full rounded-md h-9 text-sm font-medium">
          <PlusCircle className="h-4 w-4 mr-2" /> New Project
        </Button>
      </SidebarGroup>
    </>
  );
}

interface NotesPanelContentProps {
  notes: Note[];
}
// --- 3. Notes Panel Content ---
export function NotesPanelContent({ notes }: NotesPanelContentProps) {
  const [filter, setFilter] = useState<'all' | 'solo' | 'group'>('all');
  const filteredNotes = notes.filter(
    (n) => filter === 'all' || n.type === filter
  );

  return (
    <>
      <SidebarGroup className="p-4 border-b border-[var(--sidebar-border-color)]">
        <div className="flex items-center gap-1">
          <Button
            variant={filter === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'solo' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('solo')}
          >
            Solo
          </Button>
          <Button
            variant={filter === 'group' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('group')}
          >
            Group
          </Button>
        </div>
      </SidebarGroup>

      <SidebarGroup className="flex-1 overflow-y-auto py-2">
        <SidebarGroupContent>
          {filteredNotes.length > 0 ? (
            <SidebarMenu>
              {filteredNotes.map((note) => (
                <SidebarMenuItem
                  key={note.id}
                  className="block p-0 hover:bg-transparent"
                >
                  <SidebarMenuButton className="h-auto flex-col items-start whitespace-normal py-2.5 px-4 hover:bg-black/[0.02] rounded-md mx-2 my-0.5">
                    <div className="flex items-center justify-between w-full mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {note.title}
                      </h4>
                      <SidebarMenuBadge>{note.type}</SidebarMenuBadge>
                    </div>
                    <p className="text-xs text-gray-400 mb-1 line-clamp-2 w-full">
                      {note.snippet}
                    </p>
                    <div className="text-xs text-gray-500 flex items-center gap-1 w-full">
                      <Clock className="h-3 w-3" />
                      {note.timestamp}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          ) : (
            <div className="py-12 text-center flex flex-col items-center gap-3 px-4">
              <div className="h-10 w-10 rounded-full bg-black/5 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">No notes found</p>
                <p className="text-xs text-black/50">
                  Try adjusting your filters.
                </p>
              </div>
            </div>
          )}
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="mt-auto p-4 border-t border-[var(--sidebar-border-color)]">
        <Button className="w-full rounded-md h-9 text-sm font-medium">
          <PlusCircle className="h-4 w-4 mr-2" /> New Note
        </Button>
      </SidebarGroup>
    </>
  );
}
// --- 4. Education Panel Content ---
export function EducationPanelContent() {
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
      {/* Education Content Grouped by Topic */}
      <SidebarGroup className="flex-1 overflow-y-auto">
        {' '}
        {/* Scrollable Container */}
        {Object.entries(resourcesByTopic).map(([topic, resources]) => (
          <SidebarGroup
            key={topic}
            className="py-3 border-b border-[var(--sidebar-border-color)] last:border-b-0"
          >
            <SidebarGroupLabel className="px-4 text-xs font-medium text-black/50 uppercase tracking-wide mb-1 flex justify-between items-center">
              <span>{topic}</span>
              {/* Optional: Add button per topic */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-md hover:bg-black/5"
                onClick={() => console.log(`Add to ${topic}`)}
              >
                <Plus className="h-3.5 w-3.5 text-gray-500" />
              </Button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {resources.map((res) => (
                  <SidebarMenuItem key={res.id}>
                    <SidebarMenuButton
                      onClick={() => console.log('Open Resource:', res.id)}
                    >
                      {/* Choose an icon based on type or use a default */}
                      <BookOpen className="h-4 w-4 mr-2 flex-shrink-0 text-blue-600" />
                      <span className="flex-1 text-sm truncate">
                        {res.title}
                      </span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>{res.type}</SidebarMenuBadge>
                  </SidebarMenuItem>
                ))}
                {/* Link to public room for the topic */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => console.log(`Join ${topic} Public Room`)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0 text-green-600" />
                    <span className="flex-1 text-sm truncate">
                      Join {topic} Public Room
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-gray-400 ml-auto" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarGroup>

      {/* Footer Action */}
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

// --- 5. Account Panel Content ---
export function AccountPanelContent() {
  return (
    <>
      {/* Account Links/Actions */}
      <SidebarGroup className="flex-1 py-2">
        {' '}
        {/* Make scrollable if content might grow */}
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => console.log('Go to Profile')}>
                <User className="h-4 w-4 mr-2" /> Profile
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => console.log('Go to Settings')}>
                <Settings className="h-4 w-4 mr-2" /> Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => console.log('Go to Billing')}>
                <CreditCard className="h-4 w-4 mr-2" /> Billing
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* Add more account related items here */}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Logout Button at the bottom */}
      <SidebarGroup className="mt-auto p-4 border-t border-[var(--sidebar-border-color)]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
              onClick={() => console.log('Logout')}
            >
              <LogOut className="h-4 w-4 mr-2" /> Log out
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
