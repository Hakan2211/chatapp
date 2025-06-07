// utils/ai.server.ts (new file)
import { createOpenAI } from '@ai-sdk/openai';

const apiKey =
  import.meta.env.VITE_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

if (!apiKey && process.env.NODE_ENV === 'production') {
  console.warn(
    'OPENAI_API_KEY is not set. AI features will not work in production.'
  );
} else if (!apiKey) {
  console.warn(
    'OPENAI_API_KEY is not set. Using a mock or expecting it to be set elsewhere for development.'
  );
}

export const openai = createOpenAI({
  apiKey: apiKey || 'sk-fake-key-for-dev-if-not-set',
  // compatibility: 'strict', // Keep if needed
});

// You can define specific models here or choose in the action
export const gpt4Turbo = openai('gpt-4-turbo');
export const defaultChatModel = gpt4Turbo;
