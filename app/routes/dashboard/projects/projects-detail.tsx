import { useLoaderData, useParams } from 'react-router';

export async function loader({ params }: { params: { projectId?: string } }) {
  const response = await fetch(
    `http://localhost:3001/projects/${params.projectId}`
  );
  if (!response.ok) throw new Error('Project not found');
  const project = await response.json();
  return { project };
}

export default function ProjectDetails() {
  const { project } = useLoaderData() as {
    project: { id: string; name: string; badge: string };
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{project.name}</h2>
      <p>Badge: {project.badge}</p>
      <p>ID: {project.id}</p>
    </div>
  );
}
