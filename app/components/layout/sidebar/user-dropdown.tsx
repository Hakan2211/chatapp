import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar';
import { Button } from '#/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu';

import LogoutCircleIcon from '#/components/icons/logoutCircle';
import UserLineIcon from '#/components/icons/userLineIcon';
import PulseLineIcon from '#/components/icons/pulseLineIcon';
import FindReplaceIcon from '#/components/icons/findReplaceIcon';
import TimerLineIcon from '#/components/icons/timerLineIcon';

export default function UserDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
          <Avatar className="size-8 aspect-square rounded-lg cursor-pointer">
            <AvatarImage
              src="https://res.cloudinary.com/dlzlfasou/image/upload/v1741345634/user-02_mlqqqt.png"
              width={32}
              height={32}
              alt="Profile image"
            />
            <AvatarFallback>KK</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-64 p-2" align="end">
        <DropdownMenuLabel className="flex min-w-0 flex-col py-0 px-1 mb-2">
          <span className="truncate text-sm font-medium text-foreground mb-0.5">
            Mary P.
          </span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            mary@askdigital.com
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
          <span>Profile</span>
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
        <DropdownMenuItem className="gap-3 px-1">
          <LogoutCircleIcon
            className="text-muted-foreground/70"
            aria-hidden="true"
          />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
