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
