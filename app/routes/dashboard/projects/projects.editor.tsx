import { cn } from '#/lib/utils';

export default function Editor() {
  return (
    <div className={cn('text-sm text-gray-600 dark:text-gray-400 space-y-3')}>
      <h3 className="text-lg font-semibold">Editor</h3>
      <p>This is the Editor content area.</p>
      <p>Here you can add your code editor or other functionality.</p>
    </div>
  );
}
