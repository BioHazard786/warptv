import { IconDice5 } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { channelsQuery } from '@/lib/catalog/queries'
import { defaultFilters } from '@/lib/catalog/search'
import { usePreferences } from '@/stores/preferences'

/** Jumps to a random playable HD channel. The glossy pill, so one per screen. */
export function SurpriseButton({
  size,
  compact = false,
}: {
  size?: ComponentProps<typeof Button>['size']
  compact?: boolean
}) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const hideNsfw = usePreferences((s) => s.hideNsfw)

  const surprise = async () => {
    const channels = await queryClient.fetchQuery(channelsQuery({ ...defaultFilters, minHeight: 720, hideNsfw }))
    const pick = channels[Math.floor(Math.random() * channels.length)]
    if (pick) void navigate({ to: '/channels/$channelId', params: { channelId: pick.id } })
  }

  return (
    <Button variant="shop" size={size} aria-label="Surprise me with a random channel" onClick={() => void surprise()}>
      <IconDice5 data-icon="inline-start" />
      <span className={compact ? 'hidden sm:inline' : undefined}>
        Surprise me<i>!!</i>
      </span>
    </Button>
  )
}
