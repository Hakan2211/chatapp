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
    route('projects', './routes/dashboard/projects/projects.tsx', [
      route('editor', './routes/dashboard/projects/projects.editor.tsx'),
      route('summary', './routes/dashboard/projects/projects.summary.tsx'),
      route('notes', './routes/dashboard/projects/projects.notes.tsx'),
    ]),

    route(
      'projects/:projectId',
      './routes/dashboard/projects/projects-detail.tsx',
      [
        route(
          'chats/:chatId',
          './routes/dashboard/projects/projects-detail.chats.tsx'
        ),
      ]
    ),
    route('notes', './routes/dashboard/notes/notes.tsx'),
    route('education', './routes/dashboard/education/education.tsx'),
  ]),
] satisfies RouteConfig;
