import { Outlet, useLoaderData, redirect, useActionData } from 'react-router';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { formatUserDate } from '#/lib/utils';
import { getUser } from '#/utils/auth.server';
import { deleteUserById, updateUserById } from '#/utils/user.server'; // Add updateUserById
import AppLayout from '#/components/layout/sidebar/appLayout';
import ProfilePanelContent from '#/components/sidebar/panels/profilePanelContent';
import type { User as PrismaUser } from '@prisma/client';

export interface ProfileLoaderData {
  user: PrismaUser;
  formattedDate: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (!user) {
    return redirect('/auth/signup');
  }
  return { user } as ProfileLoaderData;
}

// Define a more specific type for action data
export interface ProfileActionData {
  success?: boolean;
  field?: 'name' | 'username' | 'account'; // To identify which operation was attempted
  message?: string; // General success or error message
  errors?: {
    name?: string;
    username?: string;
    form?: string; // For delete account errors
  };
  // values are less critical here since we reload, but can be useful
  values?: {
    name?: string;
    username?: string;
  };
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response | ProfileActionData> {
  const user = await getUser(request);
  if (!user) {
    return redirect('/auth/login');
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  if (intent === 'deleteAccount') {
    try {
      await deleteUserById(user.id);
      return redirect('/auth/signup');
    } catch (error) {
      console.error('Failed to delete account:', error);
      return {
        field: 'account',
        errors: { form: 'Failed to delete account. Please try again.' },
      };
    }
  }

  if (intent === 'updateName') {
    const name = formData.get('nameValue') as string | null;
    if (!name || name.trim() === '') {
      return {
        field: 'name',
        errors: { name: 'Name cannot be empty.' },
        values: { name: name || undefined },
      };
    }
    try {
      await updateUserById(user.id, { name: name.trim() });
      return {
        success: true,
        field: 'name',
        message: 'Name updated successfully.',
      };
    } catch (error) {
      console.error('Failed to update name:', error);
      return {
        field: 'name',
        errors: { name: 'Failed to update name.' },
        values: { name },
      };
    }
  }

  if (intent === 'updateUsername') {
    const username = formData.get('usernameValue') as string | null;
    if (!username || username.trim() === '') {
      return {
        field: 'username',
        errors: { username: 'Username cannot be empty.' },
        values: { username: username || undefined },
      };
    }
    // Add more username validation (e.g., uniqueness, format)
    try {
      await updateUserById(user.id, { username: username.trim() });
      return {
        success: true,
        field: 'username',
        message: 'Username updated successfully.',
      };
    } catch (error: any) {
      console.error('Failed to update username:', error);
      if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
        return {
          field: 'username',
          errors: { username: 'This username is already taken.' },
          values: { username },
        };
      }
      return {
        field: 'username',
        errors: { username: 'Failed to update username.' },
        values: { username },
      };
    }
  }

  return new Response('Invalid intent', { status: 400 });
}

export default function Profile() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>(); // Use specific type

  return (
    <AppLayout content={<ProfilePanelContent />} user={user}>
      {/* General form error for delete, specific field errors handled in ProfileIndex */}
      {actionData?.field === 'account' && actionData?.errors?.form && (
        <div
          className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
          role="alert"
        >
          {actionData.errors.form}
        </div>
      )}
      <Outlet context={{ user }} /> {/* Pass user to child routes */}
    </AppLayout>
  );
}
