import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Band, BandHeading } from "@/components/layout/band";
import { CommandMenu } from "@/components/layout/command-menu";
import { SiteHeader } from "@/components/layout/site-header";
import { SyncGate } from "@/components/layout/sync-gate";
import { ThemeProvider, themeScript } from "@/components/layout/theme-provider";
import { PlayerHost } from "@/components/player/player-host";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "WarpTV",
      },
      {
        name: "description",
        content:
          "Browse and watch free live TV channels from the iptv-org catalog.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  component: AppLayout,
  notFoundComponent: () => (
    <Band tone="hero">
      <BandHeading as="h1" title="Lost Signal.">
        This page <b>doesn't exist</b>. Maybe it got cancelled after one season.
      </BandHeading>
      <Button size="xl" className="self-start" nativeButton={false} render={<Link to="/" />}>
        Take me home!
      </Button>
    </Band>
  ),
});

function AppLayout() {
  return (
    <ThemeProvider>
      <Toaster>
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <SiteHeader />
              {/* Pages are stacks of bands, the last one stretches to the bottom of the screen. */}
              <div data-page className="flex flex-1 flex-col [&>section:last-child]:flex-1">
                <SyncGate>
                  <Outlet />
                </SyncGate>
              </div>
            </SidebarInset>
            <PlayerHost />
            <CommandMenu />
          </SidebarProvider>
        </TooltipProvider>
      </Toaster>
    </ThemeProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
