// app/components/chat/typing-indicator.tsx
import { cn } from '#/lib/utils';

export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1.5 py-2 px-1">
      {' '}
      {/* Added some padding */}
      <div
        className={cn(
          'h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse [animation-delay:0s]'
        )}
      />
      <div
        className={cn(
          'h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse [animation-delay:0.2s]'
        )}
      />
      <div
        className={cn(
          'h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse [animation-delay:0.4s]'
        )}
      />
    </div>
  );
}
