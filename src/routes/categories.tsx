import { createFileRoute } from '@tanstack/react-router'
import { FacetIndex } from '@/components/channel/facet-index'

export const Route = createFileRoute('/categories')({
  head: () => ({ meta: [{ title: 'Categories · WarpTV' }] }),
  component: () => <FacetIndex kind="categories" title="Categories" />,
})
