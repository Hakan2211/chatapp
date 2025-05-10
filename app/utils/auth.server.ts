import { redirect } from 'react-router';
import type { User } from '#/types/appTypes';

// --- Need to IMPLEMENT THESE BASED ON MY AUTH SOLUTION KCD COURSE EPIC WEB DEV---

/**
 * Returns the userId from the request session or throws a redirect
 * to the login page if the user is not authenticated.
 */
export async function requireUserId(request: Request): Promise<string> {
  console.warn('🚧 requireUserId: Implement actual authentication check!');
  // Example: Get session, check for userId, redirect if missing
  const fakeUserId = 'cma9bzpxj0002uc8kvztzin2r'; // <<< --- REMOVE THIS HARDCODING
  if (!fakeUserId) {
    throw redirect('/login'); // Adjust login path
  }
  return fakeUserId;
}

/**
 * Returns the user object from the request session or null if not logged in.
 */
export async function getUser(request: Request): Promise<User | null> {
  console.warn('🚧 getUser: Implement actual authentication check!');
  // Example: Get session, get userId, fetch user from DB
  const fakeUserId = 'cma9bzpxj0002uc8kvztzin2r'; // <<< --- REMOVE THIS HARDCODING
  if (!fakeUserId) {
    return null;
  }
  // In a real app, fetch from DB based on session userId
  // const user = await prisma.user.findUnique({ where: { id: userId }});
  // return user;
  return {
    // Fake user data for now
    id: fakeUserId,
    email: 'test@example.com',
    username: 'testuser',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User; // Cast necessary properties
}
