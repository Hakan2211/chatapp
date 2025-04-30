import { cn } from '#/lib/utils';

export default function ProjectNotes() {
  return (
    <div className={cn('text-sm text-gray-600 dark:text-gray-400 space-y-3')}>
      <h3 className="text-lg font-semibold">Notes</h3>
      <p>This is the Notes content area.</p>
      <p>Manage project notes or annotations here.</p>
    </div>
  );
}
