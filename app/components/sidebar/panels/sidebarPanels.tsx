// ProjectsTree in ContentPanel Experimentation to nest Projects and show nested folders
// I will implement this later with React-arborist package
//https://github.com/brimdata/react-arborist

import {
  type ProjectFileTreeItem,
  type ProjectTreeOptions,
} from '#/mockData/mockData'; // Adjust path as needed

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
    let originalItem = item;

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
