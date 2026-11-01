import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { ChannelCard } from '@/components/channel/channel-card'
import { EmptyChannels } from '@/components/channel/empty-channels'
import { Band, BandHeading } from '@/components/layout/band'
import { Button } from '@/components/ui/button'
import { Marker, MarkerContent } from '@/components/ui/marker'
import { db } from '@/lib/catalog/db'
import { channelsByIdsQuery } from '@/lib/catalog/queries'
import type { ChannelRow } from '@/lib/catalog/types'

export const Route = createFileRoute('/history')({
  head: () => ({ meta: [{ title: 'History · WarpTV' }] }),
  component: History,
})

const startOfDay = (time: number) => new Date(time).setHours(0, 0, 0, 0)

function dayLabel(time: number) {
  const days = Math.round((startOfDay(Date.now()) - startOfDay(time)) / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return new Date(time).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
}

function History() {
  const rows = useLiveQuery(() => db.history.orderBy('watchedAt').reverse().limit(200).toArray(), [])
  const { data: channels } = useQuery({
    ...channelsByIdsQuery(rows?.map((r) => r.channelId) ?? []),
    enabled: !!rows,
  })

  const groups = useMemo(() => {
    const byId = new Map(channels?.map((c) => [c.id, c]))
    const result: { label: string; channels: ChannelRow[] }[] = []
    for (const row of rows ?? []) {
      const channel = byId.get(row.channelId)
      if (!channel) continue
      const label = dayLabel(row.watchedAt)
      const group = result.at(-1)
      if (group?.label === label) group.channels.push(channel)
      else result.push({ label, channels: [channel] })
    }
    return result
  }, [rows, channels])

  return (
    <Band tone="story">
      <BandHeading
        as="h1"
        title="Watched Lately."
        action={
          !!rows?.length && (
            <Button variant="outline" size="lg" onClick={() => void db.history.clear()}>
              Wipe it clean
            </Button>
          )
        }
      >
        Your channel-surfing trail. <b>It never leaves this device.</b>
      </BandHeading>
      {rows?.length === 0 ? (
        <EmptyChannels title="Nothing Yet." description="Watch something and it shows up here.">
          <Button size="lg" nativeButton={false} render={<Link to="/channels" />}>
            Start surfing!
          </Button>
        </EmptyChannels>
      ) : (
        groups.map((group) => (
          <section key={group.label} className="flex flex-col gap-3">
            <Marker variant="separator">
              <MarkerContent className="text-lg font-extrabold text-foreground">{group.label}</MarkerContent>
            </Marker>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
              {group.channels.map((channel) => (
                <ChannelCard key={channel.id} channel={channel} />
              ))}
            </div>
          </section>
        ))
      )}
    </Band>
  )
}
