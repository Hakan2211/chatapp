import { Outlet, useParams, useNavigate } from 'react-router';
import TwoColumnResizeLayout from '#/components/layout/mainOutlet/twoColumnResizeLayout';
//import { Tabs, Tab } from '#/components/ui/tabs';
//import Chat from '#/components/chat';
import { useTwoColumnContext } from '#/context/twoColumnContext';
import { useState } from 'react';

export default function Projects() {
  const { projectId } = useParams();
  // const { addProject, projects } = useTwoColumnContext();
  // const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');

  // // Handle project creation
  const handleCreateProject = () => {
    if (projectName.trim()) {
      const newProject = { name: projectName, files: [] };
      // addProject(newProject);
      setProjectName('');
      // navigate(`/projects/${newProject.id}`);
    }
  };

  // Show project list if no projectId
  if (!projectId) {
    return (
      <TwoColumnResizeLayout autoSaveId="projects-layout">
        <TwoColumnResizeLayout.LeftPanel title="Chat">
          {/* <Chat /> */}Hello
        </TwoColumnResizeLayout.LeftPanel>
        <TwoColumnResizeLayout.RightPanel title="Create Project">
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">New Project</h3>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="p-2 border rounded w-full mb-4"
              placeholder="Project name"
            />
            <button
              onClick={handleCreateProject}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Create Project
            </button>
            <h3 className="text-lg font-medium mt-6 mb-4">Existing Projects</h3>
            <ul className="space-y-2">
              {/* {projects.map((project) => (
                <li key={project.id}>
                  <NavLink
                    to={`/projects/${project.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    {project.name}
                  </NavLink>
                </li>
              ))} */}
            </ul>
          </div>
        </TwoColumnResizeLayout.RightPanel>
      </TwoColumnResizeLayout>
    );
  }

  return (
    <TwoColumnResizeLayout autoSaveId="projects-layout">
      <TwoColumnResizeLayout.LeftPanel title="Chat">
        {/* <Chat projectId={projectId} /> */}left panel
      </TwoColumnResizeLayout.LeftPanel>
      <TwoColumnResizeLayout.RightPanel title={`Project: ${projectId}`}>
        {/* <Tabs>
          <Tab to={`${projectId}/editor`} label="Editor" />
          <Tab to={`${projectId}/summary`} label="Summary" />
          <Tab to={`${projectId}/notes`} label="Notes" />
        </Tabs> */}
        Right panel
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </TwoColumnResizeLayout.RightPanel>
    </TwoColumnResizeLayout>
  );
}
