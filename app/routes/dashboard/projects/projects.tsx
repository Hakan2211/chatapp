import { useLoaderData, type LoaderFunctionArgs, Outlet } from 'react-router';
import AppLayout from '#/components/layout/sidebar/appLayout';
import {
  ProjectsPanelContent,
  type Project,
} from '#/components/sidebar/panels/sidebarPanels';

export async function loader({ request }: LoaderFunctionArgs) {
  const projects: Project[] = [
    {
      id: '1',
      userId: 'cma9bzpxj0002uc8kvztzin2r',
      name: 'Project 1',
      createdAt: new Date(),
      updatedAt: new Date(),
      parentId: null,
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
