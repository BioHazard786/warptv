import { IconLayoutGrid, IconList, IconSearch, IconX } from '@tabler/icons-react'
import { useDebouncedValue } from '@tanstack/react-pacer'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { ChannelGrid } from '@/components/channel/channel-grid'
import { EmptyChannels } from '@/components/channel/empty-channels'
import { FacetFilter } from '@/components/channel/facet-filter'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useLookups } from '@/hooks/use-lookups'
import { channelsQuery, facetsQuery } from '@/lib/catalog/queries'
import type { ChannelSort } from '@/lib/catalog/search'
import { usePreferences } from '@/stores/preferences'

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  country: z.array(z.string()).optional().catch(undefined),
  category: z.array(z.string()).optional().catch(undefined),
  language: z.array(z.string()).optional().catch(undefined),
  quality: z.number().optional().catch(undefined),
  all: z.boolean().optional().catch(undefined),
  sort: z.enum(['relevance', 'name', 'quality', 'country']).optional().catch(undefined),
})

export const Route = createFileRoute('/channels/')({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: 'Channels · WarpTV' }] }),
  component: ChannelsPage,
})

const sortItems = [
  { value: 'relevance', label: 'Best match' },
  { value: 'name', label: 'Name' },
  { value: 'quality', label: 'Quality' },
  { value: 'country', label: 'Country' },
]

const qualityItems = [
  { value: '0', label: 'Any quality' },
  { value: '720', label: 'HD (720p+)' },
  { value: '1080', label: 'Full HD (1080p+)' },
  { value: '2160', label: '4K' },
]

function ChannelsPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const hideNsfw = usePreferences((s) => s.hideNsfw)
  const view = usePreferences((s) => s.view)
  const setPreferences = usePreferences((s) => s.set)
  const lookups = useLookups()
  const { data: facets } = useQuery(facetsQuery(hideNsfw))

  const [input, setInput] = useState(search.q ?? '')
  const [debounced] = useDebouncedValue(input, { wait: 200 })

  // The URL is the source of truth for filters, the input only trails it while typing.
  useEffect(() => {
    if ((search.q ?? '') !== debounced) setInput(search.q ?? '')
  }, [search.q]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (debounced !== (search.q ?? '')) {
      void navigate({ search: (prev) => ({ ...prev, q: debounced || undefined }), replace: true })
    }
  }, [debounced]) // eslint-disable-line react-hooks/exhaustive-deps

  const sort: ChannelSort = search.sort ?? (search.q ? 'relevance' : 'name')
  const filters = useMemo(
    () => ({
      q: search.q ?? '',
      countries: search.country ?? [],
      categories: search.category ?? [],
      languages: search.language ?? [],
      minHeight: search.quality ?? 0,
      playable: !search.all,
      hideNsfw,
      sort,
    }),
    [search, hideNsfw, sort],
  )
  const { data: channels } = useQuery({
    ...channelsQuery(filters),
    placeholderData: keepPreviousData,
  })

  const update = (patch: Partial<z.input<typeof searchSchema>>) =>
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })

  const hasFilters = Boolean(
    search.q || search.country?.length || search.category?.length || search.language?.length || search.quality || search.all,
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full sm:max-w-xs">
          <InputGroupAddon>
            <IconSearch />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Filter by name…"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </InputGroup>
        <FacetFilter
          label="Country"
          selected={filters.countries}
          onChange={(country) => update({ country: country.length ? country : undefined })}
          options={(facets?.countries ?? []).map((f) => ({
            ...f,
            label: `${lookups?.countries.get(f.value)?.flag ?? ''} ${lookups?.countries.get(f.value)?.name ?? f.value}`.trim(),
          }))}
        />
        <FacetFilter
          label="Category"
          selected={filters.categories}
          onChange={(category) => update({ category: category.length ? category : undefined })}
          options={(facets?.categories ?? []).map((f) => ({
            ...f,
            label: lookups?.categories.get(f.value)?.name ?? f.value,
          }))}
        />
        <FacetFilter
          label="Language"
          selected={filters.languages}
          onChange={(language) => update({ language: language.length ? language : undefined })}
          options={(facets?.languages ?? []).map((f) => ({
            ...f,
            label: lookups?.languages.get(f.value)?.name ?? f.value,
          }))}
        />
        <Select
          items={qualityItems}
          value={String(search.quality ?? 0)}
          onValueChange={(value) => update({ quality: Number(value) || undefined })}
        >
          <SelectTrigger aria-label="Minimum quality">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {qualityItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Field orientation="horizontal" className="w-auto">
          <Switch id="include-all" checked={!!search.all} onCheckedChange={(all) => update({ all: all || undefined })} />
          <FieldLabel htmlFor="include-all">Include channels without streams</FieldLabel>
        </Field>
        {hasFilters && (
          <Button variant="ghost" onClick={() => void navigate({ search: {}, replace: true })}>
            <IconX /> Clear
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {channels ? (
            `${channels.length.toLocaleString()} channels`
          ) : (
            <span className="shimmer">Loading…</span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <Select items={sortItems} value={sort} onValueChange={(value) => update({ sort: value as ChannelSort })}>
            <SelectTrigger aria-label="Sort by">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ToggleGroup
            variant="outline"
            value={[view]}
            onValueChange={(value) => value[0] && setPreferences({ view: value[0] as 'grid' | 'list' })}
          >
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <IconLayoutGrid />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <IconList />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {!channels ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 12 }, (_, i) => (
            <Skeleton key={i} className="h-44 rounded-3xl" />
          ))}
        </div>
      ) : channels.length === 0 ? (
        <EmptyChannels title="No channels match" description="Try removing a filter or searching for something else.">
          {hasFilters && (
            <Button variant="outline" onClick={() => void navigate({ search: {}, replace: true })}>
              Clear filters
            </Button>
          )}
        </EmptyChannels>
      ) : (
        <ChannelGrid channels={channels} view={view} />
      )}
    </div>
  )
}
