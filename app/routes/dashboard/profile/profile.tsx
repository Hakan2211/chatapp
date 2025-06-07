import {
  Outlet,
  useLoaderData,
  redirect,
  useActionData,
  useNavigation,
} from 'react-router';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';

import { getUser } from '#/utils/auth.server';
import { deleteUserById, updateUserById } from '#/utils/user.server';
import { updateUserProfileImage } from '#/utils/user.server'; // Import the new function
import AppLayout from '#/components/layout/sidebar/appLayout';
import ProfilePanelContent from '#/components/sidebar/panels/profilePanelContent';
import type { User as PrismaUser } from '@prisma/client';
import { AlertCircle } from 'lucide-react';

export type User = Omit<PrismaUser, 'password'> & {
  image?: {
    url: string;
  } | null;
};
// ... (ProfileLoaderData interface and loader function remain the same) ...
export interface ProfileLoaderData {
  user: User;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (!user) {
    return redirect('/auth/signup');
  }
  // Explicitly cast to ensure the nested image structure is understood by TypeScript
  return { user: user as ProfileLoaderData['user'] };
}

// Update ProfileActionData
export interface ProfileActionData {
  success?: boolean;
  field?: 'name' | 'username' | 'account' | 'profileImage'; // Added profileImage
  message?: string;
  errors?: {
    name?: string;
    username?: string;
    form?: string; // For delete account errors
    profileImage?: string; // For image upload errors
  };
  values?: {
    name?: string;
    username?: string;
  };
  updatedImageUrl?: string | null; // To pass back new image URL
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response | ProfileActionData> {
  const user = await getUser(request);
  if (!user) {
    return redirect('/auth/login');
  }

  // For Remix 2.8+ formData handles multipart directly
  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  // For older Remix versions:
  // const uploadHandler = unstable_createMemoryUploadHandler({
  //   maxPartSize: MAX_IMAGE_SIZE,
  // });
  // const formData = await unstable_parseMultipartFormData(request, uploadHandler);
  // const intent = formData.get('intent') as string;

  if (intent === 'updateProfileImage') {
    const imageFile = formData.get('profileImage') as File | null; // For Remix 2.8+ File type
    // const imageFile = formData.get('profileImage') as NodeOnDiskFile | null; // For older Remix with unstable_NodeOnDiskFile

    if (!imageFile || imageFile.size === 0) {
      return {
        field: 'profileImage',
        errors: { profileImage: 'Please select an image file.' },
      };
    }

    if (imageFile.size > MAX_IMAGE_SIZE) {
      return {
        field: 'profileImage',
        errors: {
          profileImage: `Image size cannot exceed ${
            MAX_IMAGE_SIZE / 1024 / 1024
          }MB.`,
        },
      };
    }

    if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
      return {
        field: 'profileImage',
        errors: {
          profileImage:
            'Invalid image format. Only JPG, PNG, GIF, WEBP are allowed.',
        },
      };
    }

    try {
      const imageBuffer = await imageFile.arrayBuffer();
      const updatedImage = await updateUserProfileImage(user.id, {
        blob: Buffer.from(imageBuffer),
        contentType: imageFile.type,
        altText: `${user.name || user.username || 'User'}'s profile picture`,
      });

      const result: ProfileActionData = {
        success: true,
        field: 'profileImage',
        message: 'Profile image updated successfully.',
        updatedImageUrl: updatedImage.url,
      };
      console.log('PROFILE ACTION - updateProfileImage success:', result);
      return result;
    } catch (error) {
      console.error('Failed to update profile image:', error);
      return {
        field: 'profileImage',
        errors: {
          profileImage: 'Failed to update profile image. Please try again.',
        },
      };
    }
  }

  // ... (your existing intents: deleteAccount, updateName, updateUsername)
  if (intent === 'deleteAccount') {
    // ... your delete account logic
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
    if (name.trim().length > 50) {
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
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username.trim())) {
      return {
        field: 'username',
        errors: {
          username:
            'Username must be 3-20 characters (letters, numbers, or underscores).',
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
        errors: { username: 'Failed to update username.' },
        values: { username },
      };
    }
  }

  return new Response('Invalid intent', { status: 400 });
}

// Profile component using useNavigation
export default function Profile() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation(); // Get navigation state

  // Check if the account deletion was specifically what was submitted
  const isDeletingAccount =
    navigation.state === 'submitting' &&
    navigation.formData?.get('intent') === 'deleteAccount';

  return (
    <AppLayout content={<ProfilePanelContent />} user={user}>
      {/* Global error toast for account deletion issues, only if not actively submitting for it */}
      {actionData?.field === 'account' &&
        actionData?.errors?.form &&
        navigation.state === 'idle' && // Show only when idle
        !isDeletingAccount && ( // And not if we just tried to delete
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
