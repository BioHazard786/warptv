import { createFileRoute } from '@tanstack/react-router'
import { FacetIndex } from '@/components/channel/facet-index'

export const Route = createFileRoute('/countries')({
  head: () => ({ meta: [{ title: 'Countries · WarpTV' }] }),
  component: () => (
    <FacetIndex kind="countries" title="Countries" tone="club" blurb={<>Pick a place, <b>any place</b>. Flags included.</>} />
  ),
})
