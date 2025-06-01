import type {
  Project as PrismaProject,
  Note as PrismaNote,
  User as PrismaUser,
  UserImage as PrismaUserImage,
} from '@prisma/client';

// Re-export or extend Prisma types if needed
export type Project = PrismaProject;
export type Note = PrismaNote;

// Define a subset of User type for client-side use (without password)
export type User = Omit<PrismaUser, 'password'> & {
  image?: {
    url: string;
  } | null;
};

// Type for data needed by Home Panel (if different from raw Project)
export interface HomeProjectItem {
  id: string;
  name: string;
  badge?: string; // Or derive from project status
  lastActive: string; // Formatted date/time
  starred: boolean;
}
