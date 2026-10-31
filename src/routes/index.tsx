import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChannelSection, ViewAll } from '@/components/channel/channel-section'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useLookups } from '@/hooks/use-lookups'
import { db } from '@/lib/catalog/db'
import { channelsByIdsQuery, facetsQuery, topChannelsQuery } from '@/lib/catalog/queries'
import { usePreferences } from '@/stores/preferences'

export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: 'WarpTV' }] }),
  component: Home,
})

function Home() {
  const hideNsfw = usePreferences((s) => s.hideNsfw)
  const lookups = useLookups()
  const { data: facets } = useQuery(facetsQuery(hideNsfw))

  const recent = useLiveQuery(() => db.history.orderBy('watchedAt').reverse().limit(10).toArray(), [])
  const favorites = useLiveQuery(() => db.favorites.orderBy('addedAt').reverse().limit(10).toArray(), [])
  const { data: recentChannels } = useQuery({
    ...channelsByIdsQuery(recent?.map((r) => r.channelId) ?? []),
    enabled: !!recent,
  })
  const { data: favoriteChannels } = useQuery({
    ...channelsByIdsQuery(favorites?.map((f) => f.channelId) ?? []),
    enabled: !!favorites,
  })
  const { data: top } = useQuery(topChannelsQuery(hideNsfw))

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <ChannelSection title="Continue watching" channels={recentChannels ?? []} action={<ViewAll to="/history" />} />
      <ChannelSection title="Your favorites" channels={favoriteChannels ?? []} action={<ViewAll to="/favorites" />} />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Browse by category</h2>
        <div className="flex flex-wrap gap-2">
          {facets?.categories.map((facet) => (
            <Badge
              key={facet.value}
              variant="secondary"
              className="h-7 px-3 text-sm"
              render={<Link to="/channels" search={{ category: [facet.value] }} />}
            >
              {lookups?.categories.get(facet.value)?.name ?? facet.value}
              <span className="text-muted-foreground">{facet.count}</span>
            </Badge>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Popular countries</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
          {facets?.countries.slice(0, 12).map((facet) => {
            const country = lookups?.countries.get(facet.value)
            return (
              <Card key={facet.value} size="sm" className="transition-colors hover:bg-muted/50">
                <CardContent>
                  <Link to="/channels" search={{ country: [facet.value] }} className="flex items-center gap-3">
                    <span className="text-2xl">{country?.flag}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{country?.name ?? facet.value}</span>
                      <span className="text-xs text-muted-foreground">{facet.count} channels</span>
                    </span>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <ChannelSection title="Best quality" channels={top ?? []} />
    </div>
  )
}
