import { AspectRatio } from "@/components/ui/aspect-ratio";
import { usePlayerStore } from "@/stores/player";
import { useLayoutEffect, useRef } from "react";

/**
 * Reserves the watch page's player area, framed as the chunky handheld. The player itself
 * lives in `PlayerHost` so it survives navigation, this only tells the host where to draw it.
 */
export function PlayerSlot() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const { setSlot } = usePlayerStore.getState();
    let frame = 0;
    let last = "";

    const update = () => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const key = `${rect.left}|${rect.top}|${rect.width}|${rect.height}`;
      if (key === last) return;
      last = key;
      setSlot({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      });
    };
    // Scroll updates synchronously so the player doesn't trail the page, the frame
    // loop catches layout changes like the sidebar collapsing.
    const loop = () => {
      update();
      frame = requestAnimationFrame(loop);
    };
    loop();
    window.addEventListener("scroll", update, { capture: true, passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update, { capture: true });
      setSlot(null);
    };
  }, []);

  return (
    <div className="device relative rounded-[34px] p-3 md:p-5">
      <AspectRatio
        ref={ref}
        ratio={16 / 9}
        className="w-full rounded-md bg-ink"
      />
      <div
        aria-hidden
        className="mt-3 flex items-center justify-between px-1 text-[var(--story-ink)] md:mt-4"
      >
        <span className="font-pixel text-xs">warp·tv</span>
        <span className="flex gap-3">
          <span className="size-5 rounded-full bg-[var(--story-ink)] shadow-[0_4px_0_var(--deep)]" />
          <span className="size-5 rounded-full bg-[var(--story-ink)] shadow-[0_4px_0_var(--deep)]" />
        </span>
      </div>
      {/* The crank. */}
      <span
        aria-hidden
        className="absolute top-1/3 -right-3 hidden h-20 w-3 rounded-r-md bg-[var(--deep)] md:block"
      />
    </div>
  );
}
