import { createFileRoute } from '@tanstack/react-router'
import { FacetIndex } from '@/components/channel/facet-index'

export const Route = createFileRoute('/languages')({
  head: () => ({ meta: [{ title: 'Languages · WarpTV' }] }),
  component: () => (
    <FacetIndex kind="languages" title="Languages" tone="story" blurb={<>Watch in your language, or <b>learn a new one</b> by osmosis.</>} />
  ),
})
