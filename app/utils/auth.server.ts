import { redirect } from 'react-router';
import type { User } from '#/types/appTypes';
import { getSession, commitSession, destroySession } from './session.server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// --- Need to IMPLEMENT THESE BASED ON MY AUTH SOLUTION KCD COURSE EPIC WEB DEV---

/**
 * Returns the userId from the request session or throws a redirect
 * to the login page if the user is not authenticated.
 */
export async function requireUserId(request: Request): Promise<string> {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');

  if (!userId) {
    throw redirect('/auth/login');
  }

  return userId;
}

/**
 * Returns the user object from the request session or null if not logged in.
 */
export async function getUser(request: Request): Promise<User | null> {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      image: {
        select: {
          url: true,
        },
      },
    },
  });

  return user;
}

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
    },
  });

  if (!user) {
    return { error: 'Invalid email or password' };
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return { error: 'Invalid email or password' };
  }

  const session = await getSession();
  session.set('userId', user.id);

  return {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
    redirect: '/dashboard',
  };
}

export async function signup({
  email,
  password,
  name,
  username,
}: {
  email: string;
  password: string;
  name: string;
  username: string;
}) {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    return { error: 'User already exists' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      name,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
    },
  });

  const session = await getSession();
  session.set('userId', user.id);

  return {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
    redirect: '/dashboard',
  };
}

export async function logout(request: Request) {
  const session = await getSession(request.headers.get('Cookie'));
  return redirect('/', {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
}
