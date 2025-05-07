import React, { type JSX } from 'react';
import { AppSidebar } from './appSidebar';
import { SidebarInset, SidebarTrigger } from '#/components/ui/sidebar';
import { TwoColumnProvider } from '#/context/twoColumnContext';

function SidebarLayout({
  children,
  content,
}: {
  content: JSX.Element;
  children: React.ReactNode;
}) {
  return (
    <>
      <AppSidebar content={content} />
      <SidebarInset>
        <header className="sticky top-0 flex shrink-0 bg-sidebar p-3">
          <SidebarTrigger className="-ml-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
        </header>
        <TwoColumnProvider>
          <div className="flex h-[calc(100svh-4rem)] bg-background md:rounded-lg md:group-peer-data-[state=collapsed]/sidebar-inset:rounded-s-none transition-all ease-in-out duration-300">
            {children}
          </div>
        </TwoColumnProvider>
      </SidebarInset>
    </>
  );
}

export default SidebarLayout;
