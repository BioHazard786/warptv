import { IconBroadcast, IconCopy, IconExternalLink, IconPlayerPlay } from '@tabler/icons-react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Attachment,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { db } from '@/lib/catalog/db'
import type { FeedRow } from '@/lib/catalog/types'
import { hasRecentFailure, vlcUrl } from '@/lib/streams/resolve'
import { usePlayerStore } from '@/stores/player'

export function StreamList({ feeds }: { feeds: FeedRow[] }) {
  const candidates = usePlayerStore((s) => s.candidates)
  const index = usePlayerStore((s) => s.index)
  const status = usePlayerStore((s) => s.status)
  const select = usePlayerStore((s) => s.select)

  const urls = candidates.map((c) => c.stream.url)
  const health = useLiveQuery(
    async () => new Map((await db.streamHealth.where('url').anyOf(urls).toArray()).map((h) => [h.url, h])),
    [urls.join('|')],
  )
  const feedName = (id: string | null) => feeds.find((f) => f.id === id)?.name

  return (
    <div className="flex flex-col gap-2">
      {candidates.map(({ stream, via }, i) => {
        const record = health?.get(stream.url)
        const active = i === index && status !== 'failed'
        const failed = hasRecentFailure(record)
        const details = [
          feedName(stream.feed),
          stream.quality,
          stream.geoBlocked && 'Geo-blocked',
          stream.not247 && 'Not 24/7',
          via === 'proxy' && 'Via proxy',
          via === 'unavailable' && 'Not playable in browser',
          failed && 'Failed recently',
          !failed && record?.status === 'ok' && 'Worked for you',
        ].filter(Boolean)

        return (
          <Attachment
            key={stream.url}
            className="w-full"
            state={active && status === 'loading' ? 'processing' : failed ? 'error' : 'done'}
          >
            <AttachmentMedia>
              <IconBroadcast />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{stream.title}</AttachmentTitle>
              <AttachmentDescription>{details.join(' · ') || 'Default feed'}</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions className="gap-1">
              {active && status === 'playing' && <Badge>Playing</Badge>}
              {via === 'unavailable' ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      void navigator.clipboard.writeText(stream.url)
                      toast.add({ type: 'success', title: 'Stream URL copied' })
                    }}
                  >
                    <IconCopy /> Copy URL
                  </Button>
                  {stream.kind === 'hls' && (
                    <Button variant="outline" size="sm" nativeButton={false} render={<a href={vlcUrl(stream)} />}>
                      <IconExternalLink /> Open in VLC
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  variant={active ? 'secondary' : 'outline'}
                  size="sm"
                  disabled={active}
                  onClick={() => select(stream.url)}
                >
                  <IconPlayerPlay /> {active ? 'Selected' : 'Play'}
                </Button>
              )}
            </AttachmentActions>
          </Attachment>
        )
      })}
    </div>
  )
}
