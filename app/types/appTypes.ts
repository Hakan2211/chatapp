import type {
  Project as PrismaProject,
  Note as PrismaNote,
  User as PrismaUser,
} from '@prisma/client';

// Re-export or extend Prisma types if needed
export type Project = PrismaProject;
export type Note = PrismaNote;
export type User = PrismaUser; // Or a subset for client-side use

// Type for data needed by Home Panel (if different from raw Project)
export interface HomeProjectItem {
  id: string;
  name: string;
  badge?: string; // Or derive from project status
  lastActive: string; // Formatted date/time
  starred: boolean;
}
