import { LogOut, CreditCard, Settings, User } from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '#/components/ui/sidebar';

export function AccountPanelContent() {
  return (
    <>
      <SidebarGroup className="flex-1 py-2">
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => console.log('Go to Profile')}>
                <User className="h-4 w-4 mr-2" /> Profile
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => console.log('Go to Settings')}>
                <Settings className="h-4 w-4 mr-2" /> Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => console.log('Go to Billing')}>
                <CreditCard className="h-4 w-4 mr-2" /> Billing
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="mt-auto p-4 border-t border-[var(--sidebar-border-color)]">
        {/* Use SidebarMenu for consistency even with one item */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300 font-medium"
              onClick={() => console.log('Logout')}
            >
              <LogOut className="h-4 w-4 mr-2" /> Log out
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
