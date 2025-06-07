import { type ActionFunctionArgs } from 'react-router';
import { streamText, type CoreMessage, type UserContent } from 'ai';
import { defaultChatModel } from '#/utils/ai.server';
import { prisma } from '#/utils/db.server';
import { requireUserId } from '#/utils/auth.server';

function userContentToString(content: UserContent): string {
  if (typeof content === 'string') return content;
  return content
    .map((part) => {
      if (part.type === 'text') return part.text;
      if (part.type === 'image') return '[Image]';
      if (part.type === 'file') return `[File: ${part.filename}]`;
      return '';
    })
    .join(' ');
}

export async function action({ request }: ActionFunctionArgs) {
  console.log('Chat stream action called');

  try {
    const userId = await requireUserId(request);
    console.log('User ID:', userId);

    const body = await request.json();
    console.log('Request body:', body);

    const { messages: allMessages, chatId: receivedChatId } = body;

    if (!receivedChatId) {
      console.error('No chatId provided');
      return new Response(JSON.stringify({ error: 'chatId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Looking for chat:', receivedChatId);
    const chat = await prisma.chat.findUnique({
      where: { id: receivedChatId, userId },
    });

    if (!chat) {
      console.error('Chat not found:', receivedChatId);
      return new Response(
        JSON.stringify({ error: 'Chat not found or access denied' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Chat found:', chat.name);

    const coreMessages: CoreMessage[] = (allMessages as any[]).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    console.log('Core messages:', coreMessages.length);

    // Save latest user message
    const latestMessage = coreMessages[coreMessages.length - 1];
    if (latestMessage && latestMessage.role === 'user') {
      try {
        const existingUserMessage = await prisma.chatMessage.findFirst({
          where: {
            chatId: receivedChatId,
            senderId: userId,
            role: 'user',
            content: userContentToString(latestMessage.content),
            timestamp: { gte: new Date(Date.now() - 5000) },
          },
        });

        if (!existingUserMessage) {
          const savedUserMessage = await prisma.chatMessage.create({
            data: {
              chatId: receivedChatId,
              senderId: userId,
              role: 'user',
              content: userContentToString(latestMessage.content),
            },
          });
          console.log('User message saved:', savedUserMessage.id);
        } else {
          console.log('User message already exists, skipping save');
        }
      } catch (dbError) {
        console.error('Error saving user message:', dbError);
      }
    }

    console.log('Starting AI stream...');

    // Create the stream
    const result = await streamText({
      model: defaultChatModel,
      messages: coreMessages,
      async onFinish({ text, finishReason }) {
        console.log('Stream finished:', {
          textLength: text.length,
          finishReason,
        });
        try {
          const savedAssistantMessage = await prisma.chatMessage.create({
            data: {
              chatId: receivedChatId,
              role: 'assistant',
              content: text,
              model: defaultChatModel.modelId,
            },
          });
          console.log(
            'Assistant message saved to DB:',
            savedAssistantMessage.id
          );
        } catch (dbError) {
          console.error('Error saving assistant message to DB:', dbError);
        }
      },
      async onError(error) {
        console.error('AI stream error:', error);
      },
    });

    console.log('Returning stream response');
    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('Error in chat stream action:', error);

    if (error.name === 'AbortError') {
      return new Response('Stream aborted', { status: 499 });
    }

    return new Response(
      JSON.stringify({
        error: 'Failed to stream AI response',
        details: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
