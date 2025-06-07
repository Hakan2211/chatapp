// app/routes/resources/user-image.tsx
import type { LoaderFunctionArgs } from 'react-router';
import { prisma } from '#/utils/db.server';

export async function loader({
  params,
  request,
}: LoaderFunctionArgs): Promise<Response> {
  console.log('=== USER IMAGE LOADER DEBUG ===');
  console.log('1. Route called with params:', JSON.stringify(params));
  console.log('2. Request URL:', request.url);
  console.log('3. Request method:', request.method);

  const userId = params.userId;
  console.log('4. Extracted userId:', userId);

  if (!userId) {
    console.log('5. ERROR: No userId provided');
    return new Response('User ID is required', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  try {
    console.log('6. Querying database for userId:', userId);

    // First, let's check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    console.log('7. User found:', user ? 'YES' : 'NO', user);

    if (!user) {
      console.log('8. ERROR: User not found');
      return new Response('User not found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Now check for user image
    const userImage = await prisma.userImage.findUnique({
      where: { userId },
      select: {
        id: true,
        blob: true,
        contentType: true,
        altText: true,
        updatedAt: true,
        url: true,
      },
    });

    console.log('9. UserImage found:', userImage ? 'YES' : 'NO');
    if (userImage) {
      console.log('10. UserImage details:', {
        id: userImage.id,
        contentType: userImage.contentType,
        blobSize: userImage.blob?.length || 0,
        altText: userImage.altText,
        url: userImage.url,
        updatedAt: userImage.updatedAt,
      });
    }

    if (!userImage || !userImage.blob) {
      console.log('11. ERROR: Image not found or no blob data');
      return new Response('Image not found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    console.log('12. Preparing image response...');
    console.log(
      '13. Content-Type will be:',
      userImage.contentType || 'application/octet-stream'
    );
    console.log('14. Blob size:', userImage.blob.length, 'bytes');

    // Create proper headers for image response
    const headers = new Headers();
    headers.set(
      'Content-Type',
      userImage.contentType || 'application/octet-stream'
    );
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('ETag', `"${userImage.updatedAt.getTime()}"`);
    headers.set('X-Debug-Image-Id', userImage.id);
    headers.set('X-Debug-Blob-Size', userImage.blob.length.toString());

    console.log(
      '15. Response headers set:',
      Object.fromEntries(headers.entries())
    );

    // Handle conditional requests (304 Not Modified)
    const ifNoneMatch = request.headers.get('If-None-Match');
    if (ifNoneMatch === `"${userImage.updatedAt.getTime()}"`) {
      console.log('16. Returning 304 Not Modified');
      return new Response(null, {
        status: 304,
        headers,
      });
    }

    console.log('17. Returning image data...');
    // Return the actual image data
    const response = new Response(userImage.blob, {
      status: 200,
      headers,
    });

    console.log('18. Response created successfully');
    console.log('=== END USER IMAGE LOADER DEBUG ===');

    return response;
  } catch (error) {
    console.error('ERROR in user-image loader:', error);
    console.log('=== END USER IMAGE LOADER DEBUG (ERROR) ===');
    return new Response('Internal server error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

export default function UserImageResource() {
  return null;
}
