import { createCookieSessionStorage } from 'react-router';

type SessionData = {
  userId: string;
  oauth_state?: string;
  oauth_return_to?: string;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: '__session',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax',
      secrets: [process.env.SESSION_SECRET || 'default-secret'],
      secure: process.env.NODE_ENV === 'production',
    },
  });

export { getSession, commitSession, destroySession };
