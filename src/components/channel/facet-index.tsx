import { IconSearch } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Band, BandHeading } from '@/components/layout/band'
import type { BandTone } from '@/components/layout/band'
import { Badge } from '@/components/ui/badge'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Item, ItemActions, ItemContent, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Skeleton } from '@/components/ui/skeleton'
import { useLookups } from '@/hooks/use-lookups'
import { facetsQuery } from '@/lib/catalog/queries'
import { usePreferences } from '@/stores/preferences'
import { EmptyChannels } from './empty-channels'

type Kind = 'countries' | 'categories' | 'languages'

const searchKey = { countries: 'country', categories: 'category', languages: 'language' } as const

/** Lists every country, category or language that has channels, linking into the browse page. */
export function FacetIndex({
  kind,
  title,
  tone,
  blurb,
}: {
  kind: Kind
  title: string
  tone: BandTone
  blurb: React.ReactNode
}) {
  const hideNsfw = usePreferences((s) => s.hideNsfw)
  const { data, isPending } = useQuery(facetsQuery(hideNsfw))
  const lookups = useLookups()
  const [filter, setFilter] = useState('')

  const rows = useMemo(() => {
    const label = (value: string) => {
      if (kind === 'countries') return lookups?.countries.get(value)?.name ?? value
      if (kind === 'categories') return lookups?.categories.get(value)?.name ?? value
      return lookups?.languages.get(value)?.name ?? value
    }
    const needle = filter.trim().toLowerCase()
    return (data?.[kind] ?? [])
      .map((facet) => ({ ...facet, label: label(facet.value) }))
      .filter((row) => row.label.toLowerCase().includes(needle))
  }, [data, kind, lookups, filter])

  return (
    <Band tone={tone} className="max-w-3xl gap-5">
      <BandHeading as="h1" title={`${title}.`}>
        {blurb}
      </BandHeading>
      <InputGroup>
        <InputGroupAddon>
          <IconSearch />
        </InputGroupAddon>
        <InputGroupInput placeholder={`Search ${title.toLowerCase()}…`} value={filter} onChange={(e) => setFilter(e.target.value)} />
      </InputGroup>
      {isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : rows.length === 0 ? (
        <EmptyChannels title="Nothing found" description="Try a different search." />
      ) : (
        <ItemGroup className="gap-2">
          {rows.map((row) => (
            <Item
              key={row.value}
              data-band="paper"
              variant="outline"
              size="sm"
              className="rounded-(--card-radius) border-ink bg-background text-foreground"
              render={<Link to="/channels" search={{ [searchKey[kind]]: [row.value] }} />}
            >
              {kind === 'countries' && (
                <ItemMedia className="text-xl">{lookups?.countries.get(row.value)?.flag}</ItemMedia>
              )}
              <ItemContent>
                <ItemTitle className="font-extrabold">{row.label}</ItemTitle>
              </ItemContent>
              <ItemActions>
                <Badge variant="pixel">{row.count}</Badge>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      )}
    </Band>
  )
}
