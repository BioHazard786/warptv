import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
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

export function ChannelCard({ channel }: { channel: ChannelRow }) {
  const lookups = useLookups()
  const country = lookups?.countries.get(channel.country)
  const quality = qualityLabel(channel.maxHeight)

  return (
    <div className="relative h-full">
      <Card size="sm" className="h-full transition-colors hover:bg-muted/50">
        <Link
          to="/channels/$channelId"
          params={{ channelId: channel.id }}
          className="flex h-full flex-col gap-3 px-(--card-spacing) outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <div className="flex items-start gap-3">
            <ChannelLogo name={channel.name} src={channel.logo} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{channel.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {country ? `${country.flag} ${country.name}` : channel.country}
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            {quality && <Badge variant="secondary">{quality}</Badge>}
            {channel.streamCount > 1 && (
              <Badge variant="outline">{channel.streamCount} streams</Badge>
            )}
            {channel.closed && <Badge variant="destructive">Closed</Badge>}
          </div>
        </Link>
      </Card>
      <div className="absolute top-2 right-2">
        <FavoriteButton channelId={channel.id} />
      </div>
    </div>
  )
}
