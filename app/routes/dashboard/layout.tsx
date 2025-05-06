import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '#/components/ui/sidebar';
// import { SettingsPanelProvider } from '#/components/ui/settings-panel';
import { Outlet, useLoaderData } from 'react-router';
import { TwoColumnProvider } from '#/context/twoColumnContext';

import {
  mockProjectFiles,
  mockNotes,
  type Note,
  type MockProjectFilesData,
  type ProjectFileTreeItem, // If needed explicitly
} from '#/mockData/mockData'; // Adjust path if necessary
import { AppSidebar } from '#/components/layout/sidebar/appSidebar';
import { type LoaderFunctionArgs, type ActionFunctionArgs } from 'react-router';
import { prisma } from '#/utils/db.server';
import LayoutSidebar from '#/components/layout/sidebar/LayoutSidebar';
export type SidebarData = {
  projects: MockProjectFilesData; // <-- Use the nested data type
  notes: Note[]; // <-- Keep using Note[]
};

export async function loader({ request }: LoaderFunctionArgs) {
  const projects = await prisma.project.findMany({
    where: {
      userId: 'cma9bzpxj0002uc8kvztzin2r',
      parentId: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return { projects };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent')?.toString();
  const userId = 'user1'; // Replace with actual user ID from session

  if (intent === 'create') {
    const name = formData.get('name')?.toString();
    if (!name) {
      return new Response(
        JSON.stringify({ error: 'Project name is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    const project = await prisma.project.create({
      data: {
        name,
        userId,
      },
    });
    // Return plain object on success, React Router handles serialization
    return { project };
  }

  if (intent === 'update') {
    const id = formData.get('id')?.toString();
    const name = formData.get('name')?.toString();
    if (!id || !name) {
      return new Response(
        JSON.stringify({ error: 'Project ID and name are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    const project = await prisma.project.update({
      where: { id },
      data: { name },
    });
    return { project };
  }

  if (intent === 'delete') {
    const id = formData.get('id')?.toString();
    if (!id) {
      return new Response(JSON.stringify({ error: 'Project ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    await prisma.project.delete({
      where: { id },
    });
    return { success: true };
  }

  return new Response(JSON.stringify({ error: 'Invalid intent' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default function DashboardLayout() {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '350px',
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="bg-sidebar group/sidebar-inset">
        <header className="sticky top-0 flex shrink-0 bg-sidebar p-3">
          <SidebarTrigger className="-ml-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
        </header>
        <TwoColumnProvider>
          <div className="flex h-[calc(100svh-4rem)] bg-background md:rounded-lg md:group-peer-data-[state=collapsed]/sidebar-inset:rounded-s-none transition-all ease-in-out duration-300">
            <Outlet />
          </div>
        </TwoColumnProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
