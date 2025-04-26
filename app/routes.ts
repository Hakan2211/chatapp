import {
  type RouteConfig,
  index,
  route,
  layout,
} from '@react-router/dev/routes';

export default [
  index('./routes/landing.tsx'),
  layout('./routes/dashboard/layout.tsx', [
    route('dashboard', './routes/dashboard/index.tsx'),
    route('projects', './routes/dashboard/projects/projects.tsx'),
    route(
      'projects/:projectId',
      './routes/dashboard/projects/projects-detail.tsx'
    ),
    route('notes', './routes/dashboard/notes/notes.tsx'),
    route('education', './routes/dashboard/education/education.tsx'),
  ]),
] satisfies RouteConfig;
