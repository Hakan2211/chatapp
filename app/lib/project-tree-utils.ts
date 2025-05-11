import type { Project as BaseAppProject } from '#/types/appTypes';

export const MAX_PROJECT_NESTING_DEPTH = 1;

// This interface describes the nodes in our client-side/UI tree structure.
// It extends the base project type (PrismaProject) and ensures the 'children'
// property is an array of these tree nodes, making the type recursive.
export interface ProjectWithChildren extends BaseAppProject {
  children: ProjectWithChildren[]; // This overrides/specifies the type of 'children' for our tree
}

export function buildProjectTree(
  flatProjects: BaseAppProject[]
): ProjectWithChildren[] {
  // Map to hold ProjectWithChildren nodes, key'd by ID, for efficient lookup.
  const projectsById: { [id: string]: ProjectWithChildren } = {};
  // Array to hold the root nodes of the tree.
  const rootProjects: ProjectWithChildren[] = [];

  // First pass: Create a ProjectWithChildren node for each flat project.
  // Initialize 'children' as an empty array of the correct recursive type.
  flatProjects.forEach((project) => {
    // `project` is of type BaseAppProject (PrismaProject).
    // It already has all fields like id, name, parentId, starred, etc.
    // It also has a 'children' field from Prisma, typed as BaseAppProject[].
    // We spread `project` and then explicitly overwrite/initialize `children`
    // to be an empty array that will hold `ProjectWithChildren` instances.
    projectsById[project.id] = {
      ...project,
      children: [],
    };
  });

  // Second pass: Link children to their parents using the parentId.
  flatProjects.forEach((project) => {
    // `project` is BaseAppProject, `currentProjectNode` is ProjectWithChildren
    const currentProjectNode = projectsById[project.id];

    if (project.parentId && projectsById[project.parentId]) {
      // If there's a parentId and the parent exists in our map,
      // add this node (which is a ProjectWithChildren) to the parent's 'children' array.
      projectsById[project.parentId].children.push(currentProjectNode);
    } else {
      // Otherwise, it's a root project.
      rootProjects.push(currentProjectNode);
    }
  });

  // Optional: Sort root projects and children within each node (e.g., by name).
  const sortByName = (a: ProjectWithChildren, b: ProjectWithChildren) =>
    a.name.localeCompare(b.name);
  rootProjects.sort(sortByName);
  Object.values(projectsById).forEach((pNode) =>
    pNode.children.sort(sortByName)
  );

  return rootProjects;
}
