import { createFileRoute } from '@tanstack/react-router'
import { handleProxy } from '@/server/proxy'

export const Route = createFileRoute('/api/proxy')({
  server: {
    handlers: {
      GET: ({ request }) => handleProxy(request, process.env.PROXY_SECRET),
    },
  },
})
