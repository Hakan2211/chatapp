import { prisma } from './db.server';
import type { User } from '@prisma/client';

export async function updateUserById(
  userId: string,
  data: Partial<Pick<User, 'name' | 'username' | 'email' | 'password'>>
) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

export async function deleteUserById(userId: string) {
  return prisma.user.delete({
    where: { id: userId },
  });
}

export async function updateUserProfileImage(
  userId: string,
  imageData: {
    blob: Buffer;
    contentType: string;
    altText?: string;
  }
) {
  const imageUrl = `/images/user/${userId}`; // Path to our new resource route

  return prisma.userImage.upsert({
    where: { userId },
    create: {
      userId,
      blob: imageData.blob,
      contentType: imageData.contentType,
      altText: imageData.altText || `Profile picture for user ${userId}`,
      url: imageUrl, // Use the internal URL for serving
    },
    update: {
      blob: imageData.blob,
      contentType: imageData.contentType,
      altText: imageData.altText || `Profile picture for user ${userId}`,
      url: imageUrl, // Ensure URL is updated if it was previously a Google URL
    },
    select: { url: true }, // Return the new URL
  });
}

export async function deleteUserProfileImage(userId: string) {
  // Optional: If you want to allow users to REMOVE their custom image
  // and potentially revert to a Gravatar or default.
  // For now, we'll just update/replace. If an image is deleted,
  // the Google OAuth logic might repopulate it if they sign in with Google again.
  // Or, you might set the URL to null or a default placeholder.
  try {
    await prisma.userImage.delete({ where: { userId } });
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2025') {
      // Record to delete not found
      return { success: true, message: 'No custom image to delete.' };
    }
    console.error('Error deleting user image:', error);
    return { success: false, error: 'Failed to delete image.' };
  }
}
