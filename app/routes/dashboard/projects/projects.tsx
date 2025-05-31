import {
  useLoaderData,
  type LoaderFunctionArgs,
  Outlet,
  redirect,
  useNavigate,
  useFetcher,
  type ActionFunctionArgs,
  data,
} from 'react-router';
import AppLayout from '#/components/layout/sidebar/appLayout';
import { ProjectsPanelContent } from '#/components/sidebar/panels/projectsPanelContent';
import type { Project } from '#/types/appTypes';
import {
  buildProjectTree,
  type ProjectWithChildren,
} from '#/lib/project-tree-utils';
import { useState } from 'react';
import { MAX_PROJECT_NESTING_DEPTH } from '#/lib/project-tree-utils';
import { prisma } from '#/utils/db.server';
import { getUser } from '#/utils/auth.server';

//--------------------------------------------------------- Loaders---------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  try {
    const flatProjectsFromDb = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' }, // Or by name, etc.
    });

    // Cast to your app's Project type if it's different, though here PrismaProjectType is fine
    const projectTree: ProjectWithChildren[] = buildProjectTree(
      flatProjectsFromDb as any
    ); // Cast if buildProjectTree expects your appTypes.Project

    return { projects: projectTree, user };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { projects: [], user, error: 'Failed to load projects.' };
  }
}

//--------------------------------------------------------- Actions---------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------

export async function action({ request }: ActionFunctionArgs) {
  const userId = 'cma9bzpxj0002uc8kvztzin2r'; //placeholder for now

  const formData = await request.formData();
  const actionType = formData.get('_action') as string;

  // --- CREATE PROJECT ---
  if (actionType === 'createProject') {
    const name = formData.get('name') as string;
    const parentId = formData.get('parentId') as string | null;

    if (!name || name.trim() === '') {
      return { errors: { name: 'Project name is required' } };
    }

    // Nesting depth check (simplified for now, more robust check might be needed)

    if (parentId) {
      const parentProject = await prisma.project.findUnique({
        where: { id: parentId, userId },
      });
      if (!parentProject) {
        return { errors: { parentId: 'Parent project not found' } };
      }
      // To implement MAX_PROJECT_NESTING_DEPTH, you'd need to trace back to root
      // or store depth on the project model. For now, we'll assume UI prevents exceeding.
      // A simple check: if parentProject.parentId exists and MAX_PROJECT_NESTING_DEPTH is 1, disallow.
      // This assumes your MAX_PROJECT_NESTING_DEPTH is 0-indexed level,
      // so if MAX_PROJECT_NESTING_DEPTH = 1, a project at level 1 (parentProject.parentId is null) can have children,
      // but a project at level 2 (parentProject.parentId is not null) cannot.
      let currentLevel = 0;
      let tempParent = parentProject;
      while (tempParent.parentId) {
        const grandParent = await prisma.project.findUnique({
          where: { id: tempParent.parentId },
        });
        if (!grandParent) break; // Should not happen if data is consistent
        tempParent = grandParent;
        currentLevel++;
      }
      if (currentLevel >= MAX_PROJECT_NESTING_DEPTH) {
        return {
          errors: {
            parentId: `Cannot create sub-project: Maximum nesting depth of ${
              MAX_PROJECT_NESTING_DEPTH + 1
            } levels reached.`,
          },
        };
      }
    }

    try {
      const newProject = await prisma.project.create({
        data: {
          name: name.trim(),
          userId,
          parentId: parentId && parentId.trim() !== '' ? parentId.trim() : null,
          // Add other default fields if necessary
        },
      });
      return { success: true, project: newProject };
    } catch (error) {
      console.error('Failed to create project:', error);
      return { errors: { general: 'Failed to create project.' } };
    }
  }

  // --- RENAME PROJECT ---
  if (actionType === 'renameProject') {
    const itemId = formData.get('itemId') as string; // This is projectId
    const newName = formData.get('newName') as string;

    if (!itemId) {
      return { errors: { itemId: 'Project ID is required for renaming' } };
    }
    if (!newName || newName.trim() === '') {
      return { errors: { newName: 'New project name is required' } };
    }

    try {
      // Ensure user owns the project
      const projectToUpdate = await prisma.project.findFirst({
        where: { id: itemId, userId },
      });

      if (!projectToUpdate) {
        return { errors: { general: 'Project not found or access denied.' } };
      }

      const updatedProject = await prisma.project.update({
        where: { id: itemId }, // Prisma needs the unique id here
        data: { name: newName.trim() },
      });
      return { success: true, project: updatedProject };
    } catch (error) {
      console.error('Failed to rename project:', error);
      return { errors: { general: 'Failed to rename project.' } };
    }
  }

  // --- DELETE PROJECT ---
  if (actionType === 'deleteProject') {
    const projectId = formData.get('projectId') as string;

    if (!projectId) {
      return { errors: { projectId: 'Project ID is required for deletion' } };
    }

    try {
      // Ensure user owns the project
      const projectToDelete = await prisma.project.findFirst({
        where: { id: projectId, userId },
        include: { children: true }, // To check if it has children
      });

      if (!projectToDelete) {
        return { errors: { general: 'Project not found or access denied.' } };
      }

      // Handle deletion of children:
      // Option 1: Disallow deleting projects with children (force user to delete children first)
      // if (projectToDelete.children && projectToDelete.children.length > 0) {
      //   return json({ errors: { general: 'Cannot delete project with sub-projects. Please delete sub-projects first.' }}, { status: 400 });
      // }

      // Option 2: Recursive delete (more complex, handle with care, especially for chats/notes inside)
      // This requires a transaction and careful deletion order.
      // For now, let's assume simple delete. Prisma's `onDelete: Cascade` on relations in your schema
      // would handle cascading deletes of related Chats and Notes if set up that way.
      // If `parentId` relation in Project to itself also has `onDelete: Cascade` or `SetNull`,
      // that will affect children. If `onDelete: Restrict` (default for optional relations),
      // Prisma will prevent deleting a parent if children exist.

      // Simplest approach: Delete the project. Prisma will enforce relational constraints.
      // If you have `onDelete: Cascade` from Project to its Chats/Notes, they will be deleted.
      // If `Project.children` relation (Project to Project for parentId) has `onDelete: SetNull`,
      // children will become root projects. If `Cascade`, children will be deleted.
      // Be very careful with cascade deletes in a self-referencing hierarchy.
      // Often, it's safer to update children's parentId to null or delete them iteratively.

      // For now, a direct delete. Ensure your Prisma schema relations handle children appropriately.
      // (e.g., `parent    Project?  @relation("ProjectChildren", fields: [parentId], references: [id], onDelete: SetNull)`)
      // If `onDelete: SetNull` on the child's `parent` relation, children become root.
      // If `onDelete: Cascade` on the child's `parent` relation, children get deleted. This is dangerous for self-ref.
      // It's usually better to handle child project re-parenting or deletion explicitly.

      // Let's assume for now you want to make children root projects (requires `onDelete: SetNull` on the relation from child to parent)
      // OR you disallow deleting projects with children.
      // For a clean delete, you might need to recursively delete children or update their parentId to null.
      // This example just deletes the single project.
      await prisma.project.delete({
        where: { id: projectId },
      });

      return { success: true, deletedProjectId: projectId };
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      // Prisma error P2014: "The change you are trying to make would violate the required relation '{relation_name}' between the {model_a_name} and {model_b_name} models."
      // This happens if you try to delete a parent project and it has children, and the relation doesn't allow it (e.g. no onDelete or Restrict)
      if (error.code === 'P2003' || error.code === 'P2014') {
        // Foreign key constraint failed
        return {
          errors: {
            general:
              'Cannot delete this project. It may have sub-projects or other dependent items that need to be removed first.',
          },
        }; // Conflict
      }
      return { errors: { general: 'Failed to delete project.' } };
    }
  }

  return { error: 'Invalid action' };
}

//--------------------------------------------------------- End of Actions---------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------

//--------------------------------------------------------- Component JSX---------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------

export default function Projects() {
  const { projects, user } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  // Modal states (simplified, you might use a more robust system or Zustand/Context)
  const [isAddSubProjectModalOpen, setIsAddSubProjectModalOpen] =
    useState(false);
  const [currentParentIdForNewSubProject, setCurrentParentIdForNewSubProject] =
    useState<string | null>(null);

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [projectToRename, setProjectToRename] =
    useState<ProjectWithChildren | null>(null);

  // ... other modal states for delete confirmation etc.

  const handleOpenAddNewSubProjectModal = (parentId: string | null) => {
    console.log(
      'Open modal to add sub-project to parent ID:',
      parentId || ' (Root Project)'
    );
    setCurrentParentIdForNewSubProject(parentId);
    setIsAddSubProjectModalOpen(true);
    // In a real app, you'd open a Shadcn Dialog or custom modal here
    // that would then contain a form to submit to a Remix action.
  };

  const handleOpenRenameProjectModal = (project: ProjectWithChildren) => {
    console.log('Open modal to rename project:', project.name);
    setProjectToRename(project);
    setIsRenameModalOpen(true);
    // Open rename modal
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${projectName}" and all its contents?`
      )
    ) {
      console.log(`Confirmed delete for ${projectId}`);
      // THIS LINE WAS COMMENTED OUT - IT'S ESSENTIAL FOR DELETION
      fetcher.submit(
        { projectId, _action: 'deleteProject' },
        {
          method: 'POST',
          // 'action' prop can be omitted to submit to the current route's action
          // Since this component's module defines the action, this is correct.
        }
      );
    }
  };

  const handleAddChatToProject = (projectId: string) => {
    console.log('Add new chat to project ID:', projectId);
    // This would navigate to the "new chat" route, passing the projectId
    // e.g., navigate(`/projects/${projectId}/chats/new`);
    // Or, if chat input is always visible, set context for the next chat.
    alert(`Navigate to new chat for project ${projectId}`);
  };

  return (
    <AppLayout
      content={
        <ProjectsPanelContent
          rootProjects={projects}
          handleOpenAddNewSubProjectModal={handleOpenAddNewSubProjectModal}
          handleOpenRenameProjectModal={handleOpenRenameProjectModal}
          handleDeleteProject={handleDeleteProject}
          handleAddChatToProject={handleAddChatToProject}
        />
      }
      user={user}
    >
      <Outlet />
    </AppLayout>
  );
}
