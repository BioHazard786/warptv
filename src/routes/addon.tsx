import { IconX } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { FacetFilter } from '@/components/channel/facet-filter'
import { Band, BandHeading } from '@/components/layout/band'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/toast'
import { useLookups } from '@/hooks/use-lookups'
import { facetsQuery } from '@/lib/catalog/queries'
import { decodeConfig, encodeConfig } from '@/lib/stremio-config'
import type { AddonConfig } from '@/lib/stremio-config'

export const Route = createFileRoute('/addon')({
  validateSearch: z.object({ config: z.string().optional().catch(undefined) }),
  head: () => ({ meta: [{ title: 'Stremio addon · WarpTV' }] }),
  component: AddonPage,
})

const qualityItems = [
  { value: '0', label: 'Any quality' },
  { value: '720', label: 'HD (720p+)' },
  { value: '1080', label: 'Full HD (1080p+)' },
]

/** `hi-IN` → IN. A guess to save a click, iptv-org says UK where browsers say GB. */
function guessCountry() {
  const region = typeof navigator === 'undefined' ? undefined : navigator.language.split('-')[1]?.toUpperCase()
  return region === 'GB' ? 'UK' : region
}

const emptyConfig: AddonConfig = { countries: [], genres: [], languages: [], minHeight: 0, nsfw: false }

function AddonPage() {
  const { config: shared } = Route.useSearch()
  const lookups = useLookups()
  const { data: facets } = useQuery(facetsQuery(false))
  const [config, setConfig] = useState<AddonConfig>(
    () =>
      (shared && decodeConfig(shared)) || { ...emptyConfig, genres: ['sports', 'news', 'entertainment'] },
  )
  const hasSelection = Boolean(
    config.countries.length || config.genres.length || config.languages.length || config.minHeight || config.nsfw,
  )
  const update = (patch: Partial<AddonConfig>) => setConfig((c) => ({ ...c, ...patch }))

  // Only a code the catalog knows, otherwise the rows would be silently empty.
  useEffect(() => {
    const code = guessCountry()
    if (code && lookups?.countries.has(code)) {
      setConfig((c) => (c.countries.length ? c : { ...c, countries: [code] }))
    }
  }, [lookups])

  const ready = config.countries.length > 0 && config.genres.length > 0
  const path = `/stremio/${encodeConfig(config)}/manifest.json`
  const manifestUrl = typeof location === 'undefined' ? path : location.origin + path
  const installUrl = manifestUrl.replace(/^https?:\/\//, 'stremio://')

  const label = (kind: 'countries' | 'categories' | 'languages', value: string) => {
    if (kind === 'countries') {
      const c = lookups?.countries.get(value)
      return c ? `${c.flag} ${c.name}` : value
    }
    return lookups?.[kind].get(value)?.name ?? value
  }
  const options = (kind: 'countries' | 'categories' | 'languages') =>
    (facets?.[kind] ?? []).map((f) => ({ ...f, label: label(kind, f.value) }))

  return (
    <Band tone="club" className="max-w-3xl">
      <BandHeading as="h1" title="Stremio Addon.">
        Pick your countries and genres, get <b>only those rows in Stremio.</b> No clutter, dead streams hidden daily.
      </BandHeading>

      <Card>
        <CardHeader>
          <CardTitle>What do you watch?</CardTitle>
          <CardDescription>Each genre becomes a row in Stremio, in the order you pick them.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <FacetFilter
              label="Countries"
              selected={config.countries}
              onChange={(countries) => update({ countries })}
              options={options('countries')}
            />
            <FacetFilter
              label="Genres"
              selected={config.genres}
              onChange={(genres) => update({ genres })}
              options={options('categories')}
            />
            <FacetFilter
              label="Languages"
              selected={config.languages}
              onChange={(languages) => update({ languages })}
              options={options('languages')}
            />
            {hasSelection && (
              <Button variant="ghost" onClick={() => setConfig(emptyConfig)}>
                <IconX /> Clear
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {config.countries.map((c) => (
              <Badge key={c} variant="secondary">
                {label('countries', c)}
              </Badge>
            ))}
            {config.languages.map((l) => (
              <Badge key={l} variant="outline">
                {label('languages', l)}
              </Badge>
            ))}
            {config.genres.map((g, i) => (
              <Badge key={g}>
                {i + 1}. {label('categories', g)}
              </Badge>
            ))}
          </div>

          <FieldGroup>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel>Minimum quality</FieldLabel>
                <FieldDescription>Streams with an unknown quality are kept.</FieldDescription>
              </FieldContent>
              <Select
                items={qualityItems}
                value={String(config.minHeight)}
                onValueChange={(value) => update({ minHeight: Number(value) || 0 })}
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
            </Field>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="nsfw">Include adult channels</FieldLabel>
              </FieldContent>
              <Switch id="nsfw" checked={config.nsfw} onCheckedChange={(nsfw) => update({ nsfw })} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Install.</CardTitle>
          <CardDescription>
            {ready
              ? 'Opens Stremio. Search in Stremio still finds channels from every country.'
              : 'Pick at least one country and one genre first.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {ready ? (
            <a href={installUrl} className={buttonVariants({ size: 'lg' })}>
              Install in Stremio
            </a>
          ) : (
            <Button size="lg" disabled>
              Install in Stremio
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            disabled={!ready}
            onClick={async () => {
              await navigator.clipboard.writeText(manifestUrl)
              toast.add({ type: 'success', title: 'Addon URL copied', description: 'Paste it in Stremio’s addon search box.' })
            }}
          >
            Copy URL
          </Button>
        </CardContent>
      </Card>
    </Band>
  )
}
