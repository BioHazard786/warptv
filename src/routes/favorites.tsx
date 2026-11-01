import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChannelGrid } from '@/components/channel/channel-grid'
import { EmptyChannels } from '@/components/channel/empty-channels'
import { Band, BandHeading } from '@/components/layout/band'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/catalog/db'
import { channelsByIdsQuery } from '@/lib/catalog/queries'
import { usePreferences } from '@/stores/preferences'

export const Route = createFileRoute('/favorites')({
  head: () => ({ meta: [{ title: 'Favorites · WarpTV' }] }),
  component: Favorites,
})

function Favorites() {
  const view = usePreferences((s) => s.view)
  const rows = useLiveQuery(() => db.favorites.orderBy('addedAt').reverse().toArray(), [])
  const { data: channels } = useQuery({
    ...channelsByIdsQuery(rows?.map((r) => r.channelId) ?? []),
    enabled: !!rows,
  })

  return (
    <Band tone="club">
      <BandHeading as="h1" title="Your Faves.">
        Every channel you hearted, <b>all in one place</b>.
      </BandHeading>
      {channels?.length === 0 ? (
        <EmptyChannels title="Nothing Hearted." description="Tap the heart on any channel and it moves in here.">
          <Button size="lg" nativeButton={false} render={<Link to="/channels" />}>Go find some!</Button>
        </EmptyChannels>
      ) : (
        channels && <ChannelGrid channels={channels} view={view} />
      )}
    </Band>
  )
}
