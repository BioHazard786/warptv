import { IconSearch } from "@tabler/icons-react";
import { formatForDisplay } from "@tanstack/react-hotkeys";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Kbd } from "@/components/ui/kbd";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCommandMenu } from "@/stores/ui";
import { SurpriseButton } from "./surprise-button";
import { ThemePicker } from "./theme-picker";

/**
 * Finds the band right under the header so the header can repaint to match it as the page
 * scrolls. The player and other overlays are skipped, only bands in the page content count.
 */
function useBandBelow(header: React.RefObject<HTMLElement | null>) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [band, setBand] = useState("hero");

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = header.current?.getBoundingClientRect();
      if (!rect) return;
      const below = document
        .elementsFromPoint(rect.left + rect.width / 2, rect.bottom + 1)
        .find((element) => element.closest("[data-page]"));
      // Cards and fields carry their own data-band, only the page band's <section> counts.
      setBand(below?.closest("section[data-band]")?.getAttribute("data-band") ?? "hero");
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    // Routes and queries swap the bands in after navigation, often without the page changing
    // size, so watch the page's DOM as well as scroll. Updates are batched to one per frame.
    const observer = new MutationObserver(schedule);
    const page = document.querySelector("[data-page]");
    if (page) observer.observe(page, { childList: true, subtree: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [header, pathname]);

  return band;
}

export function SiteHeader() {
  const setOpen = useCommandMenu((s) => s.setOpen);
  const ref = useRef<HTMLElement>(null);
  const band = useBandBelow(ref);

  return (
    <header
      ref={ref}
      data-band={band}
      className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b-(length:--nav-rule) border-foreground bg-background px-3 text-foreground transition-colors md:gap-3 md:px-6"
    >
      <SidebarTrigger />
      <button
        type="button"
        data-band="field"
        onClick={() => setOpen(true)}
        className="flex h-10 w-full max-w-sm min-w-0 items-center gap-2 rounded-lg border-2 border-foreground bg-background px-3 text-sm text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <IconSearch className="size-4 shrink-0" />
        <span className="flex-1 truncate text-left">Find a channel…</span>
        <Kbd className="hidden sm:inline-flex">{formatForDisplay("Mod+K")}</Kbd>
      </button>
      <div className="ml-auto flex items-center gap-2">
        <SurpriseButton compact />
        <ThemePicker />
      </div>
    </header>
  );
}
