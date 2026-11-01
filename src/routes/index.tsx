import { IconArrowRight } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChannelSection, ViewAll } from '@/components/channel/channel-section'
import { Band, BandHeading } from '@/components/layout/band'
import { SurpriseButton } from '@/components/layout/surprise-button'
import { Button } from '@/components/ui/button'
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
  const total = facets?.countries.reduce((sum, facet) => sum + facet.count, 0)

  return (
    <>
      <Band tone="hero" className="gap-10 py-6 md:py-10">
        <div className="relative flex flex-col gap-6">
          {total ? (
            <span className="w-fit rotate-(--sticker-tilt) rounded-[4px] bg-black px-3 py-1.5 font-pixel text-sm text-white">
              {total.toLocaleString()} channels. Free!
            </span>
          ) : null}
          <h1 className="text-[clamp(4rem,14vw,11rem)] leading-[0.82] font-extrabold tracking-[-0.05em]">
            Tune
            <br />
            In.
          </h1>
          {/* Bold, so white on the slate hero still reads as large text at phone sizes. */}
          <p className="max-w-2xl text-blurb font-bold text-pretty">
            Free live TV from{' '}
            <mark className="rounded-[2px] bg-[var(--story)] px-1 text-[var(--story-ink)]">every corner of the planet</mark>
            . No account, no subscription, no remote to lose.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="xl" nativeButton={false} render={<Link to="/channels" />}>
            Browse it all <IconArrowRight data-icon="inline-end" />
          </Button>
          <SurpriseButton size="xl" />
        </div>
      </Band>

      <ChannelSection
        tone="story"
        title="Keep Watching."
        channels={recentChannels ?? []}
        action={<ViewAll to="/history" />}
      >
        Right where you left them. <b>No spoilers</b>, it's live.
      </ChannelSection>

      <ChannelSection
        tone="club"
        title="Your Faves."
        channels={favoriteChannels ?? []}
        action={<ViewAll to="/favorites" />}
      >
        The ones you hearted. <b>Good taste</b>, honestly.
      </ChannelSection>

      <Band tone="shop">
        <BandHeading title="Pick A Vibe.">
          News at breakfast, cartoons at lunch, <b>cooking shows at 2am</b>. We don't judge.
        </BandHeading>
        <div className="flex flex-wrap gap-2">
          {facets?.categories.map((facet) => (
            <Button
              key={facet.value}
              variant="outline"
              size="lg"
              nativeButton={false}
              render={<Link to="/channels" search={{ category: [facet.value] }} />}
            >
              {lookups?.categories.get(facet.value)?.name ?? facet.value}
              <span className="font-pixel text-[10px] opacity-80">{facet.count}</span>
            </Button>
          ))}
        </div>
      </Band>

      <Band tone="specs">
        <BandHeading title="Around The World.">
          Hop a border <b>without the jet lag</b>. These countries have the most to watch.
        </BandHeading>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
          {facets?.countries.slice(0, 12).map((facet) => {
            const country = lookups?.countries.get(facet.value)
            return (
              <Card key={facet.value} size="sm" className="transition-transform hover:-translate-y-1">
                <CardContent>
                  <Link to="/channels" search={{ country: [facet.value] }} className="flex items-center gap-3 outline-none">
                    <span className="text-3xl">{country?.flag}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-extrabold">{country?.name ?? facet.value}</span>
                      <span className="font-pixel text-[10px] text-muted-foreground">{facet.count} channels</span>
                    </span>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </Band>

      <ChannelSection tone="pop" title="Crisp Picture." channels={top ?? []}>
        Full HD and up. <b>Every pore, every pixel.</b>
      </ChannelSection>
    </>
  )
}
