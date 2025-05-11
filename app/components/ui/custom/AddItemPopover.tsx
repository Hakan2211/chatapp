// #/components/popovers/AddItemPopover.tsx
import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { Label } from '#/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover';
import { Form, useNavigation, useSubmit } from 'react-router';

interface AddItemPopoverProps {
  parentId?: string | null; // For sub-projects, null/undefined for root projects
  itemType: 'project'; // Could be extended for 'chat', 'note' if they can be created this way
  triggerElement: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  popoverSide?: 'top' | 'bottom' | 'left' | 'right';
  popoverAlign?: 'start' | 'center' | 'end';
  placeholderText?: string;
  titleText?: string;
}

export function AddItemPopover({
  parentId,
  itemType,
  triggerElement,
  onOpenChange,
  popoverSide = 'right',
  popoverAlign = 'start',
  placeholderText = `Enter ${itemType} name`,
  titleText = `New ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`,
}: AddItemPopoverProps) {
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigation = useNavigation();
  const inputRef = useRef<HTMLInputElement>(null);

  const isSubmitting =
    navigation.state === 'submitting' &&
    navigation.formData?.get('_action') ===
      `create${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
      setName(''); // Clear name when opening
    }
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
    if (!open && !isSubmitting) {
      // Don't clear name if closing due to submission
      setName('');
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (name.trim() === '') {
      event.preventDefault(); // Prevent submission if name is empty
      // Optionally, provide feedback to the user here
      return;
    }
    // Allow submission. Remix will handle UI updates and popover state
    // if it's part of a component that re-renders.
    // Optimistic closing:
    // setIsOpen(false);
    // However, if the form submission results in the DropdownMenu closing (if it's inside one),
    // this might already be handled.
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{triggerElement}</PopoverTrigger>
      <PopoverContent
        side={popoverSide}
        align={popoverAlign}
        className="w-auto p-4 sm:min-w-[250px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Form method="POST" onSubmit={handleSubmit} className="space-y-3">
          <input
            type="hidden"
            name="_action"
            value={`create${
              itemType.charAt(0).toUpperCase() + itemType.slice(1)
            }`}
          />
          <input type="hidden" name="itemType" value={itemType} />
          {parentId && <input type="hidden" name="parentId" value={parentId} />}
          <Label
            htmlFor={`add-${itemType}-${parentId || 'root'}`}
            className="text-sm font-medium"
          >
            {titleText}
          </Label>
          <Input
            ref={inputRef}
            id={`add-${itemType}-${parentId || 'root'}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={placeholderText}
            className="text-sm"
            name="name"
          />
          <div className="flex justify-end space-x-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || name.trim() === ''}
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </Form>
      </PopoverContent>
    </Popover>
  );
}
