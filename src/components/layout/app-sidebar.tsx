import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { startSync } from "@/lib/catalog/sync";
import { useSyncStore } from "@/stores/sync";
import {
  IconBroadcast,
  IconDeviceTv,
  IconHeart,
  IconHistory,
  IconHome,
  IconLanguage,
  IconRefresh,
  IconSettings,
  IconTags,
  IconWorld,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";

const browse = [
  { to: "/", label: "Home", icon: IconHome },
  { to: "/channels", label: "Every channel", icon: IconBroadcast },
  { to: "/countries", label: "Countries", icon: IconWorld },
  { to: "/categories", label: "Categories", icon: IconTags },
  { to: "/languages", label: "Languages", icon: IconLanguage },
] as const;

const library = [
  { to: "/favorites", label: "Faves", icon: IconHeart },
  { to: "/history", label: "Watched", icon: IconHistory },
  { to: "/settings", label: "Settings", icon: IconSettings },
] as const;

function formatAge(timestamp: number | null) {
  if (!timestamp) return "never";
  const minutes = Math.round((Date.now() - timestamp) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const queryClient = useQueryClient();
  const syncing = useSyncStore((s) => s.syncing);
  const lastSyncedAt = useSyncStore((s) => s.lastSyncedAt);

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <Sidebar>
      <SidebarHeader data-band="story">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent" render={<Link to="/" />}>
              <IconDeviceTv className="size-7!" />
              <span className="flex items-center gap-1 text-3xl font-extrabold tracking-tight">
                Warp
                <span className="rotate-(--sticker-tilt) rounded-[4px] bg-black px-1.5 py-0.5 text-lg leading-none text-white">
                  TV
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent data-band="story">
        {[
          { label: "Browse.", items: browse },
          { label: "Your stuff.", items: library },
        ].map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      isActive={isActive(item.to)}
                      render={<Link to={item.to} />}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter data-band="story">
        <div className="flex items-center justify-between gap-2 px-2 text-sm font-medium text-muted-foreground">
          <span className={syncing ? "shimmer" : undefined}>
            {syncing ? "Fetching channels…" : `Synced ${formatAge(lastSyncedAt)}`}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Sync catalog now"
            disabled={syncing}
            onClick={() => startSync(queryClient, { force: true })}
          >
            {syncing ? <Spinner /> : <IconRefresh />}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
