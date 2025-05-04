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
  Trash2,
} from 'lucide-react';
// Assuming 'react-router' Link is intended for a specific routing setup.
// If using react-router-dom v6+, use Link from 'react-router-dom'.
// Using a placeholder Link if not fully set up.
// import { Link } from 'react-router'; // Original import
const Link = (
  { to, children, ...props }: any // Placeholder Link
) => (
  <a href={to} {...props}>
    {children}
  </a>
);
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
} from '#/mockData/mockData'; // Adjust path as needed
import { NavLink } from 'react-router';

// --- Helper Functions (updateStarredStatus, updateItemName, deleteItem - if needed) ---

// updateStarredStatus remains largely the same, ensure it correctly handles
// the structure [name, options] for files that become starred.
function updateStarredStatus(
  items: ProjectFileTreeItem[],
  path: string[],
  level = 0
): ProjectFileTreeItem[] {
  if (!items) return []; // Guard against undefined items

  const targetName = path[level];

  return items.map((item): ProjectFileTreeItem => {
    let currentName: string;
    let currentItems: ProjectFileTreeItem[] = [];
    let currentOptions: ProjectTreeOptions = {};
    let isFolder = false;
    let originalItem = item; // Keep original reference if needed

    if (typeof item === 'string') {
      currentName = item;
      // A simple string is never a folder in this logic
    } else if (Array.isArray(item)) {
      currentName = item[0];
      const lastElement = item[item.length - 1];
      const hasOptions =
        typeof lastElement === 'object' &&
        lastElement !== null && // Ensure not null
        !Array.isArray(lastElement);

      currentOptions = hasOptions ? (lastElement as ProjectTreeOptions) : {};
      const potentialChildren = item.slice(
        1,
        hasOptions ? item.length - 1 : item.length
      );
      // Check if any potential child is actually a valid tree item (string or array)
      isFolder = potentialChildren.some(
        (child) => typeof child === 'string' || Array.isArray(child)
      );
      currentItems = isFolder
        ? (potentialChildren as ProjectFileTreeItem[])
        : [];

      // Refine: An item like ['FolderName'] or ['FolderName', {options}] might visually be a folder
      // but act like a file if it has no children defined yet.
      // Let's stick to: if it has defined children, it's a folder for recursion.
      // If it's an array structure but no children, recursion stops.
    } else {
      console.error('Invalid item structure encountered:', item);
      return item; // Return invalid item as is
    }

    // If this is not the item we're looking for at this level, return it as is
    if (currentName !== targetName) {
      return originalItem;
    }

    // If this IS the item and we are at the final level of the path
    if (level === path.length - 1) {
      const newOptions = {
        ...currentOptions,
        starred: !currentOptions?.starred, // Toggle starred status safely
      };

      // Reconstruct the item immutably
      if (typeof originalItem === 'string') {
        // If it was a string, promote it to [name, options]
        return [currentName, newOptions];
      } else if (Array.isArray(originalItem)) {
        if (isFolder) {
          // Reconstruct folder: [name, ...children, newOptions]
          return [currentName, ...currentItems, newOptions];
        } else {
          // Reconstruct file originally in array form: [name, newOptions]
          // This handles ['fileName'] becoming ['fileName', {starred: true}]
          // And ['fileName', {oldOptions}] becoming ['fileName', {newOptions}]
          return [currentName, newOptions];
        }
      }
    }

    // If this IS the item but not the final level, recurse deeper *only if it's a folder*
    if (isFolder && level < path.length - 1) {
      const updatedItems = updateStarredStatus(currentItems, path, level + 1);
      // Reconstruct folder item with updated children
      return [currentName, ...updatedItems, currentOptions]; // Keep original options object reference
    }

    // If it's not a folder and we aren't at the last level, path is invalid for structure
    if (!isFolder && level < path.length - 1) {
      console.warn(
        'Path mismatch during star toggle (attempted to traverse into non-folder):',
        path,
        level,
        item
      );
      return originalItem; // Return original item
    }

    // Default fallback (e.g., item found but path ended prematurely?)
    return originalItem;
  });
}

function updateItemName(
  tree: ProjectFileTreeItem[],
  path: string[],
  newName: string
): ProjectFileTreeItem[] {
  if (!tree) return []; // Guard

  return tree.map((item): ProjectFileTreeItem => {
    let currentName: string;
    let currentItems: ProjectFileTreeItem[] = [];
    let currentOptions: ProjectTreeOptions = {};
    let isFolder = false;
    let originalItem = item; // Keep original reference

    // --- Same parsing logic as updateStarredStatus ---
    if (typeof item === 'string') {
      currentName = item;
    } else if (Array.isArray(item)) {
      currentName = item[0];
      const lastElement = item[item.length - 1];
      const hasOptions =
        typeof lastElement === 'object' &&
        lastElement !== null &&
        !Array.isArray(lastElement);
      currentOptions = hasOptions ? (lastElement as ProjectTreeOptions) : {};
      const potentialChildren = item.slice(
        1,
        hasOptions ? item.length - 1 : item.length
      );
      isFolder = potentialChildren.some(
        (child) => typeof child === 'string' || Array.isArray(child)
      );
      currentItems = isFolder
        ? (potentialChildren as ProjectFileTreeItem[])
        : [];
    } else {
      console.error('Invalid item structure encountered during rename:', item);
      return item;
    }

    const targetName = path[0]; // Target name at the current level

    // If this isn't the item we're looking for at this level, return it unchanged.
    if (currentName !== targetName) {
      return originalItem;
    }

    // If this IS the item and we're at the end of the path (the item to rename).
    if (path.length === 1) {
      // Reconstruct the item with the new name, preserving structure and options.
      if (typeof originalItem === 'string') {
        // String file: becomes newName (string) or [newName, {}] if options might be added?
        // Let's return just the string for simplicity unless it had options implicitly.
        // If consistency with starred items is needed, return [newName, {}]
        return newName; // Simplest form
        // return [newName, {}]; // Alternative for consistency
      } else if (Array.isArray(originalItem)) {
        if (isFolder) {
          // Folder: [newName, ...children, options]
          return [newName, ...currentItems, currentOptions];
        } else {
          // File represented as array: [newName, options]
          return [newName, currentOptions];
        }
      }
    }

    // If this IS the item but not the end of the path, recurse into its children (if it's a folder).
    if (isFolder && path.length > 1) {
      const remainingPath = path.slice(1);
      const updatedItems = updateItemName(currentItems, remainingPath, newName);
      // Reconstruct the folder with the *original* name but updated children
      return [currentName, ...updatedItems, currentOptions];
    }

    // Invalid path condition: trying to recurse into a non-folder.
    if (!isFolder && path.length > 1) {
      console.warn(
        'Invalid path during rename: Attempted to traverse into a file:',
        path,
        item
      );
      return originalItem; // Return original item
    }

    // Default fallback
    return originalItem;
  });
}

// Placeholder for deleteItem - Implement similar recursive logic
function deleteItem(
  tree: ProjectFileTreeItem[],
  path: string[],
  level = 0
): ProjectFileTreeItem[] {
  if (!tree) return [];

  const targetName = path[level];

  // Filter out the item at the target level if it matches and it's the end of the path
  if (level === path.length - 1) {
    return tree.filter((item) => {
      const itemName =
        typeof item === 'string' ? item : Array.isArray(item) ? item[0] : null;
      return itemName !== targetName;
    });
  }

  // Otherwise, map and recurse into the matching folder
  return tree
    .map((item): ProjectFileTreeItem | null => {
      let currentName: string;
      let currentItems: ProjectFileTreeItem[] = [];
      let currentOptions: ProjectTreeOptions = {};
      let isFolder = false;
      let originalItem = item;

      // --- Parsing logic ---
      if (typeof item === 'string') {
        currentName = item;
      } else if (Array.isArray(item)) {
        currentName = item[0];
        const lastElement = item[item.length - 1];
        const hasOptions =
          typeof lastElement === 'object' &&
          lastElement !== null &&
          !Array.isArray(lastElement);
        currentOptions = hasOptions ? (lastElement as ProjectTreeOptions) : {};
        const potentialChildren = item.slice(
          1,
          hasOptions ? item.length - 1 : item.length
        );
        isFolder = potentialChildren.some(
          (child) => typeof child === 'string' || Array.isArray(child)
        );
        currentItems = isFolder
          ? (potentialChildren as ProjectFileTreeItem[])
          : [];
      } else {
        return item; // Keep invalid item
      }

      if (currentName === targetName && isFolder) {
        const updatedItems = deleteItem(currentItems, path, level + 1);
        // Reconstruct folder with updated children
        // Handle case where folder becomes empty - might need specific logic
        // if you want to remove empty folders automatically.
        return [currentName, ...updatedItems, currentOptions];
      }

      return originalItem; // Keep non-matching items or non-folder items
    })
    .filter((item) => item !== null) as ProjectFileTreeItem[]; // Filter out nulls if any deletion logic returns null
}

interface HomePanelContentProps {
  projects: HomeProjectItem[];
}
// --- 1. Home Panel Content ---
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

// --- 2. Projects Panel Content (with File Tree) ---

type Project = {
  id: string;
  name: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: string;
  parentId: string | null;
  // Add any other relevant fields (e.g., starred, description)
  starred?: boolean;
};

interface ProjectTreeProps {
  projects: Project[];
}

// !!--- UPDATED ProjectTree Component ---!!
//  function ProjectTree({

// }: ProjectTreeProps) {
//   let name: string;
//   let items: ProjectFileTreeItem[] = [];
//   let options: ProjectTreeOptions = {};
//   let isFolder = false;
//   let isActuallyFile = false;

//   if (typeof item === 'string') {
//     name = item;
//     isActuallyFile = true;
//   } else if (Array.isArray(item)) {
//     name = item[0];
//     const lastElement = item[item.length - 1];
//     const hasOptions =
//       typeof lastElement === 'object' &&
//       lastElement !== null &&
//       !Array.isArray(lastElement);
//     options = hasOptions ? (lastElement as ProjectTreeOptions) : {};
//     const potentialChildren = item.slice(
//       1,
//       hasOptions ? item.length - 1 : item.length
//     );
//     // It's a folder *for recursion* if it actually contains child items
//     isFolder = potentialChildren.some(
//       (child) => typeof child === 'string' || Array.isArray(child)
//     );
//     items = isFolder ? (potentialChildren as ProjectFileTreeItem[]) : [];

//     // Determine if it should be treated as a file visually/structurally
//     // It's a file if it's a string OR an array with no children (e.g., ['fileName', {options}])
//     isActuallyFile = !isFolder;
//   } else {
//     // Handle invalid item structure gracefully
//     console.error('Invalid project tree item:', item);
//     return <SidebarMenuItem>Invalid Item</SidebarMenuItem>;
//   }

//   const isStarred = !!options.starred;
//   //const indentStyle = { paddingLeft: `${1 + level * 1.25}rem` }; // Base indent + level multiplier

//   // --- Action Buttons ---
//   const StarButton = (
//     <div // Use div or Button component from UI library if interactive styles are needed
//       role="button"
//       tabIndex={0}
//       className={cn(
//         'flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10', // Added dark mode example
//         'focus:outline-none focus-visible:ring-1 focus-visible:ring-ring', // Adjusted focus style
//         'transition-colors cursor-pointer'
//       )}
//       aria-label={isStarred ? 'Remove from favorites' : 'Add to favorites'}
//       aria-pressed={isStarred}
//     >
//       <Star
//         className={cn(
//           'h-4 w-4 pointer-events-none', // Prevent icon itself from capturing events
//           isStarred
//             ? 'text-amber-500 fill-amber-400'
//             : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300' // Dark mode example
//         )}
//       />
//     </div>
//   );

//   const DeleteButton = (
//     <div
//       role="button"
//       tabIndex={0}
//       onClick={handleDeleteClick}
//       onKeyDown={(e) => {
//         if (e.key === 'Enter' || e.key === ' ') {
//           e.preventDefault();
//           handleDeleteClick(e as any);
//         }
//       }}
//       className={cn(
//         'flex-shrink-0 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30', // Added dark mode example
//         'focus:outline-none focus-visible:ring-1 focus-visible:ring-ring',
//         'transition-colors cursor-pointer'
//       )}
//       aria-label="Delete item"
//     >
//       <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400 pointer-events-none" />
//     </div>
//   );

//   // --- FILE RENDERING ---
//   if (isActuallyFile) {
//     return (
//       // No group needed on SidebarMenuItem
//       <SidebarMenuItem style={indentStyle} className="pr-1">
//         {/* Add group/item to the Button */}
//         <SidebarMenuButton
//           className={cn(
//             'group/item w-full', // Ensure button takes full width
//             'data-[active=true]:bg-black/5 data-[active=true]:text-black', // Example active styles
//             'dark:data-[active=true]:bg-white/10 dark:data-[active=true]:text-white',
//             'justify-start', // Align content to the start
//             'hover:bg-black/[.03] dark:hover:bg-white/[.03]' // Subtle hover for the whole row via button
//           )}
//           onClick={() => console.log('Open file:', path.join('/'))} // Log full path
//         >
//           {/* File Icon */}
//           <File className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500 dark:text-gray-400" />
//           {/* Name or Edit Input */}
//           {isEditing ? (
//             <form onSubmit={handleNameSubmit} className="flex-1 min-w-0">
//               <Input
//                 value={editName}
//                 onChange={handleNameChange}
//                 onBlur={handleNameBlur}
//                 onKeyDown={(e) => {
//                   if (e.key === 'Escape') {
//                     e.stopPropagation();
//                     setIsEditing(false);
//                     setEditName(name);
//                   }
//                 }} // Escape cancels edit
//                 autoFocus
//                 className="h-6 text-sm px-1 py-0 w-full bg-white dark:bg-gray-800 border border-blue-500" // Style the input
//                 onClick={(e) => e.stopPropagation()} // Prevent click passing to button
//               />
//             </form>
//           ) : (
//             <span className="truncate flex-1" onDoubleClick={handleDoubleClick}>
//               {name}
//             </span>
//           )}
//           {/* Action Icons - Controlled by group-hover/item on the Button */}
//           <div className="ml-auto flex items-center flex-shrink-0 gap-1 opacity-0 group-hover/item:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
//             {StarButton}
//             {DeleteButton}
//           </div>
//         </SidebarMenuButton>
//       </SidebarMenuItem>
//     );
//   }

//   // --- FOLDER RENDERING ---
//   return (
//     // No group needed on SidebarMenuItem
//     <SidebarMenuItem className="p-0">
//       <Collapsible>
//         <CollapsibleTrigger asChild>
//           {/* Add group/item to the Button */}
//           <SidebarMenuButton
//             style={indentStyle}
//             className={cn(
//               'group/item w-full', // Ensure button takes full width
//               'pr-1 justify-start', // Align content start
//               '[&[data-state=open]>svg:first-of-type]:rotate-90', // Rotate chevron
//               'hover:bg-black/[.03] dark:hover:bg-white/[.03]' // Subtle hover
//             )}
//             // No onClick needed here if using CollapsibleTrigger, unless you want an action on folder click itself
//           >
//             {/* Chevron Icon */}
//             <ChevronRight className="h-4 w-4 mr-1 flex-shrink-0 transition-transform duration-200 text-gray-400 dark:text-gray-500" />
//             {/* Folder Icon */}
//             <Folder className="h-4 w-4 mr-2 flex-shrink-0 text-sky-600 dark:text-sky-400" />
//             {/* Name or Edit Input */}
//             {isEditing ? (
//               <form onSubmit={handleNameSubmit} className="flex-1 min-w-0">
//                 <Input
//                   value={editName}
//                   onChange={handleNameChange}
//                   onBlur={handleNameBlur}
//                   onKeyDown={(e) => {
//                     if (e.key === 'Escape') {
//                       e.stopPropagation();
//                       setIsEditing(false);
//                       setEditName(name);
//                     }
//                   }}
//                   autoFocus
//                   className="h-6 text-sm px-1 py-0 w-full bg-white dark:bg-gray-800 border border-blue-500"
//                   onClick={(e) => e.stopPropagation()}
//                 />
//               </form>
//             ) : (
//               <span
//                 className="truncate flex-1 font-medium"
//                 onDoubleClick={handleDoubleClick}
//               >
//                 {name}
//               </span>
//             )}
//             {/* Action Icons - Controlled by group-hover/item on the Button */}
//             <div className="ml-auto flex items-center flex-shrink-0 gap-1 opacity-0 group-hover/item:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
//               {StarButton}
//               {DeleteButton}
//             </div>
//           </SidebarMenuButton>
//         </CollapsibleTrigger>
//         <CollapsibleContent>
//           {/* Use SidebarMenu for semantic structure and potential styling */}
//           <SidebarMenu className="flex w-full flex-col pl-0">
//             {' '}
//             {/* Reset padding if needed */}
//             {items.length > 0 ? (
//               items.map((subItem, index) => {
//                 // Determine the name of the sub-item for the key and path
//                 let subItemName: string;
//                 if (typeof subItem === 'string') {
//                   subItemName = subItem;
//                 } else if (Array.isArray(subItem)) {
//                   subItemName = subItem[0];
//                 } else {
//                   subItemName = `invalid-item-${index}`; // Fallback key
//                 }

//                 // Construct the path for the child item
//                 const childPath = [...path, subItemName];

//                 return (
//                   <ProjectTree
//                     key={childPath.join('/')} // Use a unique key based on path
//                     item={subItem}
//                     level={level + 1}
//                     path={childPath}
//                     onToggleStar={onToggleStar}
//                     onDelete={onDelete}
//                     onRename={onRename}
//                   />
//                 );
//               })
//             ) : (
//               // Optional: Render something if folder is empty?
//               <SidebarMenuItem
//                 style={{ paddingLeft: `${1 + (level + 1) * 1.25}rem` }}
//               >
//                 <div className="text-xs text-gray-400 italic py-1">Empty</div>
//               </SidebarMenuItem>
//             )}
//           </SidebarMenu>
//         </CollapsibleContent>
//       </Collapsible>
//     </SidebarMenuItem>
//   );
// }

interface ProjectsPanelContentProps {
  projects: Project[]; // Use the specific type for project data
}

export function ProjectsPanelContent({ projects }: ProjectsPanelContentProps) {
  // Initialize state with the passed projects data

  return (
    <>
      {/* Make the main container scrollable */}
      <SidebarGroup className="flex-1 overflow-y-auto py-2">
        <SidebarGroupContent>
          {/* Use SidebarMenu for the root level */}
          <SidebarMenu>
            {projects && projects.length > 0 ? (
              projects.map((project) => (
                <SidebarMenuItem key={project.id} className="p-0">
                  {/* Use NavLink to navigate to the project's detail/editor */}
                  {/* Adjust the `to` path as per your routing structure */}
                  <NavLink
                    to={`/projects/${project.id}/editor`} // Example path
                    className={(
                      { isActive } // Use NavLink's isActive
                    ) =>
                      cn(
                        'block w-full' // Make the link fill the item
                        // Remove default NavLink styling if SidebarMenuButton handles it
                      )
                    }
                    // Prevent NavLink default style interfering with Button style
                    style={({ isActive }) => ({
                      textDecoration: 'none',
                      color: 'inherit',
                    })}
                  >
                    {(
                      { isActive } // Get isActive from NavLink render prop
                    ) => (
                      <SidebarMenuButton
                        className={cn(
                          'w-full justify-start px-4 py-2 text-sm', // Standard button styling
                          isActive
                            ? 'bg-black/5 dark:bg-white/10 text-primary'
                            : 'hover:bg-black/[.03] dark:hover:bg-white/[.03]' // Active/hover states
                        )}
                        // Remove onClick if navigation is handled by NavLink
                        // Add group/item if needed for hover actions on project level later
                      >
                        {project.starred ? (
                          <Star className="h-3.5 w-3.5 mr-2 text-amber-400 fill-amber-400 flex-shrink-0" />
                        ) : (
                          // Use Folder icon or a placeholder for alignment
                          <Folder className="h-3.5 w-3.5 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                          // <span className="w-3.5 h-3.5 mr-2 flex-shrink-0"></span> // Alternative placeholder
                        )}
                        <span className="truncate flex-1 font-medium">
                          {project.name}
                        </span>
                        {/* Add project-level actions (e.g., delete, rename buttons) here if needed */}
                        {/* Example: <ProjectActions project={project} /> */}
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No projects found. <br />
                Click 'New Project' to create one.
              </div>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Keep the "New Project/File" button, but maybe rename it */}
      <SidebarGroup className="mt-auto p-4 border-t border-[var(--sidebar-border-color)]">
        <Button
          className="w-full rounded-md h-9 text-sm font-medium"
          onClick={() => console.log('Trigger New Project Action')} // Implement the actual action
        >
          <PlusCircle className="h-4 w-4 mr-2" /> New Project
        </Button>
      </SidebarGroup>
    </>
  );
}

// --- 3. Notes Panel Content ---
interface NotesPanelContentProps {
  notes: Note[];
}
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
            className="text-xs h-7 px-2" // Adjust size
          >
            All
          </Button>
          <Button
            variant={filter === 'solo' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('solo')}
            className="text-xs h-7 px-2"
          >
            Solo
          </Button>
          <Button
            variant={filter === 'group' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('group')}
            className="text-xs h-7 px-2"
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
                  className="block p-0" // Remove padding from item
                >
                  {/* Use button for better semantics and hover */}
                  <SidebarMenuButton className="h-auto flex-col items-start whitespace-normal py-2.5 px-4 hover:bg-black/[.03] dark:hover:bg-white/[.03] rounded-none w-full text-left">
                    <div className="flex items-center justify-between w-full mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {note.title}
                      </h4>
                      <SidebarMenuBadge>{note.type}</SidebarMenuBadge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 line-clamp-2 w-full">
                      {note.snippet}
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 w-full">
                      <Clock className="h-3 w-3" />
                      {note.timestamp}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          ) : (
            <div className="py-12 text-center flex flex-col items-center gap-3 px-4">
              <div className="h-10 w-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <FileText className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">No notes found</p>
                <p className="text-xs text-black/50 dark:text-white/50">
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

// --- 5. Account Panel Content ---
export function AccountPanelContent() {
  return (
    <>
      <SidebarGroup className="flex-1 py-2">
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
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="mt-auto p-4 border-t border-[var(--sidebar-border-color)]">
        {/* Use SidebarMenu for consistency even with one item */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300 font-medium"
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

// --- Example Usage (If needed for context) ---
/*
function App() {
    // Assume you fetch or have mockProjectFiles data available
    const projectsData = mockProjectFiles;
    const notesData = mockNotes;
    const homeProjectsData = mockHomeProjects;

    const [activePanel, setActivePanel] = useState('projects'); // Example state

    return (
        <div className="flex h-screen">
            <div className="w-16 bg-gray-200"> // Simple Tab Bar Placeholder
                <button onClick={() => setActivePanel('home')}>H</button>
                <button onClick={() => setActivePanel('projects')}>P</button>
                 <button onClick={() => setActivePanel('notes')}>N</button>
                 <button onClick={() => setActivePanel('education')}>E</button>
                 <button onClick={() => setActivePanel('account')}>A</button>
            </div>
            <div className="w-64 border-r border-[var(--sidebar-border-color)] flex flex-col"> // Sidebar Panel Area
                {activePanel === 'home' && <HomePanelContent projects={homeProjectsData} />}
                {activePanel === 'projects' && <ProjectsPanelContent projects={projectsData} />}
                {activePanel === 'notes' && <NotesPanelContent notes={notesData} />}
                {activePanel === 'education' && <EducationPanelContent />}
                {activePanel === 'account' && <AccountPanelContent />}
            </div>
            <div className="flex-1 bg-gray-50"> // Main Content Area
                Main Content
            </div>
        </div>
    )
}
*/

// Remember to replace placeholder imports and mock data paths with your actual project structure.
