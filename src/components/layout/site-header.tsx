import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCommandMenu } from "@/stores/ui";
import { IconSearch } from "@tabler/icons-react";
import { formatForDisplay } from "@tanstack/react-hotkeys";
import { ModeToggle } from "./mode-toggle";

export function SiteHeader() {
  const setOpen = useCommandMenu((s) => s.setOpen);

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center"
      />
      <Button
        variant="outline"
        className="w-full max-w-sm justify-start text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <IconSearch />
        <span className="flex-1 text-left">Search channels…</span>
        <Kbd>{formatForDisplay("Mod+K")}</Kbd>
      </Button>
      <div className="ml-auto">
        <ModeToggle />
      </div>
    </header>
  );
}
