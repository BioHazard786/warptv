import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/stores/player";
import { IconArrowsMaximize, IconX } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { PlayerEngine } from "./player-engine";

/**
 * The one player for the whole app, mounted in the root layout. On the watch page it is
 * drawn over the page's `PlayerSlot`, anywhere else it docks in the corner, and since
 * it's the same element in both places playback never restarts.
 */
export function PlayerHost() {
  const channel = usePlayerStore((s) => s.channel);
  const slot = usePlayerStore((s) => s.slot);
  const status = usePlayerStore((s) => s.status);
  const close = usePlayerStore((s) => s.close);

  if (!channel) return null;

  return (
    <Card
      size="sm"
      className={cn(
        // The video skin takes the theme's buy colour and type.
        "fixed z-10 gap-0 py-0 [--media-accent-color:var(--buy)] [--media-accent-text-color:var(--buy-ink)] [--media-font-family:var(--font-sans)]",
        slot
          ? "rounded-md border-0"
          : "right-4 bottom-4 w-[min(24rem,calc(100vw-2rem))] shadow-lg",
      )}
      style={
        slot
          ? {
              left: slot.left,
              top: slot.top,
              width: slot.width,
              height: slot.height,
            }
          : undefined
      }
    >
      {status === "failed" ? (
        <AspectRatio
          ratio={16 / 9}
          className="flex w-full items-center justify-center p-4 text-center text-sm text-muted-foreground"
        >
          No stream could be played. Pick another one below.
        </AspectRatio>
      ) : (
        <PlayerEngine />
      )}
      {!slot && (
        <div className="flex items-center gap-2 p-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold">{channel.name}</p>
            <p className="text-xs text-muted-foreground">
              {status === "failed" ? (
                "Unavailable"
              ) : status === "loading" ? (
                <span className="shimmer">Connecting…</span>
              ) : (
                "On air!"
              )}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Open channel"
            nativeButton={false}
            render={
              <Link
                to="/channels/$channelId"
                params={{ channelId: channel.id }}
              />
            }
          >
            <IconArrowsMaximize />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Close player"
            onClick={close}
          >
            <IconX />
          </Button>
        </div>
      )}
    </Card>
  );
}
