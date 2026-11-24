import { createFileRoute } from '@tanstack/react-router'
import { handleStremio } from '@/server/stremio/addon'

export const Route = createFileRoute('/stremio/$')({
  server: {
    handlers: {
      GET: ({ request, params }) => handleStremio(request, params._splat ?? ''),
    },
  },
})
