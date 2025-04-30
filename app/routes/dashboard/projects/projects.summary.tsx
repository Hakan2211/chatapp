import { cn } from '#/lib/utils';

export default function Summary() {
  return (
    <div className={cn('text-sm text-gray-600 dark:text-gray-400 space-y-3')}>
      <h3 className="text-lg font-semibold">Summary</h3>
      <p>This is the Summary content area.</p>
      <p>Display project summaries or analytics here.</p>
    </div>
  );
}
