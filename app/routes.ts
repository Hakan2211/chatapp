import {
  type RouteConfig,
  index,
  route,
  layout,
  prefix,
} from '@react-router/dev/routes';

export default [
  index('./routes/landing.tsx'),

  //auth
  ...prefix('auth', [
    route('signup', './routes/auth/signup.tsx'),
    route('login', './routes/auth/login.tsx'),
    route('logout', './routes/auth/logout.tsx'),
    route('google', './routes/auth/google.tsx'),
    route('google/callback', './routes/auth/google.callback.tsx'),
  ]),

  //icon-sidebar with outlet for InformationSidebar
  layout('./routes/dashboard/layout.tsx', [
    route('dashboard', './routes/dashboard/index.tsx'),
    route('projects', './routes/dashboard/projects/projects.tsx', [
      index('./routes/dashboard/projects/projects-index.tsx'),
      route(':projectId', './routes/dashboard/projects/projects-detail.tsx', [
        route(
          'chats/:chatId',
          './routes/dashboard/projects/projects-detail.chats.tsx',
          []
        ),
        route('editor', './routes/dashboard/projects/projects.editor.tsx'),
        route('summary', './routes/dashboard/projects/projects.summary.tsx'),
        route('notes', './routes/dashboard/projects/projects.notes.tsx'),
      ]),
    ]),

    route('notes', './routes/dashboard/notes/notes.tsx'),
    route('education', './routes/dashboard/education/education.tsx'),
  ]),
] satisfies RouteConfig;
