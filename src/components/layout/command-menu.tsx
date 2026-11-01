import { IconBroadcast, IconHeart, IconHistory, IconHome, IconSettings } from '@tabler/icons-react'
import { useDebouncedValue } from '@tanstack/react-pacer'
import { useHotkey } from '@tanstack/react-hotkeys'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ChannelLogo } from '@/components/channel/channel-logo'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useLookups } from '@/hooks/use-lookups'
import { channelsQuery } from '@/lib/catalog/queries'
import { defaultFilters } from '@/lib/catalog/search'
import { usePreferences } from '@/stores/preferences'
import { useCommandMenu } from '@/stores/ui'

const pages = [
  { to: '/', label: 'Home', icon: IconHome },
  { to: '/channels', label: 'All channels', icon: IconBroadcast },
  { to: '/favorites', label: 'Favorites', icon: IconHeart },
  { to: '/history', label: 'History', icon: IconHistory },
  { to: '/settings', label: 'Settings', icon: IconSettings },
] as const

export function CommandMenu() {
  const { open, setOpen } = useCommandMenu()
  const navigate = useNavigate()
  const hideNsfw = usePreferences((s) => s.hideNsfw)
  const lookups = useLookups()
  const [query, setQuery] = useState('')
  const [debounced] = useDebouncedValue(query, { wait: 150 })

  useHotkey('Mod+K', () => setOpen(!open))
  useHotkey('/', () => setOpen(true), { ignoreInputs: true })

  const { data } = useQuery({
    ...channelsQuery({ ...defaultFilters, q: debounced, hideNsfw }),
    enabled: open && debounced.trim().length > 0,
    placeholderData: keepPreviousData,
  })
  const results = debounced.trim() ? (data ?? []).slice(0, 8) : []

  const go = (action: () => void) => {
    setOpen(false)
    setQuery('')
    action()
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Search" description="Find a channel or jump to a page">
      <Command shouldFilter={false}>
        <CommandInput placeholder="Search channels…" value={query} onValueChange={setQuery} />
        <CommandList className="scroll-fade-y">
          <CommandEmpty>No channels found.</CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading="Channels">
              {results.map((channel) => (
                <CommandItem
                  key={channel.id}
                  value={channel.id}
                  onSelect={() =>
                    go(() => void navigate({ to: '/channels/$channelId', params: { channelId: channel.id } }))
                  }
                >
                  <ChannelLogo name={channel.name} src={channel.logo} className="size-6" />
                  <span className="flex-1 truncate">{channel.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {lookups?.countries.get(channel.country)?.flag}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {!debounced.trim() && (
            <CommandGroup heading="Pages">
              {pages.map((page) => (
                <CommandItem key={page.to} value={page.label} onSelect={() => go(() => void navigate({ to: page.to }))}>
                  <page.icon />
                  {page.label}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
