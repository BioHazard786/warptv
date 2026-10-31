import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { useLookups } from '@/hooks/use-lookups'
import type { ChannelRow } from '@/lib/catalog/types'
import { qualityLabel } from './channel-card'
import { ChannelLogo } from './channel-logo'
import { FavoriteButton } from './favorite-button'

export function ChannelListItem({ channel }: { channel: ChannelRow }) {
  const lookups = useLookups()
  const country = lookups?.countries.get(channel.country)
  const quality = qualityLabel(channel.maxHeight)
  const categories = channel.categories
    .map((id) => lookups?.categories.get(id)?.name ?? id)
    .join(', ')

  return (
    <Item
      variant="outline"
      size="sm"
      render={<Link to="/channels/$channelId" params={{ channelId: channel.id }} />}
    >
      <ItemMedia>
        <ChannelLogo name={channel.name} src={channel.logo} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{channel.name}</ItemTitle>
        <ItemDescription>
          {country ? `${country.flag} ${country.name}` : channel.country}
          {categories && ` · ${categories}`}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        {quality && <Badge variant="secondary">{quality}</Badge>}
        <FavoriteButton channelId={channel.id} />
      </ItemActions>
    </Item>
  )
}
