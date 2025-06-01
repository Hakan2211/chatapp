import { redirect } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { getSession, commitSession } from '#/utils/session.server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = `${process.env.BASE_URL}/auth/google/callback`;

export async function loader({ request }: LoaderFunctionArgs) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI || !process.env.BASE_URL) {
    console.error('Google OAuth environment variables are not properly set.');
    return redirect('/auth/login?error=google_config_error');
  }

  const session = await getSession(request.headers.get('Cookie'));

  // Generate and store CSRF token
  const state = crypto.randomUUID();
  session.set('oauth_state', state);

  // Store the URL to return to after authentication
  const url = new URL(request.url);
  const returnTo = url.searchParams.get('returnTo') || '/dashboard';
  session.set('oauth_return_to', returnTo);

  const googleOAuthURL = new URL(
    'https://accounts.google.com/o/oauth2/v2/auth'
  );
  googleOAuthURL.searchParams.set('client_id', GOOGLE_CLIENT_ID);
  googleOAuthURL.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI);
  googleOAuthURL.searchParams.set('response_type', 'code');
  googleOAuthURL.searchParams.set('scope', 'openid email profile');
  googleOAuthURL.searchParams.set('state', state); // Include state for CSRF protection
  googleOAuthURL.searchParams.set('access_type', 'offline'); // Get refresh token
  googleOAuthURL.searchParams.set('prompt', 'consent'); // Force consent screen to ensure we get refresh token

  return redirect(googleOAuthURL.toString(), {
    headers: { 'Set-Cookie': await commitSession(session) },
  });
}

export default function GoogleAuth() {
  return null;
}
