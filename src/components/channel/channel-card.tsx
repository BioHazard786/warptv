import { IconArrowRight } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { useLookups } from '@/hooks/use-lookups'
import type { ChannelRow } from '@/lib/catalog/types'
import { ChannelLogo } from './channel-logo'
import { FavoriteButton } from './favorite-button'

export function qualityLabel(height: number) {
  if (height >= 2160) return '4K'
  if (height >= 1080) return 'FHD'
  if (height >= 720) return 'HD'
  return height > 0 ? 'SD' : null
}

/**
 * A 1-bit game card: dithered paper front with the logo and name, scanlined ink back with
 * the details. Hover and keyboard focus flip it, touch screens keep the front, which carries
 * everything needed to pick a channel.
 */
export function ChannelCard({ channel }: { channel: ChannelRow }) {
  const lookups = useLookups()
  const country = lookups?.countries.get(channel.country)
  const quality = qualityLabel(channel.maxHeight)
  const place = country ? `${country.flag} ${country.name}` : channel.country
  const categories = channel.categories
    .slice(0, 2)
    .map((id) => lookups?.categories.get(id)?.name ?? id)
    .join(' · ')

  return (
    <div className="flip-card relative h-44">
      <Link
        to="/channels/$channelId"
        params={{ channelId: channel.id }}
        className="flip-stage block size-full rounded-(--card-radius) outline-none focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div
          data-band="paper"
          className="flip-face flip-front flex flex-col overflow-hidden rounded-(--card-radius) border border-ink bg-background text-foreground"
        >
          <div className="relative flex flex-1 items-center justify-center dither-dots">
            <ChannelLogo name={channel.name} src={channel.logo} className="size-14 border border-ink bg-paper" />
            <div className="absolute top-2 left-2 flex gap-1">
              {quality && <Badge variant="pixel">{quality}</Badge>}
              {channel.closed && <Badge variant="destructive">Closed</Badge>}
            </div>
          </div>
          <div className="border-t border-ink px-3 py-2">
            <p className="truncate font-extrabold leading-tight">{channel.name}</p>
            <p className="truncate text-xs text-muted-foreground">{place}</p>
          </div>
        </div>

        <div
          data-band="ink"
          aria-hidden
          className="flip-face flip-back flex flex-col justify-between gap-2 overflow-hidden rounded-(--card-radius) border border-ink scanlines p-3 text-foreground"
        >
          <div className="flex min-w-0 flex-col gap-1 pr-8">
            <p className="line-clamp-2 text-lg font-extrabold leading-tight">{channel.name}</p>
            <p className="truncate text-sm">{place}</p>
            {categories && <p className="truncate text-sm text-muted-foreground">{categories}</p>}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-pixel text-[10px]">
              {channel.streamCount} {channel.streamCount === 1 ? 'stream' : 'streams'}
            </span>
            <span className="inline-flex items-center gap-1 font-bold">
              Watch! <IconArrowRight className="size-4" />
            </span>
          </div>
        </div>
      </Link>
      <div data-band="paper" className="absolute top-2 right-2">
        <FavoriteButton channelId={channel.id} variant="secondary" />
      </div>
    </div>
  )
}
