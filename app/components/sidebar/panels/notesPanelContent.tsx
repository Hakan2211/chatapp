import { Button } from '#/components/ui/button';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from '#/components/ui/sidebar';
import { useState } from 'react';
import { FileText, Clock, PlusCircle } from 'lucide-react';
import type { Note } from '#/types/appTypes';

interface NotesPanelContentProps {
  notes: Note[];
}

export function NotesPanelContent({ notes }: NotesPanelContentProps) {
  notes = [];
  const [filter, setFilter] = useState<'all' | 'solo' | 'group'>('all');
  const filteredNotes = notes.filter(
    (n) => filter === 'all' || n.type === filter
  );

  return (
    <>
      <SidebarGroup className="p-4 border-b border-[var(--sidebar-border-color)]">
        <div className="flex items-center gap-1">
          <Button
            variant={filter === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
            className="text-xs h-7 px-2" // Adjust size
          >
            All
          </Button>
          <Button
            variant={filter === 'solo' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('solo')}
            className="text-xs h-7 px-2"
          >
            Solo
          </Button>
          <Button
            variant={filter === 'group' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('group')}
            className="text-xs h-7 px-2"
          >
            Group
          </Button>
        </div>
      </SidebarGroup>

      <SidebarGroup className="flex-1 overflow-y-auto py-2">
        <SidebarGroupContent>
          {filteredNotes.length > 0 ? (
            <SidebarMenu>
              {filteredNotes.map((note) => (
                <SidebarMenuItem
                  key={note.id}
                  className="block p-0" // Remove padding from item
                >
                  {/* Use button for better semantics and hover */}
                  <SidebarMenuButton className="h-auto flex-col items-start whitespace-normal py-2.5 px-4 hover:bg-black/[.03] dark:hover:bg-white/[.03] rounded-none w-full text-left">
                    <div className="flex items-center justify-between w-full mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {note.title}
                      </h4>
                      <SidebarMenuBadge>{note.type}</SidebarMenuBadge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 line-clamp-2 w-full">
                      {/* change to snippet or description - I need to add a snippet/description to the note model */}
                      {note.content}
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 w-full">
                      <Clock className="h-3 w-3" />
                      {note.createdAt.toLocaleString()}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          ) : (
            <div className="py-12 text-center flex flex-col items-center gap-3 px-4">
              <div className="h-10 w-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <FileText className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">No notes found</p>
                <p className="text-xs text-black/50 dark:text-white/50">
                  Try adjusting your filters.
                </p>
              </div>
            </div>
          )}
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="mt-auto p-4 border-t border-[var(--sidebar-border-color)]">
        <Button className="w-full rounded-md h-9 text-sm font-medium">
          <PlusCircle className="h-4 w-4 mr-2" /> New Note
        </Button>
      </SidebarGroup>
    </>
  );
}
