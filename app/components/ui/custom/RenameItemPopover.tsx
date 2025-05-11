// #/components/popovers/RenameItemPopover.tsx
import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { Label } from '#/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover';
import { Form, useNavigation } from 'react-router';

interface RenameItemPopoverProps {
  itemId: string;
  currentName: string;
  itemType: 'project' | 'chat' | 'note'; // To construct action or provide context
  triggerElement: React.ReactNode; // The element that opens the popover (e.g., a DropdownMenuItem)
  onOpenChange?: (open: boolean) => void; // Callback for when popover open state changes
  popoverSide?: 'top' | 'bottom' | 'left' | 'right';
  popoverAlign?: 'start' | 'center' | 'end';
}

export function RenameItemPopover({
  itemId,
  currentName,
  itemType,
  triggerElement,
  onOpenChange,
  popoverSide = 'right',
  popoverAlign = 'start',
}: RenameItemPopoverProps) {
  const [name, setName] = useState(currentName);
  const [isOpen, setIsOpen] = useState(false);
  const navigation = useNavigation();
  const inputRef = useRef<HTMLInputElement>(null);

  const actionIntent = `rename${
    itemType.charAt(0).toUpperCase() + itemType.slice(1)
  }`;
  const isSubmitting =
    navigation.state === 'submitting' &&
    navigation.formData?.get('_action') === actionIntent &&
    navigation.formData?.get('itemId') === itemId;

  // Effect to update local name if currentName prop changes AND popover is closed
  useEffect(() => {
    if (!isOpen) {
      setName(currentName);
    }
  }, [currentName, isOpen]);

  // Effect to handle popover opening: reset name to currentName and focus input
  useEffect(() => {
    if (isOpen) {
      setName(currentName); // Reset to current name when opening
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen, currentName]); // Add currentName dependency

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
    if (!open) {
      setName(currentName); // Reset name if popover is closed without submitting
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (name.trim() === '' || name === currentName) {
      event.preventDefault(); // Prevent submission
      setIsOpen(false); // Close popover
      return;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{triggerElement}</PopoverTrigger>
      <PopoverContent
        side={popoverSide}
        align={popoverAlign}
        className="w-auto p-4 sm:min-w-[250px]" // Adjust width
        onOpenAutoFocus={(e) => e.preventDefault()} // Prevent Radix focusing PopoverContent itself
      >
        <Form method="POST" onSubmit={handleSubmit} className="space-y-3">
          <input type="hidden" name="_action" value={actionIntent} />
          <input type="hidden" name="itemType" value={itemType} />
          <input type="hidden" name="itemId" value={itemId} />
          <input type="hidden" name="newName" value={name} />
          <Label
            htmlFor={`rename-${itemType}-${itemId}`}
            className="text-sm font-medium"
          >
            Rename {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
          </Label>
          <Input
            ref={inputRef}
            id={`rename-${itemType}-${itemId}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Enter new ${itemType} name`}
            className="text-sm"
          />
          <div className="flex justify-end space-x-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)} // Or use PopoverClose
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={
                isSubmitting || name.trim() === '' || name === currentName
              }
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </Form>
      </PopoverContent>
    </Popover>
  );
}
