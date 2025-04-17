// src/components/DashboardContent.tsx
import { useState } from 'react';
import { Button } from '~/components/ui/button';

import { cn } from '~/lib/utils';
import Maximize2Icon from '../icons/maximizeIcon';
import Minimize2Icon from '../icons/minimizeIcon';

export default function DashboardContent() {
  const [expandedColumn, setExpandedColumn] = useState<'left' | 'right' | null>(
    null
  );

  const toggleColumn = (column: 'left' | 'right') => {
    setExpandedColumn(expandedColumn === column ? null : column);
  };

  return (
    <div className="flex-1 p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div
        className={cn(
          'grid gap-6',
          expandedColumn ? 'grid-cols-1' : 'lg:grid-cols-2 grid-cols-1'
        )}
      >
        {/* Left Column */}
        <div
          className={cn(
            'bg-white p-6 rounded-lg shadow',
            expandedColumn === 'right' && 'hidden',
            expandedColumn === 'left' && 'col-span-1'
          )}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Private Rooms</h2>
            <Button
              variant="ghost"
              onClick={() => toggleColumn('left')}
              className="lg:block hidden"
            >
              {expandedColumn === 'left' ? (
                <Minimize2Icon className="h-5 w-5" />
              ) : (
                <Maximize2Icon className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p>Content for private rooms goes here...</p>
        </div>

        {/* Right Column */}
        <div
          className={cn(
            'bg-white p-6 rounded-lg shadow',
            expandedColumn === 'left' && 'hidden',
            expandedColumn === 'right' && 'col-span-1'
          )}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Public Rooms</h2>
            <Button
              variant="ghost"
              onClick={() => toggleColumn('right')}
              className="lg:block hidden"
            >
              {expandedColumn === 'right' ? (
                <Minimize2Icon className="h-5 w-5" />
              ) : (
                <Maximize2Icon className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p>Content for public rooms goes here...</p>
        </div>
      </div>
    </div>
  );
}
