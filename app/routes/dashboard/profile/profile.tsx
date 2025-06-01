import { Outlet, useLoaderData, type LoaderFunctionArgs } from 'react-router';

import { getUser } from '#/utils/auth.server';

import AppLayout from '#/components/layout/sidebar/appLayout';
import ProfilePanelContent from '#/components/sidebar/panels/profilePanelContent';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }
  return { user };
}

export default function Profile() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <AppLayout content={<ProfilePanelContent />} user={user}>
      <Outlet />
    </AppLayout>
  );
}
