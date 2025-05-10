import { useLoaderData, type LoaderFunctionArgs } from 'react-router';
import ProjectMainLayout from '#/components/projects/projectsMain';

export async function projectDetailLoader({
  params,
}: LoaderFunctionArgs): Promise<any> {
  const projectId = params.projectId;

  console.log(`Loading details for project: ${projectId}`);
  return {
    projectData: { name: `Project ${projectId}` /* ... more data ... */ },
  };
}

export default function ProjectDetailPage() {
  // const { projectId, projectData } = useLoaderData() as any; // Cast to your loader's return type

  return (
    // Pass any necessary project-specific data to ProjectWorkspaceLayout if needed
    <ProjectMainLayout /* projectId={projectId} projectData={projectData} */ />
  );
}
