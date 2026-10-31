import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChannelGrid } from '@/components/channel/channel-grid'
import { EmptyChannels } from '@/components/channel/empty-channels'
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
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Favorites</h1>
      {channels?.length === 0 ? (
        <EmptyChannels title="No favorites yet" description="Tap the heart on any channel to keep it here.">
          <Button nativeButton={false} render={<Link to="/channels" />}>Browse channels</Button>
        </EmptyChannels>
      ) : (
        channels && <ChannelGrid channels={channels} view={view} />
      )}
    </div>
  )
}
