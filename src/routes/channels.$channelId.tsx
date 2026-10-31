import { IconAlertTriangle, IconExternalLink } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ChannelCard } from '@/components/channel/channel-card'
import { ChannelLogo } from '@/components/channel/channel-logo'
import { EmptyChannels } from '@/components/channel/empty-channels'
import { FavoriteButton } from '@/components/channel/favorite-button'
import { PlaybackLog } from '@/components/player/playback-log'
import { PlayerSlot } from '@/components/player/player-slot'
import { StreamList } from '@/components/player/stream-list'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useLookups } from '@/hooks/use-lookups'
import { channelDetailQuery, relatedQuery } from '@/lib/catalog/queries'
import { loadHealth } from '@/lib/streams/health'
import { usePlayerStore } from '@/stores/player'
import { usePreferences } from '@/stores/preferences'

export const Route = createFileRoute('/channels/$channelId')({
  head: () => ({ meta: [{ title: 'Watch · WarpTV' }] }),
  component: WatchPage,
})

function WatchPage() {
  const { channelId } = Route.useParams()
  const { data, isPending } = useQuery(channelDetailQuery(channelId))
  const lookups = useLookups()
  const status = usePlayerStore((s) => s.status)
  const candidates = usePlayerStore((s) => s.candidates)
  const playing = usePlayerStore((s) => s.channel?.id)

  const channel = data?.channel
  const { data: related } = useQuery({
    ...relatedQuery(channelId, channel?.country ?? '', channel?.categories[0]),
    enabled: !!channel,
  })

  // Start the channel once, coming back to a channel that's already playing keeps it going.
  useEffect(() => {
    if (!data || usePlayerStore.getState().channel?.id === data.channel.id) return
    let cancelled = false
    void loadHealth().then((health) => {
      if (cancelled) return
      usePlayerStore.getState().play(data.channel, data.streams, health, usePreferences.getState().useProxy)
    })
    return () => {
      cancelled = true
    }
  }, [data])

  if (isPending) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <AspectRatio ratio={16 / 9}>
          <Skeleton className="size-full rounded-2xl" />
        </AspectRatio>
        <Skeleton className="h-10 w-1/2" />
      </div>
    )
  }

  if (!data || !channel) {
    return (
      <EmptyChannels title="Channel not found" description="It may have been removed from the catalog.">
        <Button nativeButton={false} render={<Link to="/channels" />}>Browse channels</Button>
      </EmptyChannels>
    )
  }

  const country = lookups?.countries.get(channel.country)
  const replacedBy = channel.replacedBy?.split('@')[0]
  const blockedOnly =
    candidates.length > 0 && candidates.every((c) => c.via === 'unavailable') && playing === channel.id

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-3">
        <PlayerSlot />
        <PlaybackLog channelId={channel.id} />
      </div>

      <div className="flex items-start gap-4">
        <ChannelLogo name={channel.name} src={channel.logo} className="size-16" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-semibold">{channel.name}</h1>
          <p className="text-sm text-muted-foreground">
            {country ? `${country.flag} ${country.name}` : channel.country}
            {channel.network && ` · ${channel.network}`}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {channel.closed && <Badge variant="destructive">Closed {channel.closed}</Badge>}
            {channel.isNsfw && <Badge variant="destructive">18+</Badge>}
            {channel.categories.map((id) => (
              <Badge key={id} variant="secondary" render={<Link to="/channels" search={{ category: [id] }} />}>
                {lookups?.categories.get(id)?.name ?? id}
              </Badge>
            ))}
          </div>
        </div>
        <FavoriteButton channelId={channel.id} variant="outline" size="icon" />
      </div>

      {replacedBy && (
        <Alert>
          <IconAlertTriangle />
          <AlertTitle>This channel was replaced</AlertTitle>
          <AlertDescription>
            <Link to="/channels/$channelId" params={{ channelId: replacedBy }} className="underline">
              Go to the new channel
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {blockedOnly && (
        <Alert>
          <IconAlertTriangle />
          <AlertTitle>These streams can't play in a browser</AlertTitle>
          <AlertDescription>
            They are served over plain http or need special request headers. Copy the URL into a player like VLC.
          </AlertDescription>
        </Alert>
      )}
      {status === 'failed' && !blockedOnly && playing === channel.id && (
        <Alert variant="destructive">
          <IconAlertTriangle />
          <AlertTitle>None of the streams worked</AlertTitle>
          <AlertDescription>Streams go down often. Pick another one below or check back later.</AlertDescription>
        </Alert>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Streams</h2>
        {data.streams.length === 0 ? (
          <EmptyChannels title="No streams yet" description="The catalog has no working stream for this channel." />
        ) : (
          <StreamList feeds={data.feeds} />
        )}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <Detail label="Also known as" value={channel.altNames.join(', ')} />
            <Detail label="Owners" value={channel.owners.join(', ')} />
            <Detail label="Launched" value={channel.launched} />
            <Detail
              label="Languages"
              value={channel.languages.map((l) => lookups?.languages.get(l)?.name ?? l).join(', ')}
            />
            <Detail label="Feeds" value={data.feeds.map((f) => f.name).join(', ')} />
            <Detail
              label="Website"
              value={
                channel.website && (
                  <a
                    href={channel.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 underline"
                  >
                    {new URL(channel.website).hostname} <IconExternalLink className="size-3" />
                  </a>
                )
              }
            />
          </dl>
        </CardContent>
      </Card>

      {related && related.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">More like this</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {related.slice(0, 8).map((c) => (
              <ChannelCard key={c.id} channel={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
