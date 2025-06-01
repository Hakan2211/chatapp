import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar';
import { Button } from '#/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu';
import { Form, Link } from 'react-router';
import type { User } from '#/types/appTypes';

import LogoutCircleIcon from '#/components/icons/logoutCircle';
import UserLineIcon from '#/components/icons/userLineIcon';
import PulseLineIcon from '#/components/icons/pulseLineIcon';
import FindReplaceIcon from '#/components/icons/findReplaceIcon';
import TimerLineIcon from '#/components/icons/timerLineIcon';

interface UserDropdownProps {
  user: User;
}

export default function UserDropdown({ user }: UserDropdownProps) {
  // Get initials for avatar fallback
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
          <Avatar className="size-8 aspect-square rounded-lg cursor-pointer">
            <AvatarImage
              src={user.image?.url}
              width={32}
              height={32}
              alt={`${user.name || user.username}'s profile image`}
            />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-64 p-2" align="end">
        <DropdownMenuLabel className="flex min-w-0 flex-col py-0 px-1 mb-2">
          <span className="truncate text-sm font-medium text-foreground mb-0.5">
            {user.name || user.username}
          </span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuItem className="gap-3 px-1">
          <TimerLineIcon
            className="text-muted-foreground/70"
            aria-hidden="true"
          />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-3 px-1">
          <UserLineIcon
            className="text-muted-foreground/70"
            aria-hidden="true"
          />
          <Link to="/profile">
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-3 px-1">
          <PulseLineIcon
            className="text-muted-foreground/70"
            aria-hidden="true"
          />
          <span>Changelog</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-3 px-1">
          <FindReplaceIcon
            className="text-muted-foreground/70"
            aria-hidden="true"
          />
          <span>History</span>
        </DropdownMenuItem>
        <Form method="post" action="/auth/logout">
          <DropdownMenuItem asChild className="gap-3 px-1">
            <button type="submit" className="w-full flex items-center">
              <LogoutCircleIcon
                className="text-muted-foreground/70"
                aria-hidden="true"
              />
              <span>Log out</span>
            </button>
          </DropdownMenuItem>
        </Form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
