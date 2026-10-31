import { IconActivity, IconAlertTriangle, IconCheck } from '@tabler/icons-react'
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from '@/components/ui/trace'
import { usePlayerStore } from '@/stores/player'
import type { Attempt } from '@/stores/player'

// Selectors must return stable values, a fresh [] each call re-renders forever.
const none: Attempt[] = []

const lineStatus = (status: Attempt['status']) =>
  status === 'running' ? 'running' : status === 'error' ? 'error' : undefined

/** What the player has tried for this channel, so a quick fallback never feels like magic. */
export function PlaybackLog({ channelId }: { channelId: string }) {
  const playingId = usePlayerStore((s) => s.channel?.id)
  const allAttempts = usePlayerStore((s) => s.attempts)
  const attempts = playingId === channelId ? allAttempts : none
  const last = attempts.at(-1)
  if (!last) return null

  const failures = attempts.filter((a) => a.status === 'error').length
  const summary =
    last.status === 'running'
      ? `Connecting to ${last.title}`
      : last.status === 'ok'
        ? `Playing ${last.title}`
        : `Couldn't play ${last.title}`

  return (
    <Trace>
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine status={lineStatus(last.status)}>
            <TraceIcon>
              <IconActivity />
            </TraceIcon>
            <TraceTitle className={last.status === 'running' ? 'shimmer' : undefined}>{summary}</TraceTitle>
            {failures > 0 && (
              <TraceDescription>
                {failures} {failures === 1 ? 'stream' : 'streams'} failed
              </TraceDescription>
            )}
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <Trace className="gap-1">
            {attempts.map((attempt, i) => (
              <TraceLine key={`${attempt.url}-${i}`} status={lineStatus(attempt.status)}>
                <TraceIcon>
                  {attempt.status === 'ok' ? (
                    <IconCheck />
                  ) : attempt.status === 'error' ? (
                    <IconAlertTriangle />
                  ) : null}
                </TraceIcon>
                <TraceTitle>{attempt.title}</TraceTitle>
                <TraceDescription>
                  {attempt.status === 'error'
                    ? attempt.reason
                    : attempt.status === 'skipped'
                      ? 'Switched manually'
                      : attempt.status === 'ok'
                        ? 'Playing'
                        : 'Connecting'}
                </TraceDescription>
              </TraceLine>
            ))}
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  )
}
