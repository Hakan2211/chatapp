import { useLoaderData, type LoaderFunctionArgs, Outlet } from 'react-router';
import AppLayout from '#/components/layout/sidebar/appLayout';
import { ProjectsPanelContent } from '#/components/sidebar/panels/projectsPanelContent';
import type { Project } from '#/types/appTypes';

export async function loader({ request }: LoaderFunctionArgs) {
  const projects: Project[] = [
    {
      id: '1',
      userId: 'cma9bzpxj0002uc8kvztzin2r',
      name: 'Project 1',
      createdAt: new Date(),
      updatedAt: new Date(),
      parentId: null,
      description: null,
      starred: false,
    },
    {
      id: '2',
      userId: 'cma9bzpxj0002uc8kvztzin2r',
      name: 'Project 2',
      createdAt: new Date(),
      updatedAt: new Date(),
      description: null,
      starred: false,
      parentId: null,
    },
    {
      id: '3',
      userId: 'cma9bzpxj0002uc8kvztzin2r',
      name: 'Project 3',
      createdAt: new Date(),
      updatedAt: new Date(),
      description: null,
      starred: false,
      parentId: '1',
    },
  ];
  return { projects };
}

export default function Projects() {
  const data = useLoaderData<typeof loader>();
  console.log(data, 'data');

  return (
    <AppLayout content={<ProjectsPanelContent projects={data.projects} />}>
      <Outlet />
    </AppLayout>
  );
}
