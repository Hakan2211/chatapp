import { redirect } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { PrismaClient } from '@prisma/client';
import { OAuth2Client, type TokenPayload } from 'google-auth-library';
import { getSession, commitSession } from '#/utils/session.server';

const prisma = new PrismaClient();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = `${process.env.BASE_URL}/auth/google/callback`;

const googleAuthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyGoogleIdToken(
  idToken: string
): Promise<TokenPayload | null> {
  try {
    const ticket = await googleAuthClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload() || null;
  } catch (error) {
    console.error('Error verifying Google ID token:', error);
    return null;
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  if (
    !GOOGLE_CLIENT_ID ||
    !GOOGLE_CLIENT_SECRET ||
    !GOOGLE_REDIRECT_URI ||
    !process.env.BASE_URL
  ) {
    console.error(
      'Google OAuth callback environment variables are not properly set.'
    );
    return redirect('/auth/login?error=google_config_error_callback');
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  // Handle Google OAuth errors
  if (error) {
    console.error('Google OAuth error:', error, errorDescription);
    switch (error) {
      case 'access_denied':
        return redirect('/auth/login?error=google_access_denied');
      case 'invalid_scope':
        return redirect('/auth/login?error=google_invalid_scope');
      case 'invalid_request':
        return redirect('/auth/login?error=google_invalid_request');
      case 'server_error':
        return redirect('/auth/login?error=google_server_error');
      case 'temporarily_unavailable':
        return redirect('/auth/login?error=google_temporarily_unavailable');
      default:
        return redirect('/auth/login?error=google_oauth_error');
    }
  }

  const session = await getSession(request.headers.get('Cookie'));
  const savedState = session.get('oauth_state');
  const returnTo = session.get('oauth_return_to') || '/dashboard';

  // Verify CSRF state
  if (!state || !savedState || state !== savedState) {
    session.unset('oauth_state');
    session.unset('oauth_return_to');
    return redirect('/auth/login?error=invalid_oauth_state', {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  }

  // Clean up OAuth state
  session.unset('oauth_state');
  session.unset('oauth_return_to');

  if (!code) {
    return redirect('/auth/login?error=google_auth_failed_no_code');
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.json();
      console.error('Google token exchange failed:', errorBody);

      // Handle specific token exchange errors
      switch (errorBody.error) {
        case 'invalid_grant':
          return redirect('/auth/login?error=google_invalid_grant');
        case 'invalid_client':
          return redirect('/auth/login?error=google_invalid_client');
        case 'invalid_request':
          return redirect('/auth/login?error=google_invalid_token_request');
        case 'unauthorized_client':
          return redirect('/auth/login?error=google_unauthorized_client');
        case 'unsupported_grant_type':
          return redirect('/auth/login?error=google_unsupported_grant_type');
        default:
          return redirect('/auth/login?error=google_token_exchange_failed');
      }
    }

    const tokens = await tokenResponse.json();
    const idToken = tokens.id_token;

    if (!idToken) {
      return redirect('/auth/login?error=google_no_id_token');
    }

    // 2. Verify ID Token and get user profile
    const idTokenPayload = await verifyGoogleIdToken(idToken);
    if (!idTokenPayload) {
      return redirect('/auth/login?error=invalid_google_id_token');
    }

    const {
      sub: googleId,
      email,
      email_verified,
      name,
      picture,
    } = idTokenPayload;

    if (!email) {
      return redirect('/auth/login?error=google_no_email');
    }

    if (!email_verified) {
      return redirect('/auth/login?error=google_email_not_verified');
    }

    // 3. Find or Create User in your database
    try {
      let user = await prisma.user.findUnique({
        where: { googleId },
        include: { image: true },
      });

      if (!user) {
        // User not found by googleId, try by email to link accounts
        const existingUserByEmail = await prisma.user.findUnique({
          where: { email },
          include: { image: true },
        });

        if (existingUserByEmail) {
          // User exists with this email, link Google account
          user = await prisma.user.update({
            where: { id: existingUserByEmail.id },
            data: {
              googleId,
              name: existingUserByEmail.name || name,
              ...(picture &&
                (!existingUserByEmail.image ||
                  existingUserByEmail.image.url !== picture) && {
                  image: {
                    upsert: {
                      where: { userId: existingUserByEmail.id },
                      create: {
                        url: picture,
                        altText: `${name || 'User'}'s profile picture`,
                        blob: Buffer.from(''),
                      },
                      update: {
                        url: picture,
                        altText: `${name || 'User'}'s profile picture`,
                      },
                    },
                  },
                }),
            },
            include: { image: true },
          });
        } else {
          // New user: Create one
          const baseUsername = email.split('@')[0];
          let username = baseUsername;
          let counter = 1;

          // Keep trying until we find a unique username
          while (await prisma.user.findUnique({ where: { username } })) {
            username = `${baseUsername}${counter}`;
            counter++;
          }

          user = await prisma.user.create({
            data: {
              email,
              googleId,
              name: name || email.split('@')[0],
              username,
              ...(picture && {
                image: {
                  create: {
                    url: picture,
                    altText: `${name || 'User'}'s profile picture`,
                    blob: Buffer.from(''),
                  },
                },
              }),
            },
            include: { image: true },
          });
        }
      }

      if (!user) {
        return redirect('/auth/login?error=user_creation_failed');
      }

      // 4. Create a session for the user
      session.set('userId', user.id);

      return redirect(returnTo, {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      });
    } catch (dbError) {
      console.error('Database error during Google OAuth:', dbError);
      return redirect('/auth/login?error=database_error');
    }
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return redirect('/auth/login?error=google_oauth_general_error');
  }
}

export default function GoogleCallback() {
  return null;
}
