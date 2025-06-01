import {
  Outlet,
  useLoaderData,
  redirect,
  useActionData,
  useNavigation,
} from 'react-router';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
// ... other imports from your original file
import { AlertCircle } from 'lucide-react'; // Import AlertCircle
import AppLayout from '#/components/layout/sidebar/appLayout';
import ProfilePanelContent from '#/components/sidebar/panels/profilePanelContent';
import type { User as PrismaUser } from '@prisma/client';
import { getUser } from '#/utils/auth.server';

import { updateUserById } from '#/utils/user.server';
import { deleteUserById } from '#/utils/user.server';

// ... (ProfileLoaderData, loader, ProfileActionData, action function remain the same) ...
// Ensure ProfileActionData and your action function are correctly defined as in your original code.

export interface ProfileLoaderData {
  user: PrismaUser;
  // formattedDate: string; // This was in your original, ensure it's used or remove if not
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (!user) {
    return redirect('/auth/signup');
  }
  return { user } as ProfileLoaderData;
}

export interface ProfileActionData {
  success?: boolean;
  field?: 'name' | 'username' | 'account';
  message?: string;
  errors?: {
    name?: string;
    username?: string;
    form?: string;
  };
  values?: {
    name?: string;
    username?: string;
  };
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response | ProfileActionData> {
  // ... (Your existing action logic)
  // Ensure this is identical to your working action logic
  const user = await getUser(request);
  if (!user) {
    return redirect('/auth/login');
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  if (intent === 'deleteAccount') {
    try {
      await deleteUserById(user.id);
      // Consider redirecting to a page that confirms account deletion or homepage
      return redirect('/auth/signup');
    } catch (error) {
      console.error('Failed to delete account:', error);
      return {
        field: 'account',
        errors: { form: 'Failed to delete account. Please try again later.' },
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
    if (name.trim().length > 50) {
      // Example validation
      return {
        field: 'name',
        errors: { name: 'Name cannot exceed 50 characters.' },
        values: { name },
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
        errors: { name: 'Could not update name. Please try again.' },
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
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username.trim())) {
      // Example validation
      return {
        field: 'username',
        errors: {
          username:
            'Username must be 3-20 characters, letters, numbers, or underscores.',
        },
        values: { username },
      };
    }
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
        errors: { username: 'Could not update username. Please try again.' },
        values: { username },
      };
    }
  }

  return new Response('Invalid operation intent.', { status: 400 });
}

export default function Profile() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  return (
    <AppLayout content={<ProfilePanelContent />} user={user}>
      {/* Global error toast for account deletion issues from action */}
      {actionData?.field === 'account' &&
        actionData?.errors?.form &&
        navigation.state === 'idle' && (
          <div
            className="fixed top-5 right-5 z-[100] p-3.5 mb-4 text-sm bg-red-500/10 dark:bg-red-600/20 text-red-700 dark:text-red-300 rounded-lg shadow-xl flex items-center space-x-2 animate-fadeIn select-none"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{actionData.errors.form}</span>
          </div>
        )}
      <Outlet context={{ user }} />
    </AppLayout>
  );
}
